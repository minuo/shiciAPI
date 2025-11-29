const Tag = require('../models/Tag');
const Poem = require('../models/Poem');
const { success, error } = require('../utils/response');

/**
 * 获取标签列表
 * @param {*} req 请求对象
 * @param {*} res 响应对象
 */
exports.getTags = async (req, res) => {
  try {
    // 获取查询参数
    const { page = 1, size = 20, sortBy = 'usageCount', order = 'desc', keyword = '' } = req.query;
    const skip = (page - 1) * size;
    
    // 构建查询条件
    const query = {};
    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' };
    }
    
    // 构建排序条件
    const sortOptions = { [sortBy]: order === 'desc' ? -1 : 1 };
    
    // 执行查询
    const tags = await Tag.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(size))
      .lean();
    
    const total = await Tag.countDocuments(query);
    
    return success(res, {
      tags,
      pagination: {
        total,
        page: parseInt(page),
        size: parseInt(size),
        pages: Math.ceil(total / size)
      }
    });
  } catch (error) {
    console.error('获取标签列表失败:', error);
    return error(res, 500, '获取标签列表失败');
  }
};

/**
 * 获取热门标签
 * @param {*} req 请求对象
 * @param {*} res 响应对象
 */
exports.getPopularTags = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const tags = await Tag.find({})
      .sort({ usageCount: -1 })
      .limit(parseInt(limit))
      .select('name usageCount')
      .lean();
    
    return success(res, { tags });
  } catch (error) {
    console.error('获取热门标签失败:', error);
    return error(res, 500, '获取热门标签失败');
  }
};

/**
 * 获取标签详情
 * @param {*} req 请求对象
 * @param {*} res 响应对象
 */
exports.getTagById = async (req, res) => {
  try {
    const { id } = req.params;
    const { includePoems = false, poemPage = 1, poemSize = 5 } = req.query;
    
    // 获取标签基本信息
    const tag = await Tag.findById(id).lean();
    if (!tag) {
      return error(res, 404, '标签不存在');
    }
    
    // 如果需要包含相关诗词
    if (includePoems === 'true') {
      const pageNum = parseInt(poemPage);
      const pageSize = parseInt(poemSize);
      const skip = (pageNum - 1) * pageSize;
      
      // 查询该标签相关的诗词
      const poems = await Poem.find({ tags: id })
        .sort({ createTime: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate('tags', 'name')
        .lean();
      
      const totalPoems = await Poem.countDocuments({ tags: id });
      
      return success(res, {
        tag,
        poems: {
          list: poems,
          pagination: {
            page: pageNum,
            size: pageSize,
            total: totalPoems,
            totalPages: Math.ceil(totalPoems / pageSize)
          }
        }
      });
    }
    
    return success(res, { tag });
  } catch (error) {
    console.error('获取标签详情失败:', error);
    return error(res, 500, '获取标签详情失败');
  }
};

/**
 * 创建标签
 * @param {*} req 请求对象
 * @param {*} res 响应对象
 */
exports.createTag = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // 验证必填字段
    if (!name || !name.trim()) {
      return error(res, 400, '标签名称不能为空');
    }
    
    // 检查标签是否已存在
    const existingTag = await Tag.findOne({ name: name.trim() });
    if (existingTag) {
      return error(res, 400, '标签已存在');
    }
    
    // 创建新标签
    const tag = new Tag({
      name: name.trim(),
      description: description || ''
    });
    
    await tag.save();
    
    return success(res, { tag }, 201, '标签创建成功');
  } catch (error) {
    console.error('创建标签失败:', error);
    return error(res, 500, '创建标签失败');
  }
};

/**
 * 更新标签
 * @param {*} req 请求对象
 * @param {*} res 响应对象
 */
exports.updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // 查找标签
    const tag = await Tag.findById(id);
    if (!tag) {
      return error(res, 404, '标签不存在');
    }
    
    // 如果更新名称，检查是否与其他标签重复
    if (name && name.trim() !== tag.name) {
      const existingTag = await Tag.findOne({ name: name.trim(), _id: { $ne: id } });
      if (existingTag) {
        return error(res, 400, '标签名称已存在');
      }
      tag.name = name.trim();
    }
    
    // 更新描述
    if (description !== undefined) {
      tag.description = description;
    }
    
    await tag.save();
    
    return success(res, { tag }, 200, '标签更新成功');
  } catch (error) {
    console.error('更新标签失败:', error);
    return error(res, 500, '更新标签失败');
  }
};

/**
 * 删除标签
 * @param {*} req 请求对象
 * @param {*} res 响应对象
 */
exports.deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 查找标签
    const tag = await Tag.findById(id);
    if (!tag) {
      return error(res, 404, '标签不存在');
    }
    
    // 检查是否有诗词使用该标签
    const poemCount = await Poem.countDocuments({ tags: id });
    if (poemCount > 0) {
      return error(res, 400, `该标签正在被 ${poemCount} 首诗词使用，无法删除`);
    }
    
    // 删除标签
    await Tag.findByIdAndDelete(id);
    
    return success(res, null, 200, '标签删除成功');
  } catch (error) {
    console.error('删除标签失败:', error);
    return error(res, 500, '删除标签失败');
  }
};

/**
 * 批量创建标签
 * @param {*} req 请求对象
 * @param {*} res 响应对象
 */
exports.bulkCreateTags = async (req, res) => {
  try {
    const { tags } = req.body;
    
    if (!Array.isArray(tags) || tags.length === 0) {
      return error(res, 400, '请提供标签数组');
    }
    
    // 去重并验证
    const uniqueTags = [...new Set(tags.map(tag => 
      typeof tag === 'string' ? tag.trim() : 
      typeof tag === 'object' && tag ? (tag.name || '').trim() : ''
    ).filter(name => name))];
    
    // 检查已存在的标签
    const existingTags = await Tag.find({ name: { $in: uniqueTags } });
    const existingTagNames = new Set(existingTags.map(tag => tag.name));
    
    // 创建新标签
    const newTags = uniqueTags
      .filter(name => !existingTagNames.has(name))
      .map(name => new Tag({ name }));
    
    let createdCount = 0;
    if (newTags.length > 0) {
      const result = await Tag.insertMany(newTags);
      createdCount = result.length;
    }
    
    return success(res, {
      created: createdCount,
      existing: existingTags.length,
      total: uniqueTags.length,
      existingTags: existingTags.map(tag => ({ id: tag._id, name: tag.name }))
    }, 200, `成功创建 ${createdCount} 个标签，${existingTags.length} 个标签已存在`);
  } catch (error) {
    console.error('批量创建标签失败:', error);
    return error(res, 500, '批量创建标签失败');
  }
};