const Comment = require('../models/Comment');
const Poem = require('../models/Poem');
const { success, error } = require('../utils/response');

// 创建评论
const create = async (req, res) => {
  try {
    const { poemId } = req.params;
    const { content } = req.body;
    
    // 检查诗词是否存在
    const poem = await Poem.findById(poemId);
    if (!poem) {
      return error(res, 404, '诗词不存在');
    }
    
    // 创建评论
    const comment = new Comment({
      poemId,
      userId: req.user.id,
      content
    });
    
    await comment.save();
    success(res, comment, '评论成功');
  } catch (err) {
    error(res, 500, '评论失败', err.message);
  }
};

// 获取评论列表
const list = async (req, res) => {
  try {
    const { poemId } = req.params;
    const { page = 1, size = 10 } = req.query;
    
    // 检查诗词是否存在
    const poem = await Poem.findById(poemId);
    console.log('查询到的诗词:', poem);
    if (!poem) {
      return error(res, 404, '诗词不存在');
    }
    
    // 计算分页
    const pageNum = parseInt(page);
    const pageSize = parseInt(size);
    const skip = (pageNum - 1) * pageSize;
    
    // 查询评论
    const comments = await Comment.find({ poemId })
      .sort('-createTime')
      .skip(skip)
      .limit(pageSize)
      .populate('userId', 'username'); // 关联用户信息
    
    const total = await Comment.countDocuments({ poemId });
    
    success(res, {
      list: comments,
      pagination: {
        page: pageNum,
        size: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }, '查询成功');
  } catch (err) {
    error(res, 500, '获取评论列表失败', err.message);
  }
};

module.exports = { create, list };