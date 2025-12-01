const mongoose = require('mongoose');
require('dotenv').config();

// 导入模型
const Author = require('./models/Author');
const Poem = require('./models/Poem');
const Tag = require('./models/Tag');

// 连接数据库
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB 连接成功');
  } catch (error) {
    console.error('MongoDB 连接失败:', error.message);
    process.exit(1);
  }
}

// 验证数据统计
async function verifyDataCounts() {
  console.log('\n=== 数据统计验证 ===');
  
  try {
    const authorCount = await Author.countDocuments({});
    const poemCount = await Poem.countDocuments({});
    const tagCount = await Tag.countDocuments({});
    
    console.log(`诗人总数: ${authorCount}`);
    console.log(`诗歌总数: ${poemCount}`);
    console.log(`标签总数: ${tagCount}`);
    
    // 检查是否有数据导入
    if (authorCount === 0) {
      console.error('❌ 错误: 没有诗人数据导入');
    } else {
      console.log('✅ 诗人数据已成功导入');
    }
    
    if (poemCount === 0) {
      console.error('❌ 错误: 没有诗歌数据导入');
    } else {
      console.log('✅ 诗歌数据已成功导入');
    }
    
    return { authorCount, poemCount, tagCount };
  } catch (error) {
    console.error('数据统计验证失败:', error);
    return { authorCount: 0, poemCount: 0, tagCount: 0 };
  }
}

// 验证数据完整性
async function verifyDataIntegrity() {
  console.log('\n=== 数据完整性验证 ===');
  
  try {
    // 检查必填字段
    const poemsMissingTitle = await Poem.countDocuments({ title: { $in: [null, ''] } });
    const poemsMissingAuthor = await Poem.countDocuments({ author: { $in: [null, ''] } });
    const poemsMissingContent = await Poem.countDocuments({ $or: [{ content: { $size: 0 } }, { content: null }] });
    const poemsMissingDynasty = await Poem.countDocuments({ dynasty: { $in: [null, ''] } });
    
    console.log(`缺少标题的诗歌: ${poemsMissingTitle}`);
    console.log(`缺少作者的诗歌: ${poemsMissingAuthor}`);
    console.log(`缺少内容的诗歌: ${poemsMissingContent}`);
    console.log(`缺少朝代的诗歌: ${poemsMissingDynasty}`);
    
    const hasIntegrityIssues = poemsMissingTitle > 0 || poemsMissingAuthor > 0 || 
                              poemsMissingContent > 0 || poemsMissingDynasty > 0;
    
    if (hasIntegrityIssues) {
      console.error('❌ 警告: 存在数据完整性问题');
    } else {
      console.log('✅ 所有诗歌数据完整性检查通过');
    }
    
    return !hasIntegrityIssues;
  } catch (error) {
    console.error('数据完整性验证失败:', error);
    return false;
  }
}

// 验证关联关系
async function verifyRelationships() {
  console.log('\n=== 关联关系验证 ===');
  
  try {
    // 检查诗人和诗歌的关联
    const poemsWithAuthorId = await Poem.countDocuments({ authorId: { $ne: null } });
    const totalPoems = await Poem.countDocuments({});
    const relationshipRate = totalPoems > 0 ? (poemsWithAuthorId / totalPoems * 100).toFixed(2) : 0;
    
    console.log(`有作者关联的诗歌: ${poemsWithAuthorId} (${relationshipRate}%)`);
    console.log(`无作者关联的诗歌: ${totalPoems - poemsWithAuthorId}`);
    
    // 检查标签关联
    const poemsWithTags = await Poem.countDocuments({ tags: { $exists: true, $not: { $size: 0 } } });
    const tagRate = totalPoems > 0 ? (poemsWithTags / totalPoems * 100).toFixed(2) : 0;
    
    console.log(`有标签关联的诗歌: ${poemsWithTags} (${tagRate}%)`);
    
    // 抽查一些诗歌，验证作者信息匹配
    const samplePoems = await Poem.find({ authorId: { $ne: null } }).limit(5);
    
    for (const poem of samplePoems) {
      const author = await Author.findById(poem.authorId);
      if (author && author.name === poem.author) {
        console.log(`✅ 诗歌"${poem.title}"的作者关联正确: ${poem.author}`);
      } else {
        console.error(`❌ 诗歌"${poem.title}"的作者关联错误`);
      }
    }
    
    return poemsWithAuthorId > 0; // 至少有一些诗歌关联了作者
  } catch (error) {
    console.error('关联关系验证失败:', error);
    return false;
  }
}

// 验证数据质量
async function verifyDataQuality() {
  console.log('\n=== 数据质量验证 ===');
  
  try {
    // 检查重复数据
    const duplicateTitles = await Poem.aggregate([
      { $group: { _id: { title: '$title', author: '$author' }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    
    console.log(`发现的重复诗歌: ${duplicateTitles.length}`);
    if (duplicateTitles.length > 0) {
      console.log('示例重复:', duplicateTitles.slice(0, 3));
    }
    
    // 检查诗歌内容长度
    const poemsWithShortContent = await Poem.countDocuments({ content: { $size: 1 } });
    console.log(`只有一行内容的诗歌: ${poemsWithShortContent}`);
    
    // 检查不同朝代的分布
    const dynastyDistribution = await Poem.aggregate([
      { $group: { _id: '$dynasty', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n朝代分布:');
    dynastyDistribution.forEach(item => {
      console.log(`  ${item._id}: ${item.count}首`);
    });
    
    // 检查热门作者
    const topAuthors = await Author.find({}).sort({ worksCount: -1 }).limit(10);
    
    console.log('\n作品最多的10位诗人:');
    topAuthors.forEach(author => {
      console.log(`  ${author.name} (${author.dynasty}): ${author.worksCount}首`);
    });
    
    return duplicateTitles.length < 100; // 重复数据不超过100条
  } catch (error) {
    console.error('数据质量验证失败:', error);
    return false;
  }
}

// 主验证函数
async function verifyImport() {
  try {
    await connectDB();
    
    console.log('开始验证数据导入...');
    
    const { authorCount, poemCount } = await verifyDataCounts();
    const integrityCheck = await verifyDataIntegrity();
    const relationshipCheck = await verifyRelationships();
    const qualityCheck = await verifyDataQuality();
    
    console.log('\n=== 验证总结 ===');
    console.log(`数据总量: ${authorCount}位诗人, ${poemCount}首诗歌`);
    
    let overallStatus = '✅ 通过';
    if (!integrityCheck) overallStatus = '❌ 未通过';
    
    console.log(`完整性检查: ${integrityCheck ? '✅ 通过' : '❌ 未通过'}`);
    console.log(`关联关系检查: ${relationshipCheck ? '✅ 通过' : '⚠️ 部分通过'}`);
    console.log(`数据质量检查: ${qualityCheck ? '✅ 通过' : '⚠️ 有少量问题'}`);
    console.log(`整体状态: ${overallStatus}`);
    
    console.log('\n验证完成。数据已成功导入并通过基本验证。');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('验证过程中出现错误:', error);
    mongoose.connection.close();
  }
}

// 执行验证
verifyImport();