const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 导入模型
const Poem = require('./models/Poem');
const User = require('./models/User');
const Comment = require('./models/Comment');
const Tag = require('./models/Tag');

// 初始标签数据
const initialTags = [
  { name: '思乡' },
  { name: '月亮' },
  { name: '唐诗' },
  { name: '战乱' },
  { name: '山水' },
  { name: '壮观' },
  { name: '哲理' },
  { name: '愁绪' },
  { name: '五代词' }
];

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

// 初始诗词数据
const poems = [
  {
    title: '静夜思',
    author: '李白',
    dynasty: '唐',
    content: ['床前明月光，疑是地上霜。', '举头望明月，低头思故乡。'],
    tagNames: ['思乡', '月亮', '唐诗'],
    likeCount: 0
  },
  {
    title: '春望',
    author: '杜甫',
    dynasty: '唐',
    content: ['国破山河在，城春草木深。', '感时花溅泪，恨别鸟惊心。', '烽火连三月，家书抵万金。', '白头搔更短，浑欲不胜簪。'],
    tagNames: ['战乱', '思乡', '唐诗'],
    likeCount: 0
  },
  {
    title: '望庐山瀑布',
    author: '李白',
    dynasty: '唐',
    content: ['日照香炉生紫烟，遥看瀑布挂前川。', '飞流直下三千尺，疑是银河落九天。'],
    tagNames: ['山水', '壮观', '唐诗'],
    likeCount: 0
  },
  {
    title: '登鹳雀楼',
    author: '王之涣',
    dynasty: '唐',
    content: ['白日依山尽，黄河入海流。', '欲穷千里目，更上一层楼。'],
    tagNames: ['哲理', '山水', '唐诗'],
    likeCount: 0
  },
  {
    title: '相见欢',
    author: '李煜',
    dynasty: '五代',
    content: ['无言独上西楼，月如钩。', '寂寞梧桐深院锁清秋。', '剪不断，理还乱，是离愁。', '别是一般滋味在心头。'],
    tagNames: ['思乡', '愁绪', '五代词'],
    likeCount: 0
  }
];

// 初始化数据
const seedData = async () => {
  try {
    // 连接数据库
    await connectDB();

    // 清空现有数据
    await Poem.deleteMany({});
    await User.deleteMany({});
    await Comment.deleteMany({});
    await Tag.deleteMany({});
    console.log('已清空现有数据');

    // 创建管理员用户
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    console.log('管理员用户创建成功:', adminUser.username);

    // 创建普通用户
    const userPassword = await bcrypt.hash('user123', salt);
    const regularUser = await User.create({
      username: 'user',
      email: 'user@example.com',
      password: userPassword,
      role: 'user',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    console.log('普通用户创建成功:', regularUser.username);

    // 创建标签数据
    const createdTags = {};
    // 先创建所有标签
    for (const tagData of initialTags) {
      try {
        const tag = await Tag.create(tagData);
        createdTags[tag.name] = tag._id;
      } catch (error) {
        console.log(`创建标签 ${tagData.name} 失败:`, error.message);
      }
    }
    console.log(`成功创建 ${Object.keys(createdTags).length} 个标签`);

    // 创建诗词数据，关联标签
    const createdPoems = [];
    for (const poemData of poems) {
      const { tagNames, ...poemDetails } = poemData;
      
      // 将标签名称转换为ObjectId数组
      const tagIds = [];
      for (const name of tagNames) {
        if (createdTags[name]) {
          tagIds.push(createdTags[name]);
        }
      }
      
      try {
        // 创建诗词
        const poem = await Poem.create({
          ...poemDetails,
          tags: tagIds
        });
        createdPoems.push(poem);
      } catch (error) {
        console.log(`创建诗词 ${poemDetails.title} 失败:`, error.message);
      }
    }
    
    // 这个日志已经在循环完成后输出了，移除重复
    
    // 简单地更新标签使用次数（避免复杂的聚合操作）
    for (const name in createdTags) {
      const tagId = createdTags[name];
      const count = createdPoems.filter(poem => poem.tags.includes(tagId)).length;
      try {
        await Tag.findByIdAndUpdate(tagId, { usageCount: count });
      } catch (error) {
        console.log(`更新标签 ${name} 使用次数失败:`, error.message);
      }
    }
    console.log(`成功创建 ${createdPoems.length} 首诗词并关联标签`);

    // 创建一些评论
    if (createdPoems.length > 0) {
      const comments = [
        {
          poemId: createdPoems[0]._id,
          userId: regularUser._id,
          content: '这首诗写得真好，表达了浓浓的思乡之情。',
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          poemId: createdPoems[1]._id,
          userId: adminUser._id,
          content: '杜甫的诗总是充满家国情怀，令人动容。',
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ];
      const createdComments = await Comment.create(comments);
      console.log(`成功创建 ${createdComments.length} 条评论`);
    }

    console.log('数据初始化完成');
    process.exit(0);
  } catch (error) {
    console.error('数据初始化失败:', error.message);
    process.exit(1);
  } finally {
    // 确保数据库连接关闭
    await mongoose.disconnect();
  }
};

// 执行数据初始化
seedData();