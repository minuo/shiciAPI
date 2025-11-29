请基于 Node.js、Express.js、MongoDB 开发一个古诗词 RESTful API，具体要求如下：

### 1. 技术栈与环境规范
- 基础框架：Node.js（版本≥18.x）、Express.js（4.x）；
- 数据库：MongoDB（支持本地部署/MongoDB Atlas），使用 Mongoose 作为 ODM 操作数据库；
- 辅助工具：
  - 用 dotenv 管理环境变量（端口、MongoDB 连接字符串、JWT密钥、环境标识等）；
  - 用 Joi/express-validator 做接口参数校验；
  - 用 cors 处理跨域；
  - 用 jsonwebtoken 实现 JWT 认证，bcrypt 加密用户密码；
  - 用 swagger-jsdoc + swagger-ui-express 生成接口文档（可选）；
  - 用 winston 记录接口日志（请求/错误日志，可选）；
  - 用 pm2 做生产环境进程守护（部署环节）。
  

### 2. 数据模型设计（Mongoose Schema）
#### （1）古诗词模型（AncientPoem）
包含以下字段（字段类型+约束+新增点赞字段）：
- _id：MongoDB 自动生成的 ObjectId（主键）；
- title：字符串，必填，古诗词标题（如“静夜思”）；
- author：字符串，必填，作者（如“李白”）；
- dynasty：字符串，必填，朝代（如“唐”“宋”）；
- content：数组<string>，必填，古诗词原文（按句拆分，如 ["床前明月光", "疑是地上霜"]）；
- annotation：数组<string>，可选，每句注释（与 content 索引对应）；
- translation：字符串，可选，全文译文；
- appreciation：字符串，可选，赏析；
- tags：数组<string>，可选，标签（如“思乡”“写景”）；
- likeCount：数字，默认0，点赞数；
- createTime：Date，默认 Date.now()，数据创建时间；
- updateTime：Date，默认 Date.now()，数据更新时间；
- 索引要求：对 author、dynasty 字段建立单字段普通索引，对 tags 字段建立多值索引（支持数组元素查询），提升查询效率。

#### （2）用户模型（User）
区分管理员/普通用户，字段如下：
- _id：ObjectId（主键）；
- username：字符串，必填，唯一（如“admin”）；
- email：字符串，必填，唯一（如“admin@example.com”）；
- password：字符串，必填，加密存储（bcrypt 哈希）；
- role：字符串，必填，枚举值 ["admin", "user"]，默认 "user"；
- createTime：Date，默认 Date.now()；
- updateTime：Date，默认 Date.now()。

#### （3）评论模型（Comment）
关联古诗词和用户，字段如下：
- _id：ObjectId（主键）；
- poemId：ObjectId，必填，关联古诗词的_id；
- userId：ObjectId，必填，关联评论用户的_id；
- content：字符串，必填，评论内容；
- createTime：Date，默认 Date.now()；
- updateTime：Date，默认 Date.now()。

### 3. 核心接口开发（RESTful 风格）
所有接口返回统一格式：
{
  "code": 数字（200=成功，400=参数错误，401=未登录/权限不足，404=数据不存在，500=服务器错误）,
  "msg": 字符串（提示信息）,
  "data": 任意类型（成功时返回数据，失败时为 null/空）
}

#### （1）认证相关接口
##### ① 用户注册
- 请求方式：POST
- 请求路径：/api/auth/register
- 请求参数（Body，JSON）：username、email、password（必填）；
- 逻辑：
  - 校验用户名/邮箱是否已存在，存在则返回400；
  - 用bcrypt.hash加密密码后存储；
  - 默认注册为普通用户（role=normal），返回注册成功信息（不返回密码）。

##### ② 用户登录
- 请求方式：POST
- 请求路径：/api/auth/login
- 请求参数（Body，JSON）：username/email（二选一）、password（必填）；
- 逻辑：
  - 校验用户是否存在，密码是否匹配；
  - 生成JWT令牌（有效期7天），返回令牌+用户信息（不含密码）；
  - JWT payload 包含 userId、username、role。

#### （2）古诗词相关接口（新增权限控制+扩展功能）
##### ① 查询古诗词列表（新增点赞排序）
- 请求方式：GET
- 请求路径：/api/poems
- 请求参数（Query）：
  - page：数字，可选，默认1，页码；
  - size：数字，可选，默认10，每页条数；
  - keyword：字符串，可选，模糊搜索标题/作者/原文；
  - dynasty：字符串，可选，筛选朝代；
  - author：字符串，可选，筛选作者；
  - tags：字符串，可选，筛选标签（多个标签用逗号分隔）；
  - sort：字符串，可选，默认"createTime"，支持"likeCount"（按点赞数排序），前缀"+"升序、"-"降序（如"-likeCount"表示按点赞数降序）；
- 返回数据：
  {
    "code": 200,
    "msg": "查询成功",
    "data": {
      "list": [/* 古诗词对象数组 */],
      "total": 数字（总条数）,
      "page": 数字（当前页）,
      "size": 数字（每页条数）
    }
  }
- 权限：无需登录，所有用户可访问。

##### ② 随机返回一首古诗词
- 请求方式：GET
- 请求路径：/api/poems/random
- 请求参数：无；
- 逻辑：从数据库随机抽取一条古诗词数据返回；
- 权限：无需登录，所有用户可访问。

##### ③ 查询古诗词详情
- 请求方式：GET
- 请求路径：/api/poems/:id
- 请求参数（Params）：id 为古诗词的 ObjectId；
- 权限：无需登录，所有用户可访问。

##### ④ 新增古诗词
- 请求方式：POST
- 请求路径：/api/poems
- 请求参数（Body，JSON）：包含 title/author/dynasty/content 等必填字段；
- 逻辑：参数校验，成功后插入数据库，返回新增的完整数据；
- 权限：仅管理员（role=admin）可操作，非管理员返回401（权限不足）。

##### ⑤ 编辑古诗词
- 请求方式：PUT
- 请求路径：/api/poems/:id
- 请求参数：Params（id） + Body（要修改的字段）；
- 逻辑：校验诗词是否存在，存在则更新（更新updateTime），返回修改后数据；
- 权限：仅管理员可操作。

##### ⑥ 删除古诗词
- 请求方式：DELETE
- 请求路径：/api/poems/:id
- 请求参数（Params）：id；
- 逻辑：校验诗词是否存在，存在则删除，返回成功提示；
- 权限：仅管理员可操作。

##### ⑦ 古诗词点赞
- 请求方式：PATCH
- 请求路径：/api/poems/:id/like
- 请求参数（Params）：id；
- 逻辑：校验诗词是否存在，存在则将likeCount+1，返回更新后的数据；
- 权限：无需登录，所有用户可操作。

#### （3）评论相关接口
##### ① 新增评论
- 请求方式：POST
- 请求路径：/api/poems/:id/comments
- 请求参数：
  - Params：id（古诗词_id）；
  - Body（JSON）：content（评论内容，必填）；
- 逻辑：校验用户是否登录（普通/管理员均可），关联诗词和用户ID，插入评论数据；
- 权限：仅登录用户（normal/admin）可操作，未登录返回401。

##### ② 查询古诗词评论列表
- 请求方式：GET
- 请求路径：/api/poems/:id/comments
- 请求参数：
  - Params：id（古诗词_id）；
  - Query：page（默认1）、size（默认10）；
- 逻辑：查询指定诗词的评论，按createTime降序排列，返回分页数据；
- 权限：无需登录，所有用户可访问。

### 4. 中间件开发
#### （1）JWT认证中间件（auth.js）
- 逻辑：解析请求头中的Authorization（Bearer Token），验证JWT是否有效；
- 失效场景：令牌不存在、过期、签名错误，均返回401（未登录）；
- 验证通过后，将用户信息（userId、username、role）挂载到req.user，供后续接口使用。

#### （2）权限校验中间件（checkRole.js）
- 入参：允许的角色数组（如["admin"]）；
- 逻辑：校验req.user.role是否在允许的角色范围内，否则返回401（权限不足）；
- 应用：仅在新增/编辑/删除古诗词接口中使用，校验是否为admin。

#### （3）参数校验/全局异常/跨域/日志中间件
- 保持原有要求：参数校验（POST/PUT请求）、全局异常捕获（返回500）、跨域处理、请求日志记录。

### 5. 初始化脚本（seed.js）
- 功能：
  1. 连接MongoDB数据库；
  2. 清空测试数据（可选，避免重复插入）：删除Poem、User、Comment集合中的测试数据；
  3. 插入5-10条测试古诗词数据（包含title/author/dynasty/content/tags/likeCount等字段）；
  4. 插入5-10个tag（如"思乡"、"风景"等）,并与插入的诗词关联；
  5. 创建默认管理员和普通用户：
    - 默认管理员：
        - 用户名：admin，邮箱：admin@example.com，密码：admin123（需用bcrypt加密后存储）；
        - 角色：admin；
    - 默认用户：
        - 用户名：user，邮箱：user@example.com，密码：user123（需用bcrypt加密后存储）；
        - 角色：user；

  6. 输出初始化成功提示，关闭数据库连接。
- 执行方式：在package.json中添加脚本"seed": "node seed.js"，支持一键执行。

### 6. 项目结构与开发规范
- 采用 **Controller → Model** 的简化架构。
- 不要使用 Service 层或 Repository 层，让 Controller 直接调用 Model 进行数据库操作。
- 目的是保持代码简洁，适合单人维护。
- 项目结构：
Server/
├── config/ # 配置文件
│ ├── db.js # MongoDB 连接 + 索引创建
│ └── jwt.js # JWT 密钥 / 有效期配置
├── controllers/ # 控制器
│  ├── poemController.js # 古诗词业务逻辑
│  ├── authController.js # 认证业务逻辑
│  └── commentController.js # 评论业务逻辑
├── middleware/ # 中间件
│ ├── errorHandler.js # 全局异常处理
│ ├── logger.js # 请求日志
│ ├── validator.js # 参数校验
│ ├── auth.js # JWT 认证
│ └── checkRole.js # 权限校验
├── models/ # 数据模型
│ ├── Poem.js # 古诗词模型（含索引定义）
│ ├── User.js # 用户模型
│ └── Comment.js # 评论模型
├── routes/ # 路由
│ ├── poemRoutes.js # 古诗词路由
│ ├── authRoutes.js # 认证路由
│ └── commentRoutes.js # 评论路由
├── seed.js # 数据初始化脚本
├── app.js # Express 应用入口
├── server.js # 启动文件
├── .env # 环境变量（git 忽略）
├── .env.example # 环境变量示例
├── package.json # 依赖配置
└── README.md # 运行 / 部署说明

- 代码规范：变量/函数名小驼峰，注释清晰，敏感配置（JWT密钥、数据库地址）写入.env，避免硬编码。

### 7. 部署步骤
提供两种部署方式的详细步骤：

#### （1）云服务器部署（阿里云/腾讯云）
1. 服务器环境准备：
 - 安装Node.js（≥18.x）：通过nvm安装（推荐）；
 - 安装MongoDB：本地部署或使用MongoDB Atlas；
 - 安装pm2：npm install -g pm2；
 - 放行端口：在服务器安全组中放行API端口（如3000）。
2. 代码部署：
 - 上传代码到服务器（通过Git/SSH）；
 - 安装依赖：npm install --production；
 - 配置.env文件：填写MongoDB连接字符串、JWT密钥、端口等；
 - 执行初始化脚本：npm run seed（创建默认管理员和测试数据）；
 - 启动服务：pm2 start server.js --name poem-api；
 - 配置pm2开机自启：pm2 startup && pm2 save。
3. 可选：配置Nginx反向代理（域名访问）、HTTPS。

#### （2）Docker容器化部署
1. 编写Dockerfile：
 - 基础镜像：node:18-alpine；
 - 设置工作目录，复制package.json，安装依赖；
 - 复制项目代码，暴露端口（如3000）；
 - 启动命令：node server.js。
2. 编写docker-compose.yml：
 - 包含node服务和MongoDB服务（单机部署）；
 - 配置MongoDB数据卷（持久化）、环境变量；
 - 配置服务依赖（先启动MongoDB，再启动API）。
3. 部署步骤：
 - 安装Docker和docker-compose；
 - 执行docker-compose build构建镜像；
 - 执行docker-compose up -d启动容器；
 - 进入API容器执行初始化脚本：docker exec -it [容器名] npm run seed。

### 8. 运行与测试要求
- 提供package.json（包含dev/start/seed等脚本）；
- 提供本地运行步骤（安装依赖、配置.env、启动服务、执行初始化脚本）；
- 给出核心接口的测试示例（Postman/Curl命令），包括：
- 管理员登录（获取JWT令牌）；
- 新增古诗词（携带令牌）；
- 普通用户评论（携带令牌）；
- 按点赞数排序查询；
- 随机获取诗词。