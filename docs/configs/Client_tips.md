请基于以下要求开发一个「极简古诗词（古文）用户端前端项目」，核心目标是：轻量、易维护（单人开发/维护）、精准适配我已有的Node.js+Express+MongoDB后端API（含完整的认证/诗词/标签/评论接口），具体要求如下：

### 1. 核心背景与技术栈约束
- 开发目标：极简风格的普通用户端（仅面向非管理员用户，不包含任何admin专属功能如新增/编辑/删除诗词/标签），聚焦「诗词浏览/标签筛选/点赞/评论/登录」核心场景，拒绝冗余功能；
- 技术栈（优先轻量、单人易上手）：
  ✅ 基础框架：Vue3 (v3.3+) + Vite (v4.4+)（或原生HTML5+Vanilla JS+CSS3，二选一，优先前者，单人开发效率更高）；
  ✅ 样式：原生CSS（或Tailwind CSS v3.3+极简版，拒绝Element Plus等复杂UI库）；
  ✅ 网络请求：Axios (v1.5+)（轻量，适配后端统一响应格式）；
  ✅ 路由：Vue Router (v4.2+)（仅用于页面间基本导航）；
  ✅ 构建/部署：Vite（打包体积小、启动快），支持宝塔面板/阿里云服务器一键部署；
- 兼容性：适配主流浏览器（Chrome 90+/Firefox 88+/Edge 90+），移动端自适应（响应式布局，无需单独开发APP）；
- 维护约束：代码注释清晰、目录结构极简、无冗余依赖，单人可快速定位问题/迭代功能。

### 1.1 技术栈版本与配置示例

#### Vue 3 + Vite 配置示例

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
```

#### Axios 配置示例

```javascript
// src/utils/request.js
import axios from 'axios'
import { getToken } from './auth.js'
import { showToast } from './toast.js'

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从localStorage获取token并添加到请求头
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    // 后端返回的统一响应格式 {code, msg, data}
    if (res.code !== 200) {
      showToast(`操作失败: ${res.msg}`, 'error')
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
    return res.data
  },
  error => {
    console.error('响应错误:', error)
    const message = error.response?.data?.msg || '网络异常，请稍后重试'
    showToast(message, 'error')
    return Promise.reject(error)
  }
)

export default service
```

#### .env 环境变量配置示例

```env
# .env.development (开发环境)
VITE_API_BASE_URL=http://localhost:3000/api

# .env.production (生产环境)
VITE_API_BASE_URL=http://你的服务器IP:3000/api
```

#### package.json 依赖配置示例

```json
{
  "name": "shici-client",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.3.4",
    "vue-router": "^4.2.4",
    "axios": "^1.5.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.3.4",
    "vite": "^4.4.9"
  }
}
```

### 2. 页面结构（仅保留核心页面，拒绝冗余）
整个项目仅需5个核心页面（无复杂路由嵌套），页面跳转逻辑极简：
#### （1）首页（核心入口）
- 核心元素：
  ① 顶部：极简导航栏（仅显示“首页”“诗词列表”“热门标签”3个入口）；
  ② 主体：
     - 随机诗词卡片（调用 `/api/poems/random` 接口，显示标题+作者+朝代+核心诗句，点击进入详情）；
     - 热门标签区（调用 `/api/tags/popular` 接口，展示前6个热门标签，点击标签跳转诗词列表页并筛选该标签）；
     - 热门诗词（按点赞数排序，调用 `/api/poems?sort=-likeCount` 接口，显示前8条，仅展示标题+作者+点赞数）；
  ③ 底部：极简页脚（仅显示“诗词小站 ©2025”）；
- 交互：
  - 随机诗词卡片点击“换一首”可重新调用随机接口刷新；
  - 热门标签/热门诗词条目点击跳转对应页面。

#### （2）诗词列表页（含筛选功能）
- 核心功能：调用 `/api/poems` 接口，支持多条件筛选+分页，适配标签筛选逻辑；
- 筛选区域（极简表单，一行排列）：
  ① 关键词搜索框（模糊搜标题/作者/原文，拼接至 `/api/poems?keyword=xxx`）；
  ② 朝代下拉选择（唐/宋/元/明/清，拼接至 `/api/poems?dynasty=xxx`）；
  ③ 标签快捷筛选（调用 `/api/tags` 接口展示前10个标签，点击标签拼接至 `/api/poems?tags=xxx`）；
  ④ 排序选择（默认按创建时间/按点赞数降序，拼接至 `/api/poems?sort=-likeCount`）；
  ⑤ 分页控件（仅“上一页/下一页/当前页码”，适配接口分页参数 `page/size`）；
- 列表展示：每行显示“标题 | 作者 | 朝代 | 标签（逗号分隔） | 点赞数”，点击行跳转详情页。

#### （3）诗词详情页
- 核心元素：调用 `/api/poems/:id` 接口，展示完整信息：
  ① 基础信息：标题（大号字体）、作者+朝代（小号灰色字体）、标签（极简标签样式，如浅灰色背景+文字，点击标签跳转列表页筛选）；
  ② 原文：分行展示，居中，字体稍大；
  ③ 可选折叠面板：注释/译文/赏析（默认收起，点击展开，无则隐藏面板）；
  ④ 点赞按钮：调用 `/api/poems/:id/like` 接口，点击后点赞数+1，按钮置灰（禁用重复点击）；
- 评论区（极简）：
  ① 登录态判断：未登录时显示“登录后可评论”，登录按钮跳转登录页；
  ② 已登录：单行评论输入框 + 提交按钮（调用 `/api/poems/:id/comments` 接口）；
  ③ 评论列表：调用 `/api/poems/:id/comments` 接口，展示“用户昵称 | 评论内容 | 时间”，仅显示前10条，无分页。

#### （4）标签详情页
- 核心功能：调用 `/api/tags/:id` 接口，展示标签名称+关联诗词列表；
- 核心元素：
  ① 标签名称（居中大号字体）；
  ② 关联诗词列表（同诗词列表页的极简展示样式，点击跳转诗词详情）；
- 交互：无编辑/删除功能（仅展示），返回按钮跳转热门标签页。

#### （5）登录/注册页（极简弹窗/单独页面）
- 核心功能：适配 `/api/auth/login`（登录）、`/api/auth/register`（注册）接口；
- 切换逻辑：登录/注册表单可一键切换，无多余装饰；
- 登录表单：
  ① 用户名输入框；
  ② 密码输入框；
  ③ 登录按钮（点击后验证，成功后存储JWT到localStorage，跳转首页）；
- 注册表单：
  ① 用户名输入框；
  ② 邮箱输入框；
  ③ 密码输入框；
  ④ 注册按钮（点击后调用注册接口，成功后自动跳转登录）；
- 反馈：仅极简文字提示（如“用户名密码错误”“注册成功”），无复杂弹窗。

### 3. 接口对接规范（精准适配后端API）
- 基础配置：
  ✅ 接口基准地址：`.env` 文件中定义 `VITE_API_BASE_URL = 'http://你的服务器IP:3000/api'`；
  ✅ 请求头：登录后所有需要权限的请求（如提交评论）携带 `Authorization: Bearer {JWT}`；
  ✅ 响应处理：严格解析后端统一响应格式 `{code, msg, data}`：
     - code=200：正常处理返回数据；
     - code≠200：弹出极简Toast提示（如“操作失败：xxx”），3秒自动消失；
- 核心接口对接明细（覆盖所有用户端可用接口）：
  | 接口功能       | 请求方式 | 接口路径                | 前端处理逻辑                     |
  |----------------|----------|-------------------------|----------------------------------|
  | 随机诗词       | GET      | /poems/random           | 首页加载/换一首按钮触发          |
  | 诗词列表查询   | GET      | /poems                  | 筛选条件/分页变化时触发，拼接参数 |
  | 诗词详情       | GET      | /poems/:id              | 进入详情页时触发                |
  | 诗词点赞       | PATCH    | /poems/:id/like         | 点击点赞按钮触发，禁用重复点击   |
  | 用户登录       | POST     | /auth/login             | 登录按钮触发，存储JWT到localStorage |
  | 用户注册       | POST     | /auth/register          | 注册按钮触发，成功后跳转登录     |
  | 提交评论       | POST     | /poems/:id/comments     | 评论提交按钮触发，提交后刷新列表 |
  | 评论列表       | GET      | /poems/:id/comments     | 进入详情页时触发                |
  | 标签列表       | GET      | /tags                   | 诗词列表页筛选区加载            |
  | 热门标签       | GET      | /tags/popular           | 首页/热门标签页加载              |
  | 标签详情       | GET      | /tags/:id               | 点击标签时触发，展示关联诗词     |

### 4. UI/UX极简约束（核心！拒绝复杂）
- 视觉风格：
  ✅ 主色调：浅米色（#F5F5DC）+ 深墨色（#333333）+ 浅灰色（#EEEEEE，标签背景）；
  ✅ 字体：仅用系统默认字体，无自定义字体（减少加载资源）；
  ✅ 布局：流式布局，适配PC/手机（移动端仅调整字体大小和筛选区换行，无复杂适配）；
- 交互约束：
  ✅ 加载状态：仅显示“加载中...”文字，无动画；
  ✅ 反馈：仅点赞按钮点击变灰、Toast文字提示，无悬浮/渐变/弹窗动画；
  ✅ 无冗余装饰：无图片/图标（仅文字），标签用纯文字+浅灰色背景区分。

### 5. 开发流程规范

#### 5.1 环境搭建流程

1. **基础环境准备**
   - 安装 Node.js (v16.0+)
   - 安装 npm 或 yarn
   - 确保后端服务（Server目录）已启动并运行在 http://localhost:3000

2. **项目初始化**
   ```bash
   # 在项目根目录创建前端目录
   mkdir Client
   cd Client
   
   # 使用 Vite 创建 Vue 项目
   npm create vite@latest . -- --template vue
   
   # 安装依赖
   npm install vue-router axios
   
   # 创建项目目录结构
   mkdir -p src/api src/components src/pages src/utils src/style src/router
   ```

3. **配置文件创建**
   - 创建 `.env` 和 `.env.development` 配置文件
   - 创建 `vite.config.js` 配置文件
   - 创建路由配置文件

#### 5.2 编码规范

1. **文件命名规范**
   - 组件文件：大驼峰命名，如 `PoemList.vue`
   - JS/API文件：小驼峰命名，如 `poemApi.js`
   - 工具文件：小驼峰命名，如 `auth.js`
   - 样式文件：使用 `index.css` 命名主样式文件

2. **代码风格规范**
   - 变量/函数名：小驼峰命名
   - 组件/类名：大驼峰命名
   - 常量：使用 `const` 定义，全大写加下划线分隔
   - 缩进：使用 2 个空格
   - 字符串：优先使用单引号
   - 注释：
     - 组件：添加功能说明、props 和 emits 说明
     - API 函数：添加功能说明、参数和返回值说明
     - 工具函数：添加功能说明、参数和返回值说明

3. **Vue 组件规范**
   - 使用 Composition API
   - 遵循 `<script setup>` 语法糖
   - 组件逻辑拆分清晰：
     1. 导入语句
     2. Props 和 Emits 定义
     3. 响应式数据定义
     4. 计算属性
     5. 生命周期钩子
     6. 方法定义
     7. 事件处理

4. **样式规范**
   - 使用语义化 class 命名
   - 遵循 BEM 命名约定（Block__Element--Modifier）
   - 样式定义顺序：定位、盒模型、尺寸、排版、颜色、其他
   - 移动端适配：使用媒体查询，断点设置为 768px

#### 5.3 代码提交规范

1. **Git 分支管理**
   - `main`：主分支，稳定版本
   - `dev`：开发分支
   - 功能分支：`feature/功能名称`

2. **提交信息格式**
   ```
   <类型>: <描述>
   
   [可选] 详细说明
   ```
   
   类型说明：
   - `feat`: 新功能
   - `fix`: 修复 bug
   - `docs`: 文档更新
   - `style`: 代码格式调整（不影响功能）
   - `refactor`: 代码重构
   - `chore`: 构建过程或辅助工具变动

3. **提交步骤**
   ```bash
   # 添加更改
   git add .
   
   # 提交更改
   git commit -m "feat: 添加诗词列表页面"
   
   # 推送到远程分支
   git push origin 分支名
   ```

### 6. 组件设计标准

#### 6.1 组件拆分原则

1. **单一职责原则**
   - 每个组件只负责一个功能点
   - 组件体积要小，不超过 200 行代码
   - 避免创建过于复杂的组件

2. **可复用性优先**
   - 优先创建可在多个地方复用的通用组件
   - 页面级组件可以使用多个子组件组合构建
   - 避免在页面组件中编写过多重复代码

3. **组件分类**
   - 原子组件：不可再拆分的最小 UI 单元（如按钮、输入框）
   - 业务组件：包含特定业务逻辑的组件（如诗词卡片、评论项）
   - 页面组件：作为页面容器的组件

4. **本项目组件列表**
   - 原子组件：TagItem.vue（标签项）
   - 业务组件：Card.vue（诗词卡片）、Comment.vue（评论项）、Toast.vue（提示框）
   - 页面组件：Home.vue、PoemList.vue、PoemDetail.vue、TagDetail.vue、Login.vue

#### 6.2 Props 定义规范

1. **Props 命名**
   - 使用小驼峰命名
   - 语义化命名，清晰表达数据含义

2. **类型定义**
   - 必须明确指定类型（String, Number, Boolean, Array, Object, Function 等）
   - 使用 Vue 的 PropType 进行复杂类型定义

3. **默认值设置**
   - 为所有非必需 props 设置默认值
   - 对于数组和对象类型，使用工厂函数返回默认值

4. **验证规则**
   - 对重要 props 添加验证规则
   - 使用 required 标记必需的 props

5. **Props 定义示例**
   ```javascript
   // Card.vue 组件 props 定义示例
   const props = defineProps({
     // 诗词数据
     poem: {
       type: Object,
       required: true,
       validator: (value) => {
         return value && typeof value.title === 'string' && typeof value.author === 'string'
       }
     },
     // 卡片样式类型
     type: {
       type: String,
       default: 'default',
       validator: (value) => ['default', 'compact', 'detailed'].includes(value)
     },
     // 是否可点击
     clickable: {
       type: Boolean,
       default: true
     }
   })
   ```

#### 6.3 组件复用原则

1. **配置化设计**
   - 通过 props 控制组件的行为和外观
   - 避免为相似功能创建多个组件

2. **组合优于继承**
   - 使用组件组合而非继承来复用功能
   - 利用 slot 机制增强组件灵活性

3. **事件传递规范**
   - 使用 kebab-case 命名自定义事件
   - 事件命名应体现具体的交互行为
   - 事件传递数据时，结构应简洁明了

4. **状态管理**
   - 组件内部状态使用 ref() 或 reactive()
   - 共享状态通过 props 或全局状态管理
   - 避免组件间直接通信，应通过父组件中转

5. **复用示例**
   ```html
   <!-- TagItem 组件复用示例 -->
   <!-- 在首页中使用 -->
   <TagItem 
     v-for="tag in popularTags" 
     :key="tag.id" 
     :tag="tag"
     @click="handleTagClick(tag)"
   />
   
   <!-- 在诗词详情页中使用 -->
   <TagItem 
     v-for="tag in poem.tags" 
     :key="tag.id" 
     :tag="tag"
     @click="handleTagClick(tag)"
     :small="true"  <!-- 通过 prop 调整样式 -->
   />
   ```

#### 6.4 组件通信方式

1. **父组件向子组件通信**
   - 使用 props 传递数据和配置
   - 通过 ref 调用子组件方法

2. **子组件向父组件通信**
   - 使用 emit 触发自定义事件
   - 事件命名使用 kebab-case

3. **跨组件通信**
   - 对于简单场景，使用 props 和 emit 通过父组件中转
   - 对于复杂场景，可以使用 Vue 的 provide/inject 机制
   - 避免滥用全局状态管理

### 7. 性能优化策略

#### 7.1 代码分割与懒加载

1. **路由懒加载**
   - 使用动态导入()实现路由组件的按需加载
   - 减少首次加载的包体积，提升首屏加载速度
   - 每个路由组件单独打包

   ```javascript
   // router/index.js 路由懒加载配置示例
   import { createRouter, createWebHistory } from 'vue-router'
   
   const routes = [
     {
       path: '/',
       name: 'Home',
       component: () => import('../pages/Home.vue') // 懒加载
     },
     {
       path: '/poems',
       name: 'PoemList',
       component: () => import('../pages/PoemList.vue') // 懒加载
     },
     {
       path: '/poem/:id',
       name: 'PoemDetail',
       component: () => import('../pages/PoemDetail.vue') // 懒加载
     },
     {
       path: '/tag/:id',
       name: 'TagDetail',
       component: () => import('../pages/TagDetail.vue') // 懒加载
     },
     {
       path: '/login',
       name: 'Login',
       component: () => import('../pages/Login.vue') // 懒加载
     }
   ]
   
   const router = createRouter({
     history: createWebHistory(),
     routes
   })
   
   export default router
   ```

2. **组件懒加载**
   - 对较大的非首屏组件使用懒加载
   - 避免不必要的资源加载

   ```javascript
   // 组件懒加载示例
   const CommentList = () => import('./CommentList.vue')
   
   export default {
     components: {
       CommentList // 异步组件
     }
   }
   ```

#### 7.2 图片与资源优化

1. **图片优化**
   - 使用适当的图片格式（优先使用 WebP）
   - 图片懒加载，仅在视窗内才加载图片
   - 压缩图片大小，避免过大的图片资源

2. **资源缓存策略**
   - 利用浏览器缓存机制
   - 为静态资源添加哈希值，实现长期缓存
   - 合理设置 Cache-Control 响应头

#### 7.3 网络请求优化

1. **请求合并与防抖节流**
   - 使用防抖处理搜索输入等频繁触发的事件
   - 使用节流处理滚动加载等场景
   
   ```javascript
   // utils/debounce.js 防抖函数示例
   export function debounce(func, wait) {
     let timeout
     return function executedFunction(...args) {
       const later = () => {
         clearTimeout(timeout)
         func(...args)
       }
       clearTimeout(timeout)
       timeout = setTimeout(later, wait)
     }
   }
   ```

2. **数据缓存**
   - 对不常变化的数据进行本地缓存
   - 使用 sessionStorage 或 localStorage 存储数据
   - 实现数据的过期策略

3. **分页加载**
   - 列表数据使用分页加载
   - 每次只获取必要的数据量
   - 实现上拉加载更多功能

#### 7.4 渲染优化

1. **虚拟列表**
   - 对于长列表，使用虚拟列表技术
   - 仅渲染可视区域内的列表项
   - 减少 DOM 节点数量，提升性能

2. **避免不必要的重渲染**
   - 使用 memo 缓存组件
   - 合理使用 computed 和 watch
   - 避免在模板中进行复杂计算

   ```javascript
   // 使用 computed 缓存计算结果示例
   import { computed } from 'vue'
   
   export default {
     props: ['poems', 'searchTerm'],
     setup(props) {
       // 缓存过滤结果，避免每次渲染都重新计算
       const filteredPoems = computed(() => {
         if (!props.searchTerm) return props.poems
         return props.poems.filter(poem => 
           poem.title.includes(props.searchTerm) || 
           poem.author.includes(props.searchTerm)
         )
       })
       
       return {
         filteredPoems
       }
     }
   }
   ```

3. **使用 Transition 组件**
   - 为页面切换添加平滑过渡动画
   - 提升用户体验

### 8. 异常处理机制

#### 8.1 API 请求错误处理

1. **统一错误处理**
   - 在 Axios 拦截器中统一处理 API 请求错误
   - 分类处理不同类型的错误（网络错误、超时、服务器错误等）
   - 提供友好的错误提示

   ```javascript
   // utils/request.js Axios 错误处理示例
   import axios from 'axios'
   import { showToast } from '../components/Toast.vue'
   
   const request = axios.create({
     baseURL: import.meta.env.VITE_API_BASE_URL,
     timeout: 10000
   })
   
   // 响应拦截器
   request.interceptors.response.use(
     response => {
       return response.data
     },
     error => {
       // 错误处理
       if (error.response) {
         // 服务器返回错误状态码
         switch (error.response.status) {
           case 401:
             showToast('未授权，请重新登录')
             // 可以在这里跳转到登录页
             break
           case 403:
             showToast('拒绝访问')
             break
           case 404:
             showToast('请求的资源不存在')
             break
           case 500:
             showToast('服务器内部错误')
             break
           default:
             showToast(`请求失败: ${error.response.status}`)
         }
       } else if (error.request) {
         // 请求已发出但没有收到响应
         showToast('网络错误，请检查您的网络连接')
       } else {
         // 请求配置出错
         showToast(`请求错误: ${error.message}`)
       }
       
       // 记录错误日志
       console.error('API 请求错误:', error)
       
       return Promise.reject(error)
     }
   )
   
   export default request
   ```

2. **请求重试机制**
   - 对于临时性网络错误，实现自动重试机制
   - 限制重试次数，避免无限重试

#### 8.2 错误边界组件

1. **Vue 错误边界实现**
   - 使用 Vue 3 的错误处理 API
   - 捕获组件渲染过程中的错误
   - 提供兜底 UI 展示

   ```javascript
   // components/ErrorBoundary.vue 错误边界组件示例
   <template>
     <div v-if="error" class="error-boundary">
       <h3>发生错误</h3>
       <p>{{ errorMessage }}</p>
       <button @click="resetError">重新加载</button>
     </div>
     <slot v-else></slot>
   </template>
   
   <script setup>
   import { ref, onErrorCaptured } from 'vue'
   
   const error = ref(false)
   const errorMessage = ref('')
   
   // 捕获子组件错误
   onErrorCaptured((err) => {
     error.value = true
     errorMessage.value = err.message
     console.error('组件错误:', err)
     return false // 阻止错误继续向上传播
   })
   
   // 重置错误状态
   const resetError = () => {
     error.value = false
     errorMessage.value = ''
     // 可以在这里添加重新加载组件的逻辑
   }
   </script>
   ```

2. **使用错误边界**
   - 在页面组件外层包裹错误边界组件
   - 保护核心功能不受影响

   ```html
   <!-- 在页面中使用错误边界 -->
   <template>
     <ErrorBoundary>
       <PoemDetail :id="poemId" />
     </ErrorBoundary>
   </template>
   ```

#### 8.3 用户提示标准

1. **提示类型**
   - **Toast 提示**：操作成功、失败或需要用户注意的简短信息
   - **确认对话框**：重要操作前的二次确认
   - **加载提示**：耗时操作的加载状态

2. **提示内容规范**
   - 简洁明了，使用通俗易懂的语言
   - 错误提示应包含具体原因和可能的解决方法
   - 避免技术术语，保持友好的语气

3. **Toast 组件使用示例**
   ```javascript
   // 导入 Toast 组件
   import { showToast } from '../components/Toast.vue'
   
   // 成功提示
   showToast('操作成功', 'success')
   
   // 错误提示
   showToast('操作失败，请重试', 'error')
   
   // 警告提示
   showToast('请检查输入信息', 'warning')
   ```

#### 8.4 调试与日志

1. **开发环境日志**
   - 使用 console.log 打印关键信息
   - 使用 console.error 打印错误信息
   - 使用 console.warn 打印警告信息

2. **生产环境日志**
   - 移除不必要的控制台日志
   - 仅记录关键错误信息
   - 可以考虑集成第三方日志服务（如需要）

3. **错误日志收集**
   - 捕获全局错误
   - 记录错误详情、用户操作路径等信息
   - 方便问题排查

   ```javascript
   // 在 main.js 中设置全局错误处理器
   app.config.errorHandler = (err, instance, info) => {
     console.error('全局错误:', err, info)
     // 这里可以添加错误日志上报逻辑
   }
   ```

### 9. 工程化与维护要求（单人友好）
- 极简项目结构（无多层嵌套）：
Client/
├── .env # 环境变量（API 基准地址）
├── src/
│ ├── api/ # 接口封装（分 2 个文件：poemApi.js/tagApi.js/authApi.js）
│ ├── components/ # 公共组件（仅 4 个：Card.vue/ Comment.vue/ Toast.vue/ TagItem.vue）
│ ├── pages/ # 页面（Home.vue/ PoemList.vue/ PoemDetail.vue/ TagDetail.vue/ Login.vue）
│ ├── utils/ # 工具类（仅 2 个：request.js（Axios 封装）/auth.js（JWT 存储））
│ ├── style/ # 全局样式（仅 1 个 index.css）
│ ├── router/ # 路由（仅 1 个 index.js，5 个路由）
│ └── main.js # 入口文件
├── index.html # 入口 HTML
├── package.json # 依赖（仅保留：vue/vite/axios）
└── README.md # 维护说明（部署步骤 + 接口对接说明）

- 代码规范：
✅ 变量/函数名小驼峰，每个接口封装/组件添加单行注释（说明功能）；
✅ 无冗余代码，未使用的变量/组件直接删除；
✅ 样式仅写必要规则，无冗余选择器，移动端适配仅用媒体查询调整字体/间距。

### 6. 交付物要求
- 完整源代码（可直接运行的项目，无依赖缺失）；
- 本地运行步骤（npm install → npm run dev）；
- 打包部署步骤（npm run build → 宝塔面板上传dist文件夹即可）；
- 核心注释：在API封装、JWT存储、标签筛选逻辑处添加注释，方便单人维护；
- 接口调试说明：标注各接口的参数示例（如 `/api/poems?page=1&size=10&tags=思乡`）。