const Poem = require('../models/Poem');
const Tag = require('../models/Tag');
const { success, error } = require('../utils/response');

// 诗词列表查询
const list = async (req, res) => {
  try {
    // 解析查询参数
    const { page = 1, size = 10, dynasty, author, tags, sort = '-createTime' } = req.query;
    const query = {};
    
    // 构建查询条件
    if (dynasty) query.dynasty = dynasty;
    if (author) query.author = { $regex: author, $options: 'i' };
    if (tags) {
      // 支持多个标签查询
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      // 先查询标签是否存在并获取对应的ObjectId
      const existingTags = await Tag.find({ 
        $or: [
          { _id: { $in: tagArray } },  // 直接匹配ObjectId
          { name: { $in: tagArray } }  // 匹配标签名称
        ] 
      });
      // 如果找到匹配的标签，使用其ObjectId进行查询
      if (existingTags.length > 0) {
        const tagIds = existingTags.map(tag => tag._id);
        query.tags = { $in: tagIds };
      } else {
        // 如果没有找到匹配的标签，则返回空结果
        query._id = null; // 确保不会返回任何结果
      }
    }
    
    // 计算分页
    const pageNum = parseInt(page);
    const pageSize = parseInt(size);
    const skip = (pageNum - 1) * pageSize;
    
    // 查询数据，填充标签详情
    const poems = await Poem.find(query)
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .populate('tags', 'name description usageCount'); // 填充标签详情
    
    const total = await Poem.countDocuments(query);
    console.log('查询到的总诗词数:', total);
    success(res, {
      list: poems,
      pagination: {
        page: pageNum,
        size: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }, '查询成功');
  } catch (err) {
    error(res, 500, '获取诗词列表失败', err.message);
  }
};

// 随机获取一首诗词
const random = async (req, res) => {
  try {
    // 获取诗词总数
    const count = await Poem.countDocuments();
    if (count === 0) {
      return error(res, 404, '暂无诗词数据');
    }
    
    // 随机获取一条
    const randomIndex = Math.floor(Math.random() * count);
    const poem = await Poem.findOne().skip(randomIndex).populate('tags', 'name description usageCount');
    
    success(res, poem, '获取成功');
  } catch (err) {
    error(res, 500, '获取随机诗词失败', err.message);
  }
};

// 获取诗词详情
const detail = async (req, res) => {
  try {
    const poem = await Poem.findById(req.params.id).populate('tags', 'name description usageCount');
    if (!poem) {
      return error(res, 404, '诗词不存在');
    }
    success(res, poem, '获取成功');
  } catch (err) {
    error(res, 500, '获取诗词详情失败', err.message);
  }
};

// 处理标签关联
const processTags = async (tagIds) => {
  if (!tagIds || tagIds.length === 0) {
    return [];
  }
  
  // 验证所有标签是否存在
  const existingTags = await Tag.find({ _id: { $in: tagIds } });
  const existingTagIds = existingTags.map(tag => tag._id.toString());
  
  // 更新标签使用次数
  await Tag.updateMany(
    { _id: { $in: existingTagIds } },
    { $inc: { usageCount: 1 } }
  );
  
  return existingTagIds;
};

// 移除标签关联
const removeTagAssociations = async (tagIds) => {
  if (!tagIds || tagIds.length === 0) {
    return;
  }
  
  // 减少标签使用次数
  await Tag.updateMany(
    { _id: { $in: tagIds } },
    { $inc: { usageCount: -1 } }
  );
};

// 创建诗词
const create = async (req, res) => {
  try {
    const { tags, ...otherData } = req.body;
    
    // 处理标签关联
    const validTagIds = tags ? await processTags(tags) : [];
    
    // 创建诗词
    const poem = new Poem({
      ...otherData,
      tags: validTagIds
    });
    
    await poem.save();
    
    // 填充标签详情并返回
    const createdPoem = await Poem.findById(poem._id).populate('tags', 'name description usageCount');
    
    success(res, createdPoem, '创建成功');
  } catch (err) {
    console.error('创建诗词失败:', err);
    error(res, 500, '创建诗词失败', err.message);
  }
};

// 更新诗词
const update = async (req, res) => {
  try {
    const { tags, ...otherData } = req.body;
    
    // 查找原有诗词
    const existingPoem = await Poem.findById(req.params.id);
    if (!existingPoem) {
      return error(res, 404, '诗词不存在');
    }
    
    // 处理标签变更
    if (tags !== undefined) {
      // 获取原有标签和新标签的差异
      const oldTags = existingPoem.tags || [];
      const newTags = tags || [];
      
      // 移除不再使用的标签关联
      const removedTags = oldTags.filter(tag => !newTags.includes(tag.toString()));
      await removeTagAssociations(removedTags);
      
      // 添加新标签关联
      const addedTags = newTags.filter(tag => !oldTags.some(oldTag => oldTag.toString() === tag));
      const validAddedTagIds = await processTags(addedTags);
      
      // 合并标签（保留已存在的有效标签，添加新验证过的标签）
      const retainedTags = oldTags.filter(tag => !removedTags.includes(tag.toString()));
      const updatedTags = [...retainedTags, ...validAddedTagIds];
      
      // 更新诗词数据
      const updatedPoem = await Poem.findByIdAndUpdate(
        req.params.id,
        { ...otherData, tags: updatedTags },
        { new: true }
      );
      
      // 填充标签详情并返回
      const result = await Poem.findById(updatedPoem._id).populate('tags', 'name description usageCount');
      
      success(res, result, '更新成功');
    } else {
      // 不更新标签，直接更新其他数据
      const updatedPoem = await Poem.findByIdAndUpdate(req.params.id, otherData, { new: true });
      const result = await Poem.findById(updatedPoem._id).populate('tags', 'name description usageCount');
      
      success(res, result, '更新成功');
    }
  } catch (err) {
    console.error('更新诗词失败:', err);
    error(res, 500, '更新诗词失败', err.message);
  }
};

// 删除诗词
const deletePoem = async (req, res) => {
  try {
    // 查找并删除诗词
    const poem = await Poem.findByIdAndDelete(req.params.id);
    if (!poem) {
      return error(res, 404, '诗词不存在');
    }
    
    // 更新相关标签的使用次数
    if (poem.tags && poem.tags.length > 0) {
      await removeTagAssociations(poem.tags);
    }
    
    success(res, null, '删除成功');
  } catch (err) {
    console.error('删除诗词失败:', err);
    error(res, 500, '删除诗词失败', err.message);
  }
};

// 诗词点赞
const like = async (req, res) => {
  try {
    const poem = await Poem.findByIdAndUpdate(
      req.params.id,
      { $inc: { likeCount: 1 } },
      { new: true }
    );
    if (!poem) {
      return error(res, 404, '诗词不存在');
    }
    success(res, { likeCount: poem.likeCount }, '点赞成功');
  } catch (err) {
    error(res, 500, '点赞失败', err.message);
  }
};

module.exports = { list, random, detail, create, update, delete: deletePoem, like };