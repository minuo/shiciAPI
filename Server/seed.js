const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// 导入模型
const Author = require('./models/Author');
const Poem = require('./models/Poem');
const Tag = require('./models/Tag');
const User = require('./models/User');
const Comment = require('./models/Comment');

// 连接数据库
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB 连接成功');
  } catch (error) {
    console.error('MongoDB 连接失败:', error.message);
    process.exit(1);
  }
};

// 获取chinese-poetry包的路径
const poetryPackagePath = path.join(__dirname, 'node_modules/chinese-poetry');
const innerPoetryPath = path.join(poetryPackagePath, 'chinese-poetry');
const jsonDirPath = path.join(innerPoetryPath, 'json');
const tangDirPath = path.join(innerPoetryPath, 'tang');

// 进度跟踪
let totalAuthors = 0;
let importedAuthors = 0;
let totalPoems = 0;
let importedPoems = 0;
let totalErrors = 0;

// 处理数据格式转换和异常值
const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.trim().replace(/\n+/g, ' ').replace(/\s+/g, ' ');
};

const sanitizeArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr.filter(item => item && typeof item === 'string').map(item => item.trim());
};

// 提取朝代信息
const extractDynasty = (fileName) => {
  if (fileName.includes('tang')) return '唐代';
  if (fileName.includes('song')) return '宋代';
  if (fileName.includes('yuan')) return '元代';
  if (fileName.includes('ming')) return '明代';
  if (fileName.includes('qing')) return '清代';
  return '未知';
};

// 创建用户（保留原功能）
async function createUsers() {
  try {
    // 创建管理员用户
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    let adminUser = await User.findOne({ username: 'admin' });
    if (!adminUser) {
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        createTime: Date.now(),
        updateTime: Date.now()
      });
      console.log('管理员用户创建成功:', adminUser.username);
    }
    
    // 创建普通用户
    const userPassword = await bcrypt.hash('user123', salt);
    let regularUser = await User.findOne({ username: 'user' });
    if (!regularUser) {
      regularUser = await User.create({
        username: 'user',
        email: 'user@example.com',
        password: userPassword,
        role: 'user',
        createTime: Date.now(),
        updateTime: Date.now()
      });
      console.log('普通用户创建成功:', regularUser.username);
    }
    
    return { adminUser, regularUser };
  } catch (error) {
    console.error('创建用户失败:', error);
    return { adminUser: null, regularUser: null };
  }
}

// 导入诗人数据
async function importAuthors() {
  console.log('开始导入诗人数据...');
  
  try {
    // 检查目录是否存在
    if (!fs.existsSync(jsonDirPath)) {
      console.error('诗人数据目录不存在:', jsonDirPath);
      return;
    }
    
    // 读取诗人文件
    const authorFiles = [
      path.join(jsonDirPath, 'authors.tang.json'),
      path.join(jsonDirPath, 'authors.song.json')
    ];
    
    for (const authorFile of authorFiles) {
      if (!fs.existsSync(authorFile)) {
        console.log(`诗人文件不存在，跳过: ${authorFile}`);
        continue;
      }
      
      const dynasty = extractDynasty(authorFile);
      const authorsData = JSON.parse(fs.readFileSync(authorFile, 'utf8'));
      totalAuthors += authorsData.length;
      
      console.log(`处理${dynasty}诗人文件: ${authorsData.length}位诗人`);
      
      // 批量处理
      const batchSize = 100;
      for (let i = 0; i < authorsData.length; i += batchSize) {
        const batch = authorsData.slice(i, i + batchSize);
        
        for (const author of batch) {
          try {
            // 检查是否已存在
            const existingAuthor = await Author.findOne({ name: sanitizeString(author.name) });
            if (existingAuthor) continue;
            
            const newAuthor = new Author({
              name: sanitizeString(author.name),
              description: sanitizeString(author.desc || author.description),
              shortDescription: sanitizeString(author.short_description || ''),
              dynasty: dynasty,
              originalId: author.id || '',
              birthYear: author.birth_year || '',
              deathYear: author.death_year || ''
            });
            
            await newAuthor.save();
            importedAuthors++;
          } catch (err) {
            console.error(`导入诗人 ${author.name || '未知'} 失败:`, err.message);
            totalErrors++;
          }
        }
        
        console.log(`已导入 ${importedAuthors}/${totalAuthors} 位诗人`);
        // 避免数据库压力
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`诗人数据导入完成: 成功${importedAuthors}条，总计${totalAuthors}条，错误${totalErrors}条`);
  } catch (error) {
    console.error('诗人数据导入出错:', error);
    totalErrors++;
  }
}

// 导入诗歌数据
async function importPoems() {
  console.log('开始导入诗歌数据...');
  
  try {
    // 获取所有诗歌文件
    const poemFiles = [];
    
    // 处理json目录中的诗歌文件
    if (fs.existsSync(jsonDirPath)) {
      const jsonFiles = fs.readdirSync(jsonDirPath).filter(file => 
        file.endsWith('.json') && 
        !file.includes('authors') &&
        (file.includes('poet') || file.includes('poems'))
      );
      jsonFiles.forEach(file => poemFiles.push(path.join(jsonDirPath, file)));
    }
    
    // 处理tang目录中的诗歌文件
    if (fs.existsSync(tangDirPath)) {
      const tangFiles = fs.readdirSync(tangDirPath).filter(file => 
        file.endsWith('.json') && file.includes('poet')
      );
      tangFiles.forEach(file => poemFiles.push(path.join(tangDirPath, file)));
    }
    
    console.log(`找到 ${poemFiles.length} 个诗歌文件`);
    
    // 创建常用标签
    const commonTags = ['唐诗', '宋词', '元曲', '古风', '抒情', '山水', '思乡', '战争', '田园', '哲理', '月亮', '愁绪', '壮观'];
    const tagMap = new Map();
    
    for (const tagName of commonTags) {
      try {
        let tag = await Tag.findOne({ name: tagName });
        if (!tag) {
          tag = new Tag({ 
            name: tagName,
            createTime: Date.now(),
            updateTime: Date.now()
          });
          await tag.save();
        }
        tagMap.set(tagName, tag._id);
      } catch (err) {
        console.error(`创建标签 ${tagName} 失败:`, err.message);
      }
    }
    
    // 处理每个诗歌文件
    for (const poemFile of poemFiles) {
      const fileName = path.basename(poemFile);
      const dynasty = extractDynasty(fileName);
      
      try {
        if (!fs.existsSync(poemFile)) {
          console.log(`诗歌文件不存在，跳过: ${poemFile}`);
          continue;
        }
        
        const poemsData = JSON.parse(fs.readFileSync(poemFile, 'utf8'));
        totalPoems += poemsData.length;
        
        console.log(`处理${dynasty}诗歌文件 ${fileName}: ${poemsData.length}首诗`);
        
        // 批量处理
        const batchSize = 50;
        for (let i = 0; i < poemsData.length; i += batchSize) {
          const batch = poemsData.slice(i, i + batchSize);
          
          for (const poem of batch) {
            try {
              // 数据验证
              if (!poem.title || !poem.author || (!poem.paragraphs && !poem.content)) {
                throw new Error('缺少必要字段');
              }
              
              // 检查是否已存在
              const existingPoem = await Poem.findOne({
                title: sanitizeString(poem.title),
                author: sanitizeString(poem.author)
              });
              
              if (existingPoem) continue;
              
              // 查找作者
              const authorName = sanitizeString(poem.author);
              let author = await Author.findOne({ name: authorName });
              
              // 内容处理
              const content = Array.isArray(poem.paragraphs) ? poem.paragraphs : 
                            Array.isArray(poem.content) ? poem.content : [];
              
              const newPoem = new Poem({
                title: sanitizeString(poem.title),
                author: authorName,
                authorId: author ? author._id : null,
                dynasty: dynasty,
                content: sanitizeArray(content),
                originalId: poem.id || poem._id || '',
                originalTags: [],
                createTime: Date.now(),
                updateTime: Date.now()
              });
              
              // 添加朝代标签
              if (dynasty === '唐代' && tagMap.has('唐诗')) {
                newPoem.tags.push(tagMap.get('唐诗'));
              } else if (dynasty === '宋代' && tagMap.has('宋词')) {
                newPoem.tags.push(tagMap.get('宋词'));
              } else if (dynasty === '元代' && tagMap.has('元曲')) {
                newPoem.tags.push(tagMap.get('元曲'));
              }
              
              await newPoem.save();
              importedPoems++;
              
              // 更新作者的作品数量
              if (author) {
                author.worksCount = (author.worksCount || 0) + 1;
                await author.save();
              }
            } catch (err) {
              // 静默处理，只记录错误数
              totalErrors++;
              if (totalErrors % 100 === 0) {
                console.log(`已处理 ${importedPoems} 首诗，当前错误数: ${totalErrors}`);
              }
            }
          }
          
          console.log(`已导入 ${importedPoems}/${totalPoems} 首诗`);
          // 避免数据库压力
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (err) {
        console.error(`处理文件 ${fileName} 失败:`, err.message);
      }
    }
    
    // 更新标签使用次数
    for (const [tagName, tagId] of tagMap.entries()) {
      try {
        const count = await Poem.countDocuments({ tags: tagId });
        await Tag.findByIdAndUpdate(tagId, { usageCount: count, updateTime: Date.now() });
      } catch (err) {
        console.error(`更新标签 ${tagName} 使用次数失败:`, err.message);
      }
    }
    
    console.log(`诗歌数据导入完成: 成功${importedPoems}条，总计${totalPoems}条，错误${totalErrors}条`);
  } catch (error) {
    console.error('诗歌数据导入出错:', error);
    totalErrors++;
  }
}

// 创建一些示例评论
async function createSampleComments(users) {
  try {
    const { regularUser, adminUser } = users;
    if (!regularUser || !adminUser) return;
    
    // 查找一些热门诗歌
    const popularPoems = await Poem.find({}).limit(10);
    
    if (popularPoems.length > 0) {
      const comments = [
        {
          poemId: popularPoems[0]._id,
          userId: regularUser._id,
          content: '这首诗意境深远，令人回味无穷。',
          createTime: Date.now(),
          updateTime: Date.now()
        },
        {
          poemId: popularPoems.length > 1 ? popularPoems[1]._id : popularPoems[0]._id,
          userId: adminUser._id,
          content: '古人的文采真是令人钦佩！',
          createTime: Date.now(),
          updateTime: Date.now()
        }
      ];
      
      for (const commentData of comments) {
        try {
          await Comment.create(commentData);
        } catch (err) {
          console.error('创建示例评论失败:', err.message);
        }
      }
      
      console.log('示例评论创建完成');
    }
  } catch (error) {
    console.error('创建示例评论出错:', error);
  }
}

// 主函数
async function seedDatabase() {
  try {
    // 连接数据库
    await connectDB();
    
    // 清空集合
    console.log('开始清空现有数据...');
    await Poem.deleteMany({});
    await Author.deleteMany({});
    await Tag.deleteMany({});
    // 保留用户数据
    console.log('数据清空完成');
    
    // 创建用户
    const users = await createUsers();
    
    // 导入数据
    await importAuthors();
    await importPoems();
    
    // 创建示例评论
    await createSampleComments(users);
    
    console.log('\n=== 数据导入完成 ===');
    console.log(`诗人: ${importedAuthors}/${totalAuthors}`);
    console.log(`诗歌: ${importedPoems}/${totalPoems}`);
    console.log(`错误: ${totalErrors}`);
    
    process.exit(0);
  } catch (error) {
    console.error('数据库导入失败:', error);
    process.exit(1);
  } finally {
    // 确保数据库连接关闭
    await mongoose.disconnect();
  }
}

// 执行导入
seedDatabase();