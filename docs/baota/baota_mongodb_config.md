# 宝塔面板 MongoDB 配置指南

本文档详细介绍如何在宝塔面板中为诗词API项目配置MongoDB数据库。

## 1. MongoDB 安装与启动

### 1.1 安装 MongoDB

如果您还没有在宝塔面板中安装MongoDB：

1. 登录宝塔面板
2. 点击左侧菜单「软件商店」
3. 搜索「MongoDB」
4. 选择稳定版本（建议 4.4+）
5. 点击「安装」按钮
6. 安装完成后，等待服务自动启动

### 1.2 检查 MongoDB 服务状态

1. 安装完成后，点击左侧菜单「软件商店」
2. 找到已安装的「MongoDB」并点击「设置」
3. 查看服务状态，确保显示为「已启动」

## 2. 创建数据库和用户

### 2.1 进入 MongoDB 管理界面

1. 登录宝塔面板
2. 点击左侧菜单「数据库」
3. 选择「MongoDB」选项卡

### 2.2 创建数据库

1. 在 MongoDB 管理界面点击「添加数据库」
2. 填写以下信息：
   - **数据库名**：`shici`（推荐使用此名称，与项目配置保持一致）
   - **用户名**：`shici_user`（自定义用户名，建议使用有意义的名称）
   - **密码**：设置一个强密码（请妥善保存，稍后配置环境变量时需要）
3. 点击「提交」按钮

### 2.3 数据库列表确认

添加完成后，在数据库列表中可以看到刚创建的数据库信息，包括：
- 数据库名
- 用户名
- 状态
- 创建时间

## 3. MongoDB 连接配置

### 3.1 获取连接信息

记录以下连接信息，稍后配置环境变量时需要：

| 连接参数 | 值 | 说明 |
|---------|-----|------|
| 数据库地址 | `127.0.0.1` | 本地连接地址，也可以使用服务器IP |
| 数据库端口 | `27017` | MongoDB默认端口 |
| 数据库名 | `shici` | 您创建的数据库名 |
| 用户名 | `shici_user` | 您创建的用户名 |
| 密码 | 您设置的密码 | 数据库用户密码 |

### 3.2 连接字符串格式

完整的MongoDB连接字符串格式如下：

```
mongodb://用户名:密码@地址:端口/数据库名
```

根据您的配置，实际连接字符串示例：

```
mongodb://shici_user:您的密码@127.0.0.1:27017/shici
```

## 4. MongoDB 配置文件说明

### 4.1 配置文件位置

宝塔面板中MongoDB的配置文件通常位于：

```
/www/server/mongodb/conf/mongodb.conf
```

### 4.2 常用配置参数

以下是一些常用的MongoDB配置参数：

```conf
# 数据库路径
dbpath=/www/server/mongodb/data

# 日志输出文件路径
logpath=/www/server/mongodb/log/mongodb.log

# 端口号
port=27017

# 以守护进程的方式运行
fork=true

# 允许远程连接
bind_ip=0.0.0.0

# 开启认证
auth=true
```

### 4.3 修改配置文件（高级用户）

如需修改MongoDB配置：

1. 点击左侧菜单「软件商店」
2. 找到「MongoDB」并点击「设置」
3. 点击「配置修改」
4. 编辑配置参数
5. 点击「保存」
6. 重启MongoDB服务

## 5. MongoDB 数据库管理

### 5.1 数据库备份

1. 点击左侧菜单「数据库」
2. 选择「MongoDB」选项卡
3. 找到要备份的数据库
4. 点击「备份」按钮
5. 选择备份类型（全量备份/增量备份）
6. 点击「提交」

### 5.2 数据库恢复

1. 点击左侧菜单「数据库」
2. 选择「MongoDB」选项卡
3. 点击「数据备份」
4. 找到需要恢复的备份文件
5. 点击「恢复」按钮

### 5.3 查看数据库状态

1. 点击左侧菜单「数据库」
2. 选择「MongoDB」选项卡
3. 在数据库列表中查看状态

## 6. MongoDB 连接测试

### 6.1 使用宝塔终端测试连接

1. 进入站点的终端
2. 执行以下命令测试MongoDB连接：

```bash
# 安装MongoDB客户端工具
cd /www/wwwroot/shiciapi
npm install mongodb --save-dev

# 运行连接测试脚本
node -e "const MongoClient = require('mongodb').MongoClient; const uri = 'mongodb://shici_user:您的密码@127.0.0.1:27017/shici'; MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }).then(client => { console.log('成功连接到MongoDB!'); client.close(); }).catch(err => { console.error('连接失败:', err); });"
```

如果连接成功，将显示"成功连接到MongoDB!"。

### 6.2 使用MongoDB Compass测试连接

如果您在本地电脑上安装了MongoDB Compass：

1. 打开MongoDB Compass
2. 输入连接字符串（包含用户名和密码）
3. 点击「Connect」
4. 如果连接成功，可以看到数据库和集合列表

## 7. 数据库初始化脚本

### 7.1 创建初始化脚本

为了方便初始化数据库，可以创建一个脚本：

在项目根目录创建`init_db.js`文件：

```javascript
// 初始化MongoDB数据库脚本
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

// 从环境变量获取MongoDB连接字符串
const uri = process.env.MONGODB_URI || 'mongodb://shici_user:password@127.0.0.1:27017/shici';

async function initDatabase() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    
    try {
        // 连接到MongoDB服务器
        await client.connect();
        console.log('成功连接到MongoDB服务器');
        
        // 获取数据库
        const db = client.db();
        
        // 创建索引（如果需要）
        await db.collection('shicis').createIndex({ title: 1 });
        await db.collection('users').createIndex({ username: 1 }, { unique: true });
        
        // 插入示例数据（可选）
        const shiciData = [
            {
                title: '静夜思',
                author: '李白',
                dynasty: '唐',
                content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
                tags: ['思乡', '月亮'],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: '望庐山瀑布',
                author: '李白',
                dynasty: '唐',
                content: '日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。',
                tags: ['山水', '壮观'],
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        
        // 检查集合是否为空
        const count = await db.collection('shicis').countDocuments();
        if (count === 0) {
            await db.collection('shicis').insertMany(shiciData);
            console.log('已插入示例诗词数据');
        } else {
            console.log('诗词集合不为空，跳过插入示例数据');
        }
        
        console.log('数据库初始化完成');
    } catch (error) {
        console.error('数据库初始化失败:', error);
    } finally {
        // 关闭连接
        await client.close();
    }
}

// 执行初始化函数
initDatabase();
```

### 7.2 运行初始化脚本

1. 确保环境变量中已配置MongoDB连接信息
2. 执行以下命令：

```bash
cd /www/wwwroot/shiciapi
node init_db.js
```

## 8. MongoDB 安全配置

### 8.1 开启认证

确保MongoDB已开启认证，这样用户必须提供用户名和密码才能连接：

1. 点击左侧菜单「软件商店」
2. 找到「MongoDB」并点击「设置」
3. 点击「配置修改」
4. 确保有以下配置行：
   ```
   auth=true
   ```
5. 保存并重启MongoDB服务

### 8.2 防火墙设置

确保MongoDB端口（27017）已在防火墙中配置：

1. 点击左侧菜单「安全」
2. 确保已添加规则开放27017端口
3. 建议仅允许特定IP访问MongoDB端口，增强安全性

## 9. 常见问题排查

### 9.1 无法连接到MongoDB

可能的原因和解决方案：

1. **连接字符串错误**：
   - 检查用户名、密码、数据库名是否正确
   - 确保使用了正确的连接格式

2. **MongoDB服务未启动**：
   - 在宝塔面板中检查MongoDB服务状态
   - 重启MongoDB服务

3. **防火墙限制**：
   - 确认服务器防火墙允许27017端口
   - 检查宝塔面板安全设置

4. **认证问题**：
   - 确认用户名和密码正确
   - 验证用户是否有访问该数据库的权限

### 9.2 数据库操作失败

1. **权限不足**：
   - 检查数据库用户权限是否正确设置

2. **集合不存在**：
   - MongoDB会自动创建不存在的集合，可以忽略相关警告

3. **索引冲突**：
   - 如果创建索引失败，检查索引是否已存在或有冲突

## 10. 性能优化建议

### 10.1 创建适当的索引

为常用查询字段创建索引可以提高查询性能：

```javascript
// 例如，为诗词标题和作者创建索引
await db.collection('shicis').createIndex({ title: 1 });
await db.collection('shicis').createIndex({ author: 1 });
await db.collection('shicis').createIndex({ tags: 1 });
```

### 10.2 监控数据库性能

可以使用MongoDB的内置工具监控性能：

```bash
# 查看MongoDB运行状态
mongo --eval "db.serverStatus()"

# 查看慢查询日志
mongo --eval "db.currentOp()"
```

---

通过以上步骤，您应该能够成功在宝塔面板中配置MongoDB数据库，并与诗词API项目连接。如果遇到任何问题，请参考常见问题排查部分或寻求技术支持。