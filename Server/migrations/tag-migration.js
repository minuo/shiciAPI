// 导入依赖
require('dotenv').config(); // 加载环境变量
const mongoose = require('mongoose');
const Poem = require('../models/Poem');
const Tag = require('../models/Tag');

// 数据库配置 - 设置默认连接字符串以确保迁移顺利执行
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/poemdb';

// 连接数据库
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB 连接成功');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    // 为了开发环境测试目的，不立即退出，而是继续执行后续流程
    console.log('⚠️  由于数据库连接失败，将尝试继续执行');
  }
}

// 断开数据库连接
async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('✅ 数据库连接已断开');
  } catch (error) {
    console.error('❌ 断开数据库连接失败:', error.message);
  }
}

// 数据迁移主函数
async function migrateTags() {
  console.log('🚀 开始标签数据迁移...');
  
  try {
    // 1. 收集所有唯一的标签
    console.log('📊 收集所有唯一标签...');
    const allPoems = await Poem.find({});
    const tagMap = new Map();
    
    allPoems.forEach(poem => {
      if (poem.tags && Array.isArray(poem.tags)) {
        poem.tags.forEach(tagName => {
          if (typeof tagName === 'string' && tagName.trim()) {
            const trimmedName = tagName.trim();
            tagMap.set(trimmedName, (tagMap.get(trimmedName) || 0) + 1);
          }
        });
      }
    });
    
    console.log(`✨ 发现 ${tagMap.size} 个唯一标签`);
    
    // 2. 创建Tag文档
    console.log('📝 创建Tag文档...');
    const tagNameToIdMap = new Map();
    const batchSize = 100;
    const tagEntries = Array.from(tagMap.entries());
    
    for (let i = 0; i < tagEntries.length; i += batchSize) {
      const batch = tagEntries.slice(i, i + batchSize);
      const tagDocs = batch.map(([name, count]) => ({
        name,
        usageCount: count
      }));
      
      // 使用bulkWrite批量创建，避免重复
      const operations = tagDocs.map(doc => ({
        updateOne: {
          filter: { name: doc.name },
          update: { $set: doc },
          upsert: true
        }
      }));
      
      await Tag.bulkWrite(operations);
    }
    
    // 获取所有创建的Tag的ID映射
    const allTags = await Tag.find({});
    allTags.forEach(tag => {
      tagNameToIdMap.set(tag.name, tag._id);
    });
    
    // 3. 更新Poem文档中的标签引用
    console.log('🔄 更新Poem文档中的标签引用...');
    let updatedCount = 0;
    
    for (const poem of allPoems) {
      if (poem.tags && Array.isArray(poem.tags) && poem.tags.length > 0) {
        const stringTags = poem.tags.filter(tag => typeof tag === 'string');
        if (stringTags.length > 0) {
          // 将字符串标签转换为ObjectId
          const tagIds = stringTags
            .map(tagName => tagName.trim())
            .filter(tagName => tagNameToIdMap.has(tagName))
            .map(tagName => tagNameToIdMap.get(tagName));
          
          if (tagIds.length > 0) {
            await Poem.findByIdAndUpdate(poem._id, {
              tags: tagIds
            });
            updatedCount++;
          }
        }
      }
    }
    
    // 4. 更新Tag的usageCount（确保准确性）
    console.log('📈 更新标签使用次数...');
    const tagStats = await Poem.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } }
    ]);
    
    for (const stat of tagStats) {
      await Tag.findByIdAndUpdate(stat._id, {
        usageCount: stat.count
      });
    }
    
    console.log('✅ 数据迁移完成！');
    console.log(`📊 统计信息：`);
    console.log(`   - 创建的标签数量: ${tagNameToIdMap.size}`);
    console.log(`   - 更新的诗词数量: ${updatedCount}`);
    
    return true;
  } catch (error) {
    console.error('❌ 数据迁移失败:', error.message);
    console.error(error.stack);
    return false;
  }
}

// 验证迁移结果
async function verifyMigration() {
  console.log('🔍 验证迁移结果...');
  
  try {
    // 检查是否还有字符串类型的标签
    const poemsWithStringTags = await Poem.find({
      tags: { $type: 'string' }
    });
    
    if (poemsWithStringTags.length > 0) {
      console.warn(`⚠️  发现 ${poemsWithStringTags.length} 个诗词仍包含字符串类型的标签`);
    } else {
      console.log('✅ 所有诗词的标签已成功转换为ObjectId类型');
    }
    
    // 统计标签使用情况
    const tagCount = await Tag.countDocuments();
    const poemCount = await Poem.countDocuments();
    
    console.log(`📊 验证统计：`);
    console.log(`   - 标签总数: ${tagCount}`);
    console.log(`   - 诗词总数: ${poemCount}`);
    
    return poemsWithStringTags.length === 0;
  } catch (error) {
    console.error('❌ 验证失败:', error.message);
    return false;
  }
}

// 主函数
async function main() {
  try {
    await connectDB();
    
    // 执行迁移
    const migrationSuccess = await migrateTags();
    
    if (migrationSuccess) {
      // 验证迁移结果
      await verifyMigration();
    }
  } finally {
    await disconnectDB();
  }
}

// 执行主函数
if (require.main === module) {
  main();
}

module.exports = { migrateTags, verifyMigration };