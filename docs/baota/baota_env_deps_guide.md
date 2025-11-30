# 环境变量和依赖安装指南

本文档详细介绍如何为诗词API项目配置环境变量和安装依赖，确保应用能够正常运行。

## 1. 环境变量配置

环境变量对于Node.js应用至关重要，用于存储敏感信息和配置项。

### 1.1 创建.env文件

1. 在宝塔面板中进入站点的「文件」选项卡
2. 导航到项目根目录
3. 点击「新建文件」按钮
4. 文件名输入`.env`（注意开头的点）
5. 点击「确定」

### 1.2 配置环境变量

编辑`.env`文件，添加以下配置内容：

```env
# 服务器配置
PORT=3000
NODE_ENV=production

# MongoDB数据库连接信息
MONGODB_URI=mongodb://shici_user:您的密码@127.0.0.1:27017/shici

# JWT配置
JWT_SECRET=your_jwt_secret_key_here_change_this_to_a_secure_value
JWT_EXPIRES_IN=24h

# 跨域配置
ALLOWED_ORIGINS=*

# 日志配置
LOG_LEVEL=info
LOG_FILE=/www/wwwlogs/shiciapi.log

# API配置
API_PREFIX=/api
PAGE_SIZE=10
```

### 1.3 环境变量说明

| 环境变量 | 说明 | 示例值 |
|---------|------|--------|
| PORT | 应用运行端口 | 3000 |
| NODE_ENV | 运行环境 | production |
| MONGODB_URI | MongoDB连接字符串 | mongodb://user:pass@127.0.0.1:27017/shici |
| JWT_SECRET | JWT签名密钥 | your_secure_secret_key |
| JWT_EXPIRES_IN | JWT过期时间 | 24h |
| ALLOWED_ORIGINS | 允许的跨域来源 | * 或 https://yourdomain.com |
| LOG_LEVEL | 日志级别 | info, warn, error |
| LOG_FILE | 日志文件路径 | /www/wwwlogs/shiciapi.log |
| API_PREFIX | API路径前缀 | /api |
| PAGE_SIZE | 默认分页大小 | 10 |

### 1.4 安全注意事项

- **JWT_SECRET**：必须设置为强密钥，推荐使用随机生成的字符串
- **数据库密码**：不要使用简单密码，建议使用字母、数字和特殊字符的组合
- **.env文件**：确保此文件不会被提交到版本控制系统（已在.gitignore中配置）

## 2. 安装项目依赖

### 2.1 进入终端

1. 在宝塔面板中进入站点
2. 点击「终端」按钮
3. 确保当前目录是项目根目录（/www/wwwroot/shiciapi）

### 2.2 安装npm依赖

执行以下命令安装项目依赖：

```bash
# 安装所有依赖（包括开发依赖）
npm install

# 或者只安装生产依赖（推荐用于生产环境）
npm install --production
```

### 2.3 安装过程中可能出现的问题

#### 2.3.1 权限问题

如果遇到权限错误，可以尝试：

```bash
# 更改npm全局目录权限
npm config set user 0
npm config set unsafe-perm true

# 然后重新安装
sudo npm install --production
```

#### 2.3.2 内存不足

对于内存较小的服务器，可以增加Node.js内存限制：

```bash
# 设置Node.js内存限制为1GB
NODE_OPTIONS="--max-old-space-size=1024" npm install --production
```

#### 2.3.3 网络问题

如果遇到下载缓慢或超时，可以使用npm镜像：

```bash
# 使用淘宝npm镜像
npm install --production --registry=https://registry.npm.taobao.org

# 或者使用npm官方镜像（备选）
npm install --production --registry=https://registry.npmmirror.com
```

### 2.4 验证依赖安装

安装完成后，可以验证依赖是否正确安装：

```bash
# 查看已安装的依赖
npm list --production

# 检查package.json中的依赖是否都已安装
npm ls
```

## 3. 优化依赖安装

### 3.1 使用npm ci提高安装速度

对于生产环境，使用`npm ci`可以更快、更可靠地安装依赖：

```bash
# 删除node_modules和package-lock.json
rm -rf node_modules
rm package-lock.json

# 使用npm ci安装（会使用package-lock.json中的精确版本）
npm ci --production
```

### 3.2 创建依赖缓存目录

在宝塔面板中，可以创建一个全局的npm缓存目录，加速后续安装：

```bash
# 创建全局缓存目录
mkdir -p /www/.npm

# 设置npm缓存目录
npm config set cache /www/.npm

# 设置权限
chown -R www:www /www/.npm
```

## 4. 创建环境变量示例文件

为了方便后续配置，建议创建一个示例环境变量文件：

### 4.1 创建.env.example文件

1. 在项目根目录创建`.env.example`文件
2. 内容与.env相同，但使用占位符替换实际值：

```env
# 服务器配置
PORT=3000
NODE_ENV=production

# MongoDB数据库连接信息
MONGODB_URI=mongodb://用户名:密码@localhost:27017/数据库名

# JWT配置
JWT_SECRET=your_jwt_secret_key_here_change_this_to_a_secure_value
JWT_EXPIRES_IN=24h

# 跨域配置
ALLOWED_ORIGINS=*

# 日志配置
LOG_LEVEL=info
LOG_FILE=/path/to/your/logfile.log

# API配置
API_PREFIX=/api
PAGE_SIZE=10
```

### 4.2 使用脚本自动创建.env文件

可以创建一个脚本来帮助用户创建.env文件：

1. 在项目根目录创建`setup-env.js`文件：

```javascript
// setup-env.js - 自动创建.env文件
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 环境变量问题列表
const questions = [
  { key: 'PORT', message: '服务器端口 (默认: 3000): ', default: '3000' },
  { key: 'NODE_ENV', message: '运行环境 (默认: production): ', default: 'production' },
  { key: 'MONGODB_URI', message: 'MongoDB连接字符串: ' },
  { key: 'JWT_SECRET', message: 'JWT签名密钥: ' },
  { key: 'JWT_EXPIRES_IN', message: 'JWT过期时间 (默认: 24h): ', default: '24h' },
  { key: 'ALLOWED_ORIGINS', message: '允许的跨域来源 (默认: *): ', default: '*' },
  { key: 'API_PREFIX', message: 'API路径前缀 (默认: /api): ', default: '/api' },
  { key: 'PAGE_SIZE', message: '默认分页大小 (默认: 10): ', default: '10' }
];

// 开始收集配置
async function collectConfig() {
  console.log('请输入环境变量配置:');
  console.log('-----------------------------------');
  
  const config = {};
  
  for (const question of questions) {
    await new Promise((resolve) => {
      rl.question(question.message, (answer) => {
        config[question.key] = answer || question.default;
        resolve();
      });
    });
  }
  
  return config;
}

// 生成.env文件内容
function generateEnvContent(config) {
  let content = '# 诗词API项目环境变量\n\n';
  
  // 分组输出环境变量
  content += '# 服务器配置\n';
  content += `PORT=${config.PORT}\n`;
  content += `NODE_ENV=${config.NODE_ENV}\n\n`;
  
  content += '# MongoDB数据库连接信息\n';
  content += `MONGODB_URI=${config.MONGODB_URI}\n\n`;
  
  content += '# JWT配置\n';
  content += `JWT_SECRET=${config.JWT_SECRET}\n`;
  content += `JWT_EXPIRES_IN=${config.JWT_EXPIRES_IN}\n\n`;
  
  content += '# 跨域配置\n';
  content += `ALLOWED_ORIGINS=${config.ALLOWED_ORIGINS}\n\n`;
  
  content += '# API配置\n';
  content += `API_PREFIX=${config.API_PREFIX}\n`;
  content += `PAGE_SIZE=${config.PAGE_SIZE}\n`;
  
  return content;
}

// 保存到.env文件
function saveEnvFile(content) {
  try {
    fs.writeFileSync('.env', content);
    console.log('-----------------------------------');
    console.log('.env文件已成功创建！');
    console.log('请检查.env文件内容是否正确。');
  } catch (err) {
    console.error('创建.env文件失败:', err);
  }
}

// 主函数
async function main() {
  try {
    const config = await collectConfig();
    const content = generateEnvContent(config);
    saveEnvFile(content);
  } catch (err) {
    console.error('错误:', err);
  } finally {
    rl.close();
  }
}

// 执行主函数
main();
```

2. 运行脚本：

```bash
node setup-env.js
```

## 5. 依赖管理最佳实践

### 5.1 版本锁定

确保在`package.json`中锁定依赖版本，避免自动升级导致的兼容性问题：

```json
"dependencies": {
  "express": "^4.17.1",
  "mongoose": "^6.0.12",
  "jsonwebtoken": "^8.5.1"
}
```

### 5.2 定期更新依赖

定期检查并更新依赖，确保安全性和性能：

```bash
# 检查过时的依赖
npm outdated

# 更新所有依赖
npm update

# 更新单个依赖
npm update express
```

### 5.3 依赖分析

使用`npm audit`检查依赖的安全漏洞：

```bash
# 检查安全漏洞
npm audit

# 自动修复安全漏洞
npm audit fix
```

## 6. 多环境配置（高级）

对于复杂项目，可能需要为不同环境配置不同的环境变量：

### 6.1 创建多环境配置文件

```bash
# 开发环境
.env.development

# 测试环境
.env.test

# 生产环境
.env.production
```

### 6.2 修改启动脚本

在`package.json`中添加不同环境的启动脚本：

```json
"scripts": {
  "start": "NODE_ENV=production node server.js",
  "dev": "NODE_ENV=development nodemon server.js",
  "test": "NODE_ENV=test mocha"
}
```

### 6.3 使用dotenv-expand扩展变量

对于复杂的环境变量配置，可以使用`dotenv-expand`：

```bash
npm install dotenv dotenv-expand --save
```

在应用入口文件中：

```javascript
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

// 加载.env文件
const envConfig = dotenv.config();
dotenvExpand.expand(envConfig);
```

## 7. 环境变量配置验证

### 7.1 创建验证脚本

可以创建一个脚本来验证环境变量配置是否完整：

1. 创建`validate-env.js`文件：

```javascript
// validate-env.js - 验证环境变量配置
const dotenv = require('dotenv');

// 加载.env文件
dotenv.config();

// 必需的环境变量列表
const requiredEnvVars = [
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN'
];

// 验证函数
function validateEnv() {
  console.log('开始验证环境变量配置...');
  const missingVars = [];
  
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.error('错误: 缺少以下必需的环境变量:');
    missingVars.forEach(varName => {
      console.error(`  - ${varName}`);
    });
    return false;
  }
  
  // 检查MongoDB连接字符串格式
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.startsWith('mongodb://')) {
    console.error('错误: MONGODB_URI格式不正确');
    return false;
  }
  
  // 检查JWT密钥强度
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 16) {
    console.warn('警告: JWT_SECRET长度应该至少为16个字符，当前强度可能不足');
  }
  
  console.log('环境变量验证通过!');
  return true;
}

// 执行验证
if (!validateEnv()) {
  process.exit(1);
}
```

2. 运行验证脚本：

```bash
node validate-env.js
```

---

通过以上步骤，您应该能够成功配置环境变量并安装项目依赖。配置完成后，可以继续进行PM2应用管理的设置。