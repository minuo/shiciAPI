# 诗词 API 项目

## 项目概述

诗词 API 是一个基于 Node.js 和 MongoDB 开发的 RESTful API 服务，提供中国古典诗词的存储、查询、评论和管理功能。该项目旨在为诗词爱好者和开发者提供一个便捷的诗词数据服务，支持诗词的浏览、搜索、点赞和评论等操作。

## 主要功能

- **诗词管理**：支持诗词的创建、查询、更新和删除（管理员权限）
- **用户认证**：提供用户注册、登录功能，基于 JWT 进行身份验证
- **评论系统**：用户可以对诗词发表评论，支持评论的查看和管理
- **标签系统**：诗词可关联多个标签，支持标签的创建、查询和管理
- **点赞功能**：用户可以对诗词进行点赞
- **随机获取**：支持随机获取一首诗词
- **权限控制**：区分普通用户和管理员权限

## 技术栈

- **后端框架**：Express.js (v5.1.0)
- **数据库**：MongoDB (通过 Mongoose v9.0.0 连接)
- **认证授权**：JSON Web Token (JWT)
- **密码加密**：bcrypt
- **请求验证**：express-validator
- **跨域处理**：cors
- **环境变量**：dotenv
- **API文档**：swagger-ui-express

## 项目结构

```
shiciAPI/
├── Server/           # 后端代码目录
│   ├── config/       # 配置文件目录
│   ├── controllers/  # 控制器目录
│   ├── middleware/   # 中间件目录
│   ├── models/       # 数据模型目录
│   ├── routes/       # 路由目录
│   ├── utils/        # 工具函数目录
│   ├── tests/        # 测试文件目录
│   ├── migrations/   # 数据库迁移目录
│   ├── app.js        # 应用程序主文件
│   ├── server.js     # 服务器入口文件
│   ├── seed.js       # 数据初始化脚本
│   ├── package.json  # 项目配置和依赖
│   └── .env          # 环境变量配置（需自行创建）
├── docs/             # 项目文档目录
└── README.md         # 项目说明文档
```

### 后端目录说明
所有后端相关代码和配置文件已移至 `Server` 目录中，保持了原有的内部结构层级关系。在开发和运行后端服务时，请先进入 Server 目录再执行相应命令。

## 安装与配置

### 环境要求

- Node.js v14 或更高版本
- MongoDB 数据库

### 安装步骤

1. **克隆项目**

```bash
git clone <repository-url>
cd shiciAPI
```

2. **进入后端目录并安装依赖**

```bash
cd Server
npm install
```

3. **配置环境变量**

在 Server 目录中创建 `.env` 文件，添加以下配置：

```
# MongoDB 连接字符串
MONGODB_URI=mongodb://localhost:27017/shiciAPI

# JWT 密钥
JWT_SECRET=your_jwt_secret_key

# 服务器端口
PORT=3000
```

4. **初始化数据**

确保在 Server 目录中执行：

```bash
npm run seed
```

这将创建初始的管理员用户（用户名：admin，密码：admin123）、普通用户（用户名：user，密码：user123）以及一些示例诗词和标签数据。

## 使用方法

### 启动服务

确保在 Server 目录中执行以下命令：

**开发模式**：
```bash
cd Server
npm run dev
```

**生产模式**：
```bash
cd Server
npm start
```

服务启动后，默认运行在 http://localhost:3000

### API 端点

#### 认证接口
- POST `/api/auth/register` - 用户注册
- POST `/api/auth/login` - 用户登录

#### 诗词接口
- GET `/api/poems` - 获取诗词列表
- GET `/api/poems/random` - 随机获取一首诗词
- GET `/api/poems/:id` - 获取诗词详情
- POST `/api/poems` - 创建新诗词（需管理员权限）
- PUT `/api/poems/:id` - 更新诗词（需管理员权限）
- DELETE `/api/poems/:id` - 删除诗词（需管理员权限）
- PATCH `/api/poems/:id/like` - 点赞诗词

#### 评论接口
- POST `/api/poems/:id/comments` - 添加评论（需登录）
- GET `/api/poems/:id/comments` - 获取评论列表

#### 标签接口
- GET `/api/tags` - 获取标签列表
- GET `/api/tags/popular` - 获取热门标签
- GET `/api/tags/:id` - 获取标签详情
- POST `/api/tags` - 创建标签（需管理员权限）
- PUT `/api/tags/:id` - 更新标签（需管理员权限）
- DELETE `/api/tags/:id` - 删除标签（需管理员权限）
- POST `/api/tags/bulk` - 批量创建标签（需管理员权限）

## 测试

确保在 Server 目录中执行：

```bash
cd Server
npm run test:endpoint
```

## 部署

项目支持通过 GitHub Actions 进行自动部署。详细的部署指南可参考 `docs/guides/DEPLOYMENT_GUIDE.md` 文件。

## 文档目录

项目文档已集中存放在 `docs` 目录下，按照文档类型和功能模块进行组织：

### 文档结构与规范
- **文档结构规范**：`docs/DOCUMENT_STRUCTURE.md` - 详细的文档分类标准和目录结构
- **文档组织指南**：`docs/DOCUMENTATION_GUIDELINES.md` - 文档存放规则和最佳实践

### 主要文档分类
- **指南文档**：`docs/guides/` - 包含部署指南、SSH设置等
- **宝塔部署**：`docs/baota/` - 宝塔面板部署相关文档
- **测试报告**：`docs/testing/` - API测试报告
- **配置指南**：`docs/configs/` - 配置优化和提示文档
- **代码审查**：`docs/code_reviews/` - 代码审查报告和质量分析

### 文档使用说明
所有新生成的文档文件必须统一存放在 `docs` 目录中，并根据文档类型和功能模块组织到对应的子目录中。请参考 `docs/DOCUMENTATION_GUIDELINES.md` 了解详细的文档存放规范。在提交代码时，请检查文档存放位置是否符合规范，避免文档散落在项目其他目录中。

## 许可证

该项目使用 ISC 许可证。

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 注意事项

- 生产环境中请务必修改默认的管理员密码
- 确保使用安全的 JWT 密钥
- 定期备份数据库