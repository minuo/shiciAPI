const Author = require('../models/Author');
const Poem = require('../models/Poem');
const { success, error, badRequest } = require('../utils/response');

// 获取作者列表
const list = async (req, res) => {
  try {
    // 解析查询参数
    const { page = 1, size = 10, dynasty, keyword, sort = '-worksCount' } = req.query;
    const query = {};
    
    // 构建查询条件
    if (dynasty) query.dynasty = dynasty;
    if (keyword) query.name = { $regex: keyword, $options: 'i' };
    
    // 计算分页
    const pageNum = parseInt(page);
    const pageSize = parseInt(size);
    const skip = (pageNum - 1) * pageSize;
    
    // 查询数据
    const authors = await Author.find(query)
      .sort(sort)
      .skip(skip)
      .limit(pageSize);
    
    const total = await Author.countDocuments(query);
    
    success(res, {
      list: authors,
      pagination: {
        page: pageNum,
        size: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }, '查询成功');
  } catch (err) {
    error(res, 500, '获取作者列表失败', err.message);
  }
};

// 获取作者详情
const detail = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) {
      return error(res, 404, '作者不存在');
    }
    success(res, author, '获取成功');
  } catch (err) {
    error(res, 500, '获取作者详情失败', err.message);
  }
};

// 获取作者的诗词列表
const getAuthorPoems = async (req, res) => {
  try {
    const { page = 1, size = 10, sort = '-createTime' } = req.query;
    
    // 验证作者是否存在
    const author = await Author.findById(req.params.id);
    if (!author) {
      return error(res, 404, '作者不存在');
    }
    
    // 构建查询条件
    const query = { authorId: req.params.id };
    
    // 计算分页
    const pageNum = parseInt(page);
    const pageSize = parseInt(size);
    const skip = (pageNum - 1) * pageSize;
    
    // 查询诗词数据
    const poems = await Poem.find(query)
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .populate('tags', 'name description usageCount');
    
    const total = await Poem.countDocuments(query);
    
    success(res, {
      author: { id: author._id, name: author.name, dynasty: author.dynasty },
      poems: poems,
      pagination: {
        page: pageNum,
        size: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }, '查询成功');
  } catch (err) {
    error(res, 500, '获取作者诗词列表失败', err.message);
  }
};

// 创建作者
const create = async (req, res) => {
  try {
    const { name, description, shortDescription, dynasty, birthYear, deathYear } = req.body;
    
    if (!name) {
      return badRequest(res, '作者姓名不能为空');
    }
    
    // 检查作者是否已存在
    const existingAuthor = await Author.findOne({ name });
    if (existingAuthor) {
      return badRequest(res, '该作者已存在');
    }
    
    // 创建作者
    const author = new Author({
      name,
      description,
      shortDescription,
      dynasty,
      birthYear,
      deathYear
    });
    
    await author.save();
    success(res, author, '创建成功');
  } catch (err) {
    console.error('创建作者失败:', err);
    error(res, 500, '创建作者失败', err.message);
  }
};

// 更新作者信息
const update = async (req, res) => {
  try {
    const { name, description, shortDescription, dynasty, birthYear, deathYear } = req.body;
    
    // 查找原有作者
    const existingAuthor = await Author.findById(req.params.id);
    if (!existingAuthor) {
      return error(res, 404, '作者不存在');
    }
    
    // 如果修改了作者名称，检查是否与其他作者重复
    if (name && name !== existingAuthor.name) {
      const nameExists = await Author.findOne({ name, _id: { $ne: req.params.id } });
      if (nameExists) {
        return badRequest(res, '该作者名称已被使用');
      }
    }
    
    // 更新作者信息
    const updatedAuthor = await Author.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        description, 
        shortDescription, 
        dynasty, 
        birthYear, 
        deathYear,
        updateTime: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    success(res, updatedAuthor, '更新成功');
  } catch (err) {
    console.error('更新作者失败:', err);
    error(res, 500, '更新作者失败', err.message);
  }
};

// 删除作者
const deleteAuthor = async (req, res) => {
  try {
    // 查找作者
    const author = await Author.findById(req.params.id);
    if (!author) {
      return error(res, 404, '作者不存在');
    }
    
    // 检查是否有相关诗词
    const poemCount = await Poem.countDocuments({ authorId: req.params.id });
    if (poemCount > 0) {
      return badRequest(res, `该作者有${poemCount}首诗词，无法删除`);
    }
    
    // 删除作者
    await Author.findByIdAndDelete(req.params.id);
    
    success(res, null, '删除成功');
  } catch (err) {
    console.error('删除作者失败:', err);
    error(res, 500, '删除作者失败', err.message);
  }
};

// 更新作者作品数量
const updateWorksCount = async (authorId) => {
  try {
    const count = await Poem.countDocuments({ authorId });
    await Author.findByIdAndUpdate(authorId, { worksCount: count });
    return count;
  } catch (err) {
    console.error('更新作者作品数量失败:', err);
    return 0;
  }
};

module.exports = { 
  list, 
  detail, 
  getAuthorPoems, 
  create, 
  update, 
  delete: deleteAuthor,
  updateWorksCount
};
