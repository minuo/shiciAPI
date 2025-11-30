# PM2 Node.js应用管理指南

本文档详细介绍如何在宝塔面板中使用PM2管理器来部署、运行和监控诗词API应用，确保应用稳定运行并实现自动重启。

## 1. PM2介绍

PM2（Process Manager 2）是Node.js应用的生产进程管理器，具有以下优势：

- **负载均衡**：自动为应用分配CPU资源
- **自动重启**：应用崩溃时自动重启
- **0秒停机重载**：无缝部署新版本
- **日志管理**：集中管理应用日志
- **监控**：监控应用性能和资源使用情况
- **开机自启**：服务器重启后自动启动应用

## 2. 安装PM2

### 2.1 宝塔面板内置PM2管理器

宝塔面板提供了图形化的PM2管理器插件：

1. 登录宝塔面板
2. 点击左侧菜单「软件商店」
3. 搜索「PM2管理器」
4. 点击「安装」按钮
5. 安装完成后，等待服务启动

### 2.2 命令行安装（可选）

如果需要在终端中使用PM2命令，可以全局安装：

```bash
npm install pm2 -g
```

## 3. 在宝塔面板中创建PM2应用

### 3.1 进入PM2管理器

1. 登录宝塔面板
2. 点击左侧菜单「软件商店」
3. 找到已安装的「PM2管理器」并点击「设置」

### 3.2 创建新应用

1. 在PM2管理器页面点击「添加项目」
2. 填写以下信息：
   - **项目名称**：`shiciAPI`（自定义，建议使用有意义的名称）
   - **运行目录**：`/www/wwwroot/shiciapi`（项目根目录）
   - **启动文件**：`server.js`（应用主入口文件，根据实际情况调整）
   - **运行用户**：`www`（推荐使用www用户，与站点用户一致）
   - **端口**：`3000`（与.env文件中的PORT保持一致）
   - **环境变量**：可以在这里额外配置，也可以使用.env文件（推荐）
3. 点击「提交」按钮

### 3.3 配置启动参数（高级选项）

对于需要特殊启动参数的应用，可以在添加项目时进行配置：

- **Node版本**：选择与项目兼容的Node.js版本
- **启动参数**：如`--harmony`等特殊参数
- **最大内存限制**：设置应用最大内存使用量（防止内存泄漏）

## 4. PM2应用管理

### 4.1 基本操作

在PM2管理器中，可以对应用进行以下操作：

- **启动**：启动应用
- **停止**：停止应用
- **重启**：重启应用
- **删除**：删除应用
- **日志**：查看应用日志
- **状态**：查看应用运行状态

### 4.2 设置开机自启

为了确保服务器重启后应用能自动运行：

1. 在PM2管理器中勾选需要设置自启的应用
2. 点击「更多」按钮
3. 选择「自动启动」

### 4.3 配置PM2集群模式

对于多核服务器，可以使用PM2的集群模式提高应用性能：

1. 在PM2管理器中找到您的应用
2. 点击「更多」按钮
3. 选择「编辑」
4. 将「运行模式」改为「cluster」
5. 设置「实例数」（通常为CPU核心数）
6. 点击「提交」并重启应用

### 4.4 应用列表管理

在PM2管理器页面，可以查看所有已创建的应用及其状态：

- **ID**：应用在PM2中的唯一标识
- **名称**：应用名称
- **模式**：运行模式（fork/cluster）
- **状态**：运行状态（online/offline）
- **内存**：内存使用情况
- **CPU**：CPU使用情况
- **端口**：监听端口

## 5. PM2日志管理

### 5.1 查看应用日志

1. 在PM2管理器中找到您的应用
2. 点击「日志」按钮
3. 在日志查看窗口中可以看到应用的标准输出和错误输出

### 5.2 配置日志轮转

为了防止日志文件过大，可以配置日志轮转：

1. 登录服务器终端
2. 执行以下命令安装pm2-logrotate插件：

```bash
pm install -g pm2-logrotate
pm2 install pm2-logrotate
```

3. 配置日志轮转参数：

```bash
pm2 set pm2-logrotate:max_size 100M  # 单个日志文件最大100MB
pm2 set pm2-logrotate:compress true  # 启用压缩
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'  # 每天凌晨0点轮转
pm2 set pm2-logrotate:retain 7  # 保留7天的日志
```

### 5.3 导出日志

如果需要导出日志进行分析：

```bash
# 在终端中执行
pm2 logs shiciAPI --json > shiciapi_logs.json  # 以JSON格式导出日志

# 或者查看最近N行日志
pm2 logs shiciAPI --lines 1000 > shiciapi_recent.log
```

## 6. PM2性能监控

### 6.1 使用PM2 Plus（高级）

PM2提供了在线监控服务PM2 Plus：

1. 访问 [PM2 Plus官网](https://pm2.io/) 注册账户
2. 获取您的API密钥
3. 在服务器上执行：

```bash
pm2 link YOUR_API_KEY
```

### 6.2 使用宝塔面板监控

宝塔面板提供了基本的性能监控功能：

1. 点击左侧菜单「监控」
2. 可以查看服务器整体资源使用情况

### 6.3 设置性能告警（高级）

可以为应用设置性能告警，当达到阈值时通知您：

```bash
# 在终端中执行
# 当CPU使用率超过90%时告警
pm2 monitor shiciAPI --cpu 90

# 当内存使用超过500MB时告警
pm2 monitor shiciAPI --memory 500
```

## 7. PM2部署脚本

### 7.1 创建PM2配置文件

在项目根目录创建`ecosystem.config.js`文件：

```javascript
module.exports = {
  apps : [{
    name: 'shiciAPI',
    script: 'server.js',
    instances: 'max',  // 或指定具体数量，如2
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    // 日志配置
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    // 自定义启动参数
    args: [],
    // 错误日志路径
    error_file: '/www/wwwlogs/shiciapi-error.log',
    // 输出日志路径
    out_file: '/www/wwwlogs/shiciapi-out.log'
  }]
};
```

### 7.2 使用配置文件启动应用

1. 在宝塔面板中进入站点终端
2. 执行以下命令：

```bash
cd /www/wwwroot/shiciapi
pm install pm2 -g
pm2 start ecosystem.config.js
```

### 7.3 重载应用（零停机部署）

```bash
pm2 reload ecosystem.config.js
```

## 8. PM2应用管理最佳实践

### 8.1 合理设置实例数

- **Fork模式**：适用于不支持多线程的应用，设置为1
- **Cluster模式**：
  - CPU密集型应用：实例数 = CPU核心数
  - I/O密集型应用：实例数 = CPU核心数 * 2

### 8.2 设置内存限制

为应用设置合理的内存限制，防止内存泄漏导致服务器资源耗尽：

```javascript
// 在ecosystem.config.js中
max_memory_restart: '500M'  // 当内存使用超过500MB时自动重启
```

### 8.3 日志管理

- 不要在控制台输出过多日志（会占用磁盘空间）
- 配置日志轮转
- 及时清理旧日志

### 8.4 定期备份PM2配置

```bash
# 导出PM2应用列表
pm2 save

# 导出的配置保存在 ~/.pm2/dump.pm2
# 可以将其备份到其他位置
cp ~/.pm2/dump.pm2 /path/to/backup/
```

## 9. 常见问题排查

### 9.1 应用无法启动

1. **检查启动文件路径**：确保启动文件路径正确
2. **查看错误日志**：在PM2日志中查找详细错误信息
3. **检查端口占用**：确认端口未被其他应用占用
   ```bash
   netstat -tlnp | grep 3000
   ```
4. **权限问题**：确保应用有足够的文件读写权限

### 9.2 应用频繁重启

1. **内存限制过低**：增加内存限制值
2. **代码问题**：检查代码中可能导致崩溃的问题
3. **依赖问题**：确保所有依赖已正确安装

### 9.3 无法设置开机自启

1. **权限问题**：使用管理员权限执行PM2命令
2. **PM2版本问题**：更新到最新版本的PM2
   ```bash
   npm install pm2 -g
   ```
3. **重新设置自启**：
   ```bash
   pm2 save
   pm2 startup
   ```

### 9.4 日志文件过大

1. **配置日志轮转**：参考前面的日志轮转配置
2. **清理旧日志**：定期手动清理或设置自动清理脚本
3. **减少日志输出**：在生产环境中减少不必要的日志输出

## 10. 一键部署脚本

为了简化PM2应用管理，可以创建一个一键部署脚本：

### 10.1 创建deploy_pm2.sh脚本

在项目根目录创建`deploy_pm2.sh`文件：

```bash
#!/bin/bash

# 定义颜色输出
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m" # No Color

echo -e "${GREEN}开始部署诗词API项目（PM2管理）...${NC}"

# 进入项目目录
cd /www/wwwroot/shiciapi

# 检查是否安装了PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}未安装PM2，正在安装...${NC}"
    npm install pm2 -g
    if [ $? -ne 0 ]; then
        echo -e "${RED}PM2安装失败${NC}"
        exit 1
    fi
fi

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}警告：未找到.env文件${NC}"
    echo -e "${YELLOW}请确保已经正确配置了环境变量${NC}"
fi

# 检查PM2配置文件
if [ ! -f "ecosystem.config.js" ]; then
    echo -e "${YELLOW}未找到ecosystem.config.js，正在创建默认配置...${NC}"
    cat > ecosystem.config.js << EOL
module.exports = {
  apps : [{
    name: 'shiciAPI',
    script: 'server.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOL
fi

# 停止现有应用
pm2 stop shiciAPI 2>/dev/null || true

# 删除现有应用
pm2 delete shiciAPI 2>/dev/null || true

# 启动应用
echo -e "${YELLOW}启动应用...${NC}"
pm2 start ecosystem.config.js
if [ $? -ne 0 ]; then
    echo -e "${RED}应用启动失败，请查看日志获取详细信息${NC}"
    exit 1
fi

# 设置开机自启
echo -e "${YELLOW}设置开机自启...${NC}"
pm2 save

# 显示应用状态
echo -e "${GREEN}部署完成！${NC}"
echo -e "应用状态："
pm2 status shiciAPI

echo -e "\n${GREEN}访问以下地址测试应用：http://您的服务器IP:3000${NC}"
echo -e "查看应用日志：pm2 logs shiciAPI"
echo -e "重启应用：pm2 restart shiciAPI"
echo -e "停止应用：pm2 stop shiciAPI"
```

### 10.2 设置脚本执行权限

```bash
chmod +x deploy_pm2.sh
```

### 10.3 运行一键部署脚本

在宝塔面板中进入站点终端，执行：

```bash
./deploy_pm2.sh
```

## 11. 版本控制与回滚

### 11.1 版本管理

使用PM2的版本化部署功能：

```bash
# 将当前应用保存为v1版本
pm2 save --version 1

# 切换到v1版本
pm2 reload --version 1
```

### 11.2 快速回滚

如果新版本出现问题，可以快速回滚到上一个稳定版本：

```bash
# 回滚到上一个版本
pm2 rollback shiciAPI

# 或者重启之前的实例
pm2 reload shiciAPI
```

---

通过以上步骤，您应该能够成功使用PM2管理诗词API应用，确保应用稳定运行并具有自动重启、性能监控等功能。使用PM2可以大大简化Node.js应用的部署和管理工作，是生产环境中运行Node.js应用的最佳实践。