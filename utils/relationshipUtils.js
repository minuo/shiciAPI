const Poem = require('../models/Poem');
const Tag = require('../models/Tag');

/**
 * 处理诗词与标签的关联关系
 * @param {Array} tagIds 标签ID数组
 * @returns {Array} 有效标签ID数组
 */
exports.processPoemTagRelationships = async (tagIds) => {
  if (!tagIds || !Array.isArray(tagIds) || tagIds.length === 0) {
    return [];
  }
  
  // 去重
  const uniqueTagIds = [...new Set(tagIds)];
  
  // 验证标签是否存在
  const existingTags = await Tag.find({ _id: { $in: uniqueTagIds } });
  const validTagIds = existingTags.map(tag => tag._id.toString());
  
  // 更新标签使用次数
  if (validTagIds.length > 0) {
    await Tag.updateMany(
      { _id: { $in: validTagIds } },
      { $inc: { usageCount: 1 } }
    );
  }
  
  return validTagIds;
};

/**
 * 移除诗词与标签的关联关系
 * @param {Array} tagIds 标签ID数组
 */
exports.removePoemTagRelationships = async (tagIds) => {
  if (!tagIds || !Array.isArray(tagIds) || tagIds.length === 0) {
    return;
  }
  
  // 去重
  const uniqueTagIds = [...new Set(tagIds)];
  
  // 减少标签使用次数
  await Tag.updateMany(
    { _id: { $in: uniqueTagIds } },
    { $inc: { usageCount: -1 } }
  );
  
  // 确保usageCount不会小于0
  await Tag.updateMany(
    { usageCount: { $lt: 0 } },
    { usageCount: 0 }
  );
};

/**
 * 同步更新诗词标签关系
 * @param {String} poemId 诗词ID
 * @param {Array} oldTags 旧标签ID数组
 * @param {Array} newTags 新标签ID数组
 * @returns {Array} 更新后的标签ID数组
 */
exports.syncPoemTags = async (poemId, oldTags, newTags) => {
  oldTags = oldTags || [];
  newTags = newTags || [];
  
  // 确保数组格式
  const oldTagSet = new Set(oldTags.map(t => t.toString()));
  const newTagSet = new Set(newTags.map(t => t.toString()));
  
  // 找出需要添加和移除的标签
  const tagsToAdd = [...newTagSet].filter(tag => !oldTagSet.has(tag));
  const tagsToRemove = [...oldTagSet].filter(tag => !newTagSet.has(tag));
  
  // 并行处理添加和移除操作
  await Promise.all([
    tagsToAdd.length > 0 ? exports.processPoemTagRelationships(tagsToAdd) : Promise.resolve(),
    tagsToRemove.length > 0 ? exports.removePoemTagRelationships(tagsToRemove) : Promise.resolve()
  ]);
  
  // 返回有效的新标签ID（验证标签存在性）
  return await exports.processPoemTagRelationships(tagsToAdd);
};

/**
 * 通过标签名称或ID查找对应的标签对象
 * @param {Array|String} tagIdentifiers 标签名称或ID的数组或单个值
 * @returns {Array} 找到的标签对象数组
 */
exports.findTagsByIdentifiers = async (tagIdentifiers) => {
  if (!tagIdentifiers) {
    return [];
  }
  
  // 标准化为数组
  const tagArray = Array.isArray(tagIdentifiers) 
    ? tagIdentifiers 
    : typeof tagIdentifiers === 'string' 
      ? tagIdentifiers.split(',') 
      : [];
  
  if (tagArray.length === 0) {
    return [];
  }
  
  // 查询标签
  return await Tag.find({
    $or: [
      { _id: { $in: tagArray } },
      { name: { $in: tagArray } }
    ]
  });
};

/**
 * 获取标签对应的诗词分页数据
 * @param {String} tagId 标签ID
 * @param {Object} pagination 分页参数
 * @returns {Object} 包含诗词列表和分页信息
 */
exports.getTagPoems = async (tagId, pagination = {}) => {
  const { page = 1, size = 10, sort = '-createTime' } = pagination;
  const pageNum = parseInt(page);
  const pageSize = parseInt(size);
  const skip = (pageNum - 1) * pageSize;
  
  // 查询诗词
  const poems = await Poem.find({ tags: tagId })
    .sort(sort)
    .skip(skip)
    .limit(pageSize)
    .populate('tags', 'name')
    .lean();
  
  // 获取总数
  const total = await Poem.countDocuments({ tags: tagId });
  
  return {
    list: poems,
    pagination: {
      page: pageNum,
      size: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  };
};