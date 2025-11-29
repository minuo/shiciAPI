# 古诗词 RESTful API 开发指南（单人维护版）

## 📋 目录
- [技术栈概述](#技术栈概述)
- [项目结构](#项目结构)
- [数据模型设计](#数据模型设计)
- [核心接口](#核心接口)
- [中间件实现](#中间件实现)
- [快速开发流程](#快速开发流程)
- [部署指南](#部署指南)
- [实用开发技巧](#实用开发技巧)
- [测试示例](#测试示例)
- [注意事项](#注意事项)

## 🛠️ 技术栈概述

| 类别 | 技术 | 版本 | 用途 |
|------|------|------|------|
| **核心框架** | Node.js | ≥18.x | 运行环境 |
| | Express.js | 4.x | Web框架 |
| **数据库** | MongoDB | 最新版 | 数据存储 |
| | Mongoose | 最新版 | ODM工具 |
| **辅助工具** | dotenv | 最新版 | 环境变量管理 |
| | express-validator | 最新版 | 请求参数校验 |
| | cors | 最新版 | 跨域处理 |
| | jsonwebtoken | 最新版 | JWT认证 |
| | bcrypt | 最新版 | 密码加密 |
| | swagger-ui-express | 最新版 | 接口文档（可选）

## 📂 项目结构（优化版）

```
/
├── config/          # 配置文件
│   └── db.js        # 数据库连接配置
├── controllers/     # 控制器（业务逻辑）
│   ├── poem.js      # 诗词相关逻辑
│   ├── auth.js      # 认证相关逻辑
│   └── comment.js   # 评论相关逻辑
├── middleware/      # 中间件
│   ├── auth.js      # JWT认证
│   ├── error.js     # 错误处理
│   └── validate.js  # 参数校验
├── models/          # 数据模型
│   ├── Poem.js      # 诗词模型
│   ├── User.js      # 用户模型
│   └── Comment.js   # 评论模型
├── routes/          # 路由配置
│   └── index.js     # 统一路由入口（合并所有路由）
├── utils/           # 工具函数
│   └── response.js  # 统一响应格式
├── seed.js          # 数据初始化脚本
├── app.js           # Express应用入口
├── server.js        # 启动文件
├── .env             # 环境变量（不提交）
├── .env.example     # 环境变量示例
├── package.json
└── README.md        # 项目说明
```

> **单人开发优势**：合并路由文件，减少文件数量，集中管理路由配置

## 📊 数据模型设计

### 1. Poem 模型（诗词）

**核心字段表**：
| 字段名 | 类型 | 必填 | 说明 | 索引 |
|-------|------|------|------|------|
| title | String | ✅ | 诗词标题 | - |
| author | String | ✅ | 作者姓名 | ✅ |
| dynasty | String | ✅ | 朝代 | ✅ |
| content | [String] | ✅ | 诗词内容（按句分割） | - |
| tags | [ObjectId] | ❌ | 标签ID数组（关联Tag模型） | ✅ |
| tagDetails | [Object] | ❌ | 虚拟字段，标签详情 | - |
| likeCount | Number | ❌ | 点赞数，默认0 | - |

```javascript
// models/Poem.js 核心代码
const mongoose = require('mongoose');

const poemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true, index: true },
  dynasty: { type: String, required: true, index: true },
  content: { type: [String], required: true },
  annotation: { type: [String] },
  translation: String,
  appreciation: String,
  tags: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tag',
    index: true 
  }],
  likeCount: { type: Number, default: 0 },
  createTime: { type: Date, default: Date.now },
  updateTime: { type: Date, default: Date.now }
});

// 虚拟字段：填充标签详情
poemSchema.virtual('tagDetails', {
  ref: 'Tag',
  localField: 'tags',
  foreignField: '_id',
  justOne: false
});

// 确保虚拟字段在转换为JSON或对象时被包含
poemSchema.set('toObject', { virtuals: true });
poemSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Poem', poemSchema);
```

### 2. Tag 模型（标签）

**核心字段表**：
| 字段名 | 类型 | 必填 | 说明 | 索引 |
|-------|------|------|------|------|
| name | String | ✅ | 标签名称 | ✅（唯一） |
| description | String | ❌ | 标签描述 | - |
| usageCount | Number | ❌ | 使用次数 | ✅ |
| poems | [Object] | ❌ | 虚拟字段，关联的诗词 | - |
| createTime | Date | ❌ | 创建时间 | - |
| updateTime | Date | ❌ | 更新时间 | - |

```javascript
// models/Tag.js 核心代码
const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    index: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[\u4e00-\u9fa5a-zA-Z0-9_\-]{1,50}$/.test(v);
      },
      message: props => `${props.value} 不是有效的标签名称！标签名称只能包含中文、英文、数字、下划线和连字符，且长度不超过50个字符。`
    }
  },
  description: { 
    type: String, 
    trim: true,
    maxlength: 200
  },
  usageCount: { 
    type: Number, 
    default: 0,
    index: true
  },
  createTime: { 
    type: Date, 
    default: Date.now 
  },
  updateTime: { 
    type: Date, 
    default: Date.now 
  }
});

// 虚拟字段：关联的诗词
// 通过反向引用建立从Tag到Poem的关联
// 注意：这是虚拟的，不会在数据库中存储，仅用于查询时的引用
// 实际数据存储在Poem模型的tags字段中

// 在save操作前更新updateTime
// 注意：在生产环境中，应使用MongoDB的变更流或中间件来维护usageCount的准确性

// 确保虚拟字段在转换为JSON或对象时被包含
tagSchema.set('toObject', { virtuals: true });
tagSchema.set('toJSON', { virtuals: true });

// 反向关联：获取使用此标签的所有诗词
tagSchema.virtual('poems', {
  ref: 'Poem',
  localField: '_id',
  foreignField: 'tags',
  justOne: false
});

module.exports = mongoose.model('Tag', tagSchema);
```

### 3. 诗词与标签的多对多关系设计

#### 3.1 关系实现方式

本系统采用MongoDB中的引用方式实现多对多关系：

1. **关联设计**：
   - 在Poem模型中，使用`tags`字段（ObjectId数组）引用Tag模型
   - 在Tag模型中，通过虚拟字段`poems`反向引用Poem模型

2. **特点**：
   - 单向存储（只在Poem中存储关联关系）
   - 双向查询（通过虚拟字段实现）
   - 高效的诗词查询（通过索引加速）

#### 3.2 数据交互规则

1. **创建诗词时的标签处理**：
   - 接收标签名称数组
   - 检查标签是否已存在，不存在则创建
   - 将标签的ObjectId添加到诗词的tags字段
   - 更新标签的usageCount

2. **更新诗词标签时的规则**：
   - 对比新旧标签列表
   - 移除不再使用的标签关联，并减少usageCount
   - 添加新的标签关联，并增加usageCount

3. **删除诗词时的处理**：
   - 移除该诗词与所有标签的关联
   - 减少相关标签的usageCount

4. **删除标签时的处理**：
   - 检查该标签是否被诗词使用
   - 如果被使用，提示无法删除或提供强制删除选项
   - 强制删除时，需要从所有引用该标签的诗词中移除该标签

#### 3.3 数据一致性保证

1. **事务处理**：在修改标签关联时，确保所有相关操作要么全部成功，要么全部失败
2. **并发控制**：使用MongoDB的原子操作保证数据一致性
3. **定期检查**：通过定时任务检查并修复usageCount与实际引用数量不匹配的情况

#### 3.4 关系查询示例

**查询带标签的诗词**：
```javascript
// 查询包含特定标签的诗词
const poems = await Poem.find({ tags: tagId })
  .populate('tagDetails', 'name description')
  .exec();

// 查询包含多个标签的诗词（AND关系）
const poems = await Poem.find({ tags: { $all: [tagId1, tagId2] } })
  .populate('tagDetails', 'name description')
  .exec();

// 查询包含任一标签的诗词（OR关系）
const poems = await Poem.find({ tags: { $in: [tagId1, tagId2] } })
  .populate('tagDetails', 'name description')
  .exec();
```

**查询标签相关的诗词**：
```javascript
// 方式1：通过Poem模型查询
const poems = await Poem.find({ tags: tagId }).exec();

// 方式2：通过虚拟字段查询（注意：虚拟字段不会自动填充，需要手动查询）
const tag = await Tag.findById(tagId);
const poems = await Poem.find({ tags: tagId }).exec();
```

### 4. 关系管理工具函数

为了简化诗词与标签关系的管理，建议创建统一的工具函数：

```javascript
// utils/relationshipUtils.js 示例
const Poem = require('../models/Poem');
const Tag = require('../models/Tag');

/**
 * 处理诗词标签关系
 * @param {Array} tagNames - 标签名称数组
 * @returns {Promise<Array>} - 标签ID数组
 */
async function processPoemTagRelationships(tagNames) {
  const tagIds = [];
  
  for (const name of tagNames) {
    // 查找或创建标签
    let tag = await Tag.findOne({ name });
    if (!tag) {
      tag = new Tag({ name });
      await tag.save();
    } else {
      // 更新使用次数
      await Tag.updateOne({ _id: tag._id }, { $inc: { usageCount: 1 } });
    }
    tagIds.push(tag._id);
  }
  
  return tagIds;
}

/**
 * 移除诗词标签关系
 * @param {Array} tagIds - 标签ID数组
 */
async function removePoemTagRelationships(tagIds) {
  for (const tagId of tagIds) {
    // 减少标签使用次数
    await Tag.updateOne({ _id: tagId }, { $inc: { usageCount: -1 } });
  }
}

/**
 * 同步诗词标签（更新时使用）
 * @param {ObjectId} poemId - 诗词ID
 * @param {Array} newTagNames - 新的标签名称数组
 */
async function syncPoemTags(poemId, newTagNames) {
  const poem = await Poem.findById(poemId);
  const oldTagIds = poem.tags || [];
  
  // 获取新标签ID
  const newTagIds = await processPoemTagRelationships(newTagNames);
  
  // 找出不再使用的标签
  const removedTagIds = oldTagIds.filter(id => !newTagIds.includes(id.toString()));
  
  // 移除不再使用的标签关系
  if (removedTagIds.length > 0) {
    await removePoemTagRelationships(removedTagIds);
  }
  
  // 更新诗词标签
  poem.tags = newTagIds;
  await poem.save();
  
  return poem;
}

module.exports = {
  processPoemTagRelationships,
  removePoemTagRelationships,
  syncPoemTags
};
```

### 2. User 模型（用户）

```javascript
// models/User.js 核心代码
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  createTime: { type: Date, default: Date.now },
  updateTime: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
```

### 3. Comment 模型（评论）

```javascript
// models/Comment.js 核心代码
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  poemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poem', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createTime: { type: Date, default: Date.now },
  updateTime: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);
```

## 🔌 核心接口速查表

### 1. 认证接口
| 接口 | 方法 | 路径 | 权限 | 功能 |
|------|------|------|------|------|
| 注册 | POST | `/api/auth/register` | 无 | 用户注册 |
| 登录 | POST | `/api/auth/login` | 无 | 用户登录获取Token |

### 2. 诗词接口
| 接口 | 方法 | 路径 | 权限 | 功能 |
|------|------|------|------|------|
| 列表查询 | GET | `/api/poems` | 无 | 分页查询诗词列表，支持标签筛选 |
| 随机诗词 | GET | `/api/poems/random` | 无 | 随机返回一首诗词 |
| 详情查询 | GET | `/api/poems/:id` | 无 | 查询单个诗词详情，包含标签信息 |
| 新增诗词 | POST | `/api/poems` | admin | 添加新诗词，支持标签关联 |
| 编辑诗词 | PUT | `/api/poems/:id` | admin | 修改诗词信息，更新标签关联 |
| 删除诗词 | DELETE | `/api/poems/:id` | admin | 删除诗词，清理标签关联 |
| 点赞功能 | PATCH | `/api/poems/:id/like` | 无 | 诗词点赞 |

### 3. 标签接口
| 接口 | 方法 | 路径 | 权限 | 功能 |
|------|------|------|------|------|
| 标签列表 | GET | `/api/tags` | 无 | 获取标签列表，支持分页和搜索 |
| 热门标签 | GET | `/api/tags/popular` | 无 | 获取热门标签（按使用次数排序） |
| 标签详情 | GET | `/api/tags/:id` | 无 | 获取单个标签详情，可包含关联诗词 |
| 创建标签 | POST | `/api/tags` | admin | 创建新标签 |
| 更新标签 | PUT | `/api/tags/:id` | admin | 更新标签信息 |
| 删除标签 | DELETE | `/api/tags/:id` | admin | 删除标签，清理关联关系 |
| 批量创建 | POST | `/api/tags/batch` | admin | 批量创建标签

### 3. 评论接口
| 接口 | 方法 | 路径 | 权限 | 功能 |
|------|------|------|------|------|
| 新增评论 | POST | `/api/poems/:id/comments` | 登录用户 | 添加评论 |
| 评论列表 | GET | `/api/poems/:id/comments` | 无 | 获取诗词评论列表 |

**统一响应格式**：
```json
{
  "code": 200,  // 状态码
  "msg": "操作成功", // 提示信息
  "data": {}  // 返回数据
}
```

## 🔧 中间件实现

### JWT认证中间件（合并权限检查）
```javascript
// middleware/auth.js - 单人开发优化版
const jwt = require('jsonwebtoken');

// 主认证中间件
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('未提供认证令牌');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ code: 401, msg: '认证失败', data: null });
  }
};

// 权限检查辅助函数
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(401).json({ code: 401, msg: '权限不足', data: null });
    }
    next();
  };
};

module.exports = { auth, checkRole };
```

### 统一错误处理中间件
```javascript
// middleware/error.js
module.exports = (err, req, res, next) => {
  console.error('Error:', err.message || err);
  
  // 根据错误类型返回不同状态码
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      code: 400, 
      msg: '参数验证失败: ' + Object.values(err.errors).map(e => e.message).join(', '),
      data: null 
    });
  }
  
  // 默认返回服务器错误
  res.status(500).json({
    code: 500,
    msg: '服务器错误',
    data: null
  });
};
```
```

## ⚡ 快速开发流程

### 5分钟上手

1. **初始化项目**
   ```bash
   # 克隆项目后进入目录
   npm install  # 安装依赖
   ```

2. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑.env文件，填入必要配置
   ```

3. **准备数据**
   ```bash
   npm run seed  # 创建默认账号和测试数据
   ```

4. **启动开发**
   ```bash
   npm run dev  # 开发模式（带热重载）
   # 或
   npm start    # 生产模式
   ```

**开发效率提示**：
- 使用 `npm run dev` 启动，代码修改自动重启
- 统一使用 `utils/response.js` 格式返回数据
- 路由统一在 `routes/index.js` 中管理，减少文件切换

### 🚀 部署指南（简化版）

### Docker部署（推荐）

> **单人部署优势**：一站式配置，环境一致性好，维护成本低

1. **准备配置文件**
   - 在项目根目录创建 `Dockerfile`
   - 在项目根目录创建 `docker-compose.yml`

2. **一键启动**
   ```bash
   # 构建并启动服务
   docker-compose up -d
   
   # 初始化数据
   docker-compose exec api npm run seed
   
   # 验证服务
   curl http://localhost:3000/api/poems/random
   ```

### 传统部署（备选）

```bash
# 快速部署步骤
npm install --production
cp .env.example .env
# 编辑.env文件
npm install -g pm2
npm run seed      # 初始化数据
pm2 start server.js --name poem-api
pm2 save         # 设置开机自启
```

## 💡 单人开发实用技巧

### 1. 统一响应工具
```javascript
// utils/response.js
module.exports = {
  // 成功响应
  success: (res, data = null, msg = '操作成功') => {
    res.json({ code: 200, msg, data });
  },
  // 错误响应
  error: (res, code = 500, msg = '服务器错误', data = null) => {
    res.status(code).json({ code, msg, data });
  },
  // 参数错误
  badRequest: (res, msg = '参数错误', data = null) => {
    res.status(400).json({ code: 400, msg, data });
  },
  // 未授权
  unauthorized: (res, msg = '未授权操作', data = null) => {
    res.status(401).json({ code: 401, msg, data });
  }
};

// 使用示例
const { success, error } = require('../utils/response');
router.get('/poems', async (req, res) => {
  try {
    const poems = await Poem.find();
    success(res, poems);
  } catch (err) {
    error(res, 500, '获取诗词失败', err.message);
  }
});
```

### 2. 路由统一管理
```javascript
// routes/index.js
const express = require('express');
const { auth, checkRole } = require('../middleware/auth');
const router = express.Router();

// 导入控制器
const poemController = require('../controllers/poem');
const authController = require('../controllers/auth');
const commentController = require('../controllers/comment');

// 认证路由
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// 诗词路由
router.get('/poems', poemController.list);
router.get('/poems/random', poemController.random);
router.get('/poems/:id', poemController.detail);
router.post('/poems', auth, checkRole(['admin']), poemController.create);
router.put('/poems/:id', auth, checkRole(['admin']), poemController.update);
router.delete('/poems/:id', auth, checkRole(['admin']), poemController.delete);
router.patch('/poems/:id/like', poemController.like);

// 评论路由
router.post('/poems/:id/comments', auth, commentController.create);
router.get('/poems/:id/comments', commentController.list);

module.exports = router;
```

### 3. 环境变量配置示例
```dotenv
# .env.example
# 数据库连接
MONGODB_URI=mongodb://localhost:27017/poemdb

# 服务器配置
PORT=3000
NODE_ENV=development

# JWT配置
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=7d
```

## 🧪 测试示例（快速验证）

### 1. 管理员登录（获取Token）
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 2. 获取随机诗词
```bash
curl http://localhost:3000/api/poems/random
```

### 3. 带参数查询诗词
```bash
# 按朝代查询并按点赞数排序
curl "http://localhost:3000/api/poems?dynasty=唐&sort=-likeCount&page=1&size=5"
```

### 4. 发表评论（需登录）
```bash
# 替换YOUR_TOKEN和POEM_ID
curl -X POST http://localhost:3000/api/poems/POEM_ID/comments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"这首诗写得真好！"}'
```

### 5. 添加新诗词（需管理员权限）
```bash
# 替换YOUR_ADMIN_TOKEN
curl -X POST http://localhost:3000/api/poems \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"静夜思","author":"李白","dynasty":"唐","content":["床前明月光","疑是地上霜","举头望明月","低头思故乡"],"tags":["思乡","月亮"]}'
```

## 🤖 自动化测试脚本指南

### 📝 测试脚本编写规范

#### 文件命名与目录结构
- 测试脚本统一放置在项目根目录的 `tests/` 文件夹中
- 端点测试脚本命名格式：`endpoint.test.js`
- 报告文件统一输出到 `reports/` 文件夹
- 文件名使用小写字母，单词之间用连字符 `-` 分隔

#### 代码风格要求
- 使用 Node.js 原生模块，减少外部依赖
- 代码缩进使用 2 个空格
- 每行代码长度不超过 80 个字符
- 变量命名使用小驼峰命名法（camelCase）
- 常量命名使用全大写字母，单词之间用下划线分隔
- 函数命名要清晰表达其功能

#### 基本框架结构
```javascript
// 引入必要的模块
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 配置部分
const config = {
  // 环境配置
};

// 工具函数
function sendRequest(options) { /* ... */ }
function verifyResponse(response, expected) { /* ... */ }
function generateReport(results) { /* ... */ }

// 测试用例定义
const testCases = [
  // 测试用例数组
];

// 主测试函数
async function runTests() { /* ... */ }

// 执行测试
runTests();
```

### 🔄 测试脚本执行流程

#### 运行方式
- 通过 npm 脚本运行：`npm run test:endpoint`
- 直接运行脚本：`node tests/endpoint.test.js`
- 指定环境运行：`NODE_ENV=production node tests/endpoint.test.js`

#### 环境变量设置
- `NODE_ENV`：设置运行环境（development/testing/production）
- `API_BASE_URL`：自定义 API 基础 URL
- `TIMEOUT`：设置请求超时时间（毫秒）

#### 命令行参数支持
```javascript
// 解析命令行参数示例
const args = process.argv.slice(2);
const env = args.find(arg => arg.startsWith('--env='))?.split('=')[1] || process.env.NODE_ENV || 'development';
const reportDir = args.find(arg => arg.startsWith('--report-dir='))?.split('=')[1] || 'reports';
```

### 📋 测试用例设计标准

#### 测试用例基本结构
每个测试用例应包含以下字段：
```javascript
const testCase = {
  id: 'unique-test-id',          // 唯一标识符
  name: '测试名称',              // 清晰描述测试目的
  description: '详细描述',        // 测试场景说明
  endpoint: '/api/poems',        // 接口路径
  method: 'GET',                 // HTTP 方法
  headers: {},                   // 请求头
  body: null,                    // 请求体（POST/PUT 等）
  expected: {
    statusCode: 200,             // 期望的状态码
    responseTime: 500,           // 最大响应时间（毫秒）
    dataCheck: (data) => true    // 数据验证函数
  }
};
```

#### 覆盖范围要求
- 必须覆盖所有核心 API 端点
- 每个端点至少包含以下测试场景：
  - 正常请求场景
  - 边界条件测试
  - 错误处理测试（如参数错误、权限不足等）
- 关键业务流程应进行端到端测试

#### 数据准备与清理
- 测试前准备必要的测试数据
- 测试后清理测试产生的数据
- 避免测试之间的相互影响
- 优先使用模拟数据，减少对实际数据库的依赖

### 📊 预期输出格式

#### 控制台输出格式
```
========================================
          端点测试报告
========================================
运行环境: development
开始时间: 2024-01-01 12:00:00
----------------------------------------
✓ GET /api/poems/random - 随机获取诗词 (35ms)
✓ GET /api/poems - 获取诗词列表 (42ms)
✗ POST /api/poems - 添加新诗词 (权限不足) (18ms)
----------------------------------------
测试结果: 2/3 通过
总耗时: 95ms
报告文件: reports/endpoint-test-report-1764438549974.json
========================================
```

#### JSON 报告文件结构
```json
{
  "summary": {
    "environment": "development",
    "startTime": "2024-01-01T12:00:00.000Z",
    "endTime": "2024-01-01T12:00:00.095Z",
    "totalDuration": 95,
    "totalTests": 3,
    "passedTests": 2,
    "failedTests": 1
  },
  "results": [
    {
      "id": "test-random-poem",
      "name": "随机获取诗词",
      "endpoint": "/api/poems/random",
      "method": "GET",
      "status": "passed",
      "duration": 35,
      "statusCode": 200,
      "error": null
    },
    {
      "id": "test-failed-auth",
      "name": "添加新诗词 (权限不足)",
      "endpoint": "/api/poems",
      "method": "POST",
      "status": "failed",
      "duration": 18,
      "statusCode": 401,
      "error": "未授权操作"
    }
  ]
}
```

### ⚠️ 技术约束

#### 依赖要求
- 使用 Node.js 内置模块（http/https/fs/path）实现核心功能
- 不强制依赖第三方测试框架（如 Jest、Mocha 等）
- 如需扩展，可选择性引入轻量级库

#### 版本兼容性
- Node.js 版本要求 ≥ 18.x
- 支持的操作系统：Windows、macOS、Linux
- 确保在不同环境下的一致性表现

#### 安全注意事项
- 不在测试脚本中硬编码敏感信息
- 生产环境测试时使用环境变量传递配置
- 避免测试数据泄露到日志或报告中
- 测试完成后及时清理临时数据

## 🎯 单人开发核心原则

### 效率优先
- **热重载开发**：`npm run dev`自动重启节省时间
- **统一代码风格**：配置VSCode插件自动格式化
- **集中式路由**：单一文件管理所有路由，减少文件切换

### 安全与维护
- **必改默认配置**：生产环境修改JWT密钥和默认密码
- **定期备份数据**：`mongodump`命令或MongoDB Atlas自动备份
- **依赖安全检查**：每月执行`npm audit fix`更新依赖

### 问题快速排查
1. **数据库连接**：检查MongoDB服务是否运行
2. **认证失败**：确认token格式正确且未过期
3. **500错误**：查看控制台错误堆栈信息
4. **性能问题**：检查是否使用了合适的索引