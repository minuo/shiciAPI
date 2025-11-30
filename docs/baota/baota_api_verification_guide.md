# API服务验证指南

本文档详细介绍如何验证诗词API服务是否正常运行，包括服务可用性检查、API功能测试、性能验证以及问题排查方法。

## 1. 基础服务状态检查

### 1.1 检查PM2应用状态

在宝塔面板中：

1. 点击左侧菜单「软件商店」
2. 找到「PM2管理器」并点击「设置」
3. 查看诗词API应用的状态：
   - **状态**：应为「online」
   - **内存**：显示正常的内存使用量
   - **CPU**：显示合理的CPU占用率

### 1.2 使用命令行检查服务状态

在服务器终端执行：

```bash
# 查看PM2应用列表
pm2 list

# 检查特定应用状态
pm2 status shiciAPI
```

正常情况下，应用应显示为「online」状态。

### 1.3 检查端口监听

验证应用是否正确监听指定端口：

```bash
# 检查3000端口是否被占用
netstat -tlnp | grep 3000

# 或者使用lsof命令
lsof -i:3000
```

如果看到Node.js进程正在监听3000端口，说明服务已启动。

## 2. API健康检查

### 2.1 使用curl测试健康检查端点

在任意能访问服务器的终端执行：

```bash
# 假设服务器IP为192.168.1.100
curl http://192.168.1.100:3000/

# 或者如果配置了域名
curl http://您的域名/
```

正常响应示例：

```json
{
  "code": 200,
  "msg": "诗词 API 服务运行正常",
  "data": null
}
```

### 2.2 使用浏览器访问

在浏览器中访问：

```
http://您的服务器IP:3000/
```

应该能看到健康检查的JSON响应。

## 3. API功能测试

### 3.1 测试基础API端点

使用curl或其他API测试工具测试各个API端点：

#### 3.1.1 获取诗词列表

```bash
curl http://您的服务器IP:3000/api/shicis
```

#### 3.1.2 获取单首诗词详情

```bash
# 假设存在ID为60c5e9b5f4e1a10017c23456的诗词
curl http://您的服务器IP:3000/api/shicis/60c5e9b5f4e1a10017c23456
```

#### 3.1.3 测试用户注册（如果有此功能）

```bash
curl -X POST \
  http://您的服务器IP:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpassword","email":"test@example.com"}'
```

### 3.2 使用Postman测试API

[Postman](https://www.postman.com/)是一个强大的API测试工具：

1. 下载并安装Postman
2. 创建一个新的Collection
3. 添加各个API端点的请求：
   - **GET** `/api/shicis` - 获取诗词列表
   - **GET** `/api/shicis/:id` - 获取诗词详情
   - **POST** `/api/shicis` - 创建新诗词（可能需要认证）
4. 为需要认证的请求添加认证信息
5. 发送请求并验证响应

### 3.3 测试分页和筛选功能

```bash
# 测试分页
curl "http://您的服务器IP:3000/api/shicis?page=1&pageSize=10"

# 测试按作者筛选
curl "http://您的服务器IP:3000/api/shicis?author=李白"

# 测试按朝代筛选
curl "http://您的服务器IP:3000/api/shicis?dynasty=唐"
```

## 4. 数据库连接验证

### 4.1 测试数据库查询

创建一个简单的测试脚本来验证数据库连接：

1. 在项目根目录创建`test_db.js`文件：

```javascript
// 测试数据库连接和查询
const mongoose = require('mongoose');
require('dotenv').config();

// 连接到MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ 成功连接到MongoDB数据库');
  
  // 尝试查询一个集合
  const Shici = mongoose.model('Shici', new mongoose.Schema({}, { strict: false }));
  
  return Shici.countDocuments({});
})
.then(count => {
  console.log(`✅ 数据库查询成功，当前有 ${count} 条诗词记录`);
  
  // 关闭连接
  return mongoose.connection.close();
})
.then(() => {
  console.log('✅ 数据库连接已关闭');
})
.catch(err => {
  console.error('❌ 数据库连接或查询失败:', err.message);
  process.exit(1);
});
```

2. 运行测试脚本：

```bash
cd /www/wwwroot/shiciapi
node test_db.js
```

## 5. 日志分析

### 5.1 查看应用日志

在宝塔面板中：

1. 进入PM2管理器
2. 找到您的应用
3. 点击「日志」按钮

或者在终端中：

```bash
# 查看应用日志
pm2 logs shiciAPI

# 查看最近100行日志
pm2 logs shiciAPI --lines 100
```

### 5.2 常见日志错误分析

| 错误信息 | 可能原因 | 解决方案 |
|---------|---------|--------|
| `Error connecting to MongoDB` | 连接字符串错误或数据库未运行 | 检查MONGODB_URI配置和MongoDB服务状态 |
| `Port 3000 is already in use` | 端口被占用 | 更改端口或停止占用该端口的进程 |
| `Cannot find module X` | 缺少依赖 | 重新运行npm install |
| `JWT secret is not defined` | 未配置JWT_SECRET | 检查.env文件中的JWT_SECRET配置 |

## 6. 性能测试

### 6.1 使用ab工具进行负载测试

在Linux系统上安装ApacheBench：

```bash
# CentOS/RHEL
yum install httpd-tools

# Ubuntu/Debian
apt-get install apache2-utils
```

执行负载测试：

```bash
# 100个请求，并发10个
ab -n 100 -c 10 http://您的服务器IP:3000/api/shicis
```

### 6.2 测试响应时间

使用curl测试API响应时间：

```bash
# 测量响应时间
curl -w "\nTotal time: %{time_total}s\n" -o /dev/null -s http://您的服务器IP:3000/api/shicis
```

## 7. 安全检查

### 7.1 检查是否暴露敏感信息

确保API响应中不包含敏感信息：

```bash
# 检查API响应中是否包含关键字
curl http://您的服务器IP:3000/api/shicis | grep -i "password\|secret\|token\|key"
```

### 7.2 测试错误处理

测试API的错误处理机制是否合理：

```bash
# 访问不存在的端点
curl -v http://您的服务器IP:3000/api/nonexistent

# 发送格式错误的请求
curl -X POST \
  http://您的服务器IP:3000/api/shicis \
  -H "Content-Type: application/json" \
  -d '{"格式错误的":"json"}'
```

## 8. 自动化健康检查脚本

创建一个自动化脚本，定期检查API健康状态：

### 8.1 创建健康检查脚本

在项目根目录创建`health_check.sh`文件：

```bash
#!/bin/bash

# 定义变量
API_URL="http://localhost:3000"
LOG_FILE="/www/wwwlogs/shiciapi_health.log"
EMAIL="admin@example.com"  # 用于接收警报

# 定义颜色输出
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
NC="\033[0m" # No Color

# 记录日志函数
log_message() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# 发送告警函数
send_alert() {
  log_message "⚠️ ALERT: $1"
  # 如果有配置邮件，可以发送邮件告警
  # echo "$1" | mail -s "诗词API服务告警" "$EMAIL"
  echo -e "${RED}$1${NC}"
}

# 检查PM2应用状态
check_pm2_status() {
  echo -e "${YELLOW}检查PM2应用状态...${NC}"
  STATUS=$(pm2 list | grep "shiciAPI" | grep -o "online\|errored\|stopped")
  
  if [ "$STATUS" != "online" ]; then
    send_alert "PM2应用状态异常: $STATUS"
    return 1
  fi
  
  echo -e "${GREEN}PM2应用状态正常: $STATUS${NC}"
  log_message "PM2应用状态正常: $STATUS"
  return 0
}

# 检查API健康状态
check_api_health() {
  echo -e "${YELLOW}检查API健康状态...${NC}"
  
  # 发送请求并获取状态码
  STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/")
  
  if [ "$STATUS_CODE" != "200" ]; then
    send_alert "API健康检查失败，状态码: $STATUS_CODE"
    return 1
  fi
  
  # 检查响应内容
  RESPONSE=$(curl -s "$API_URL/")
  if ! echo "$RESPONSE" | grep -q "诗词 API 服务运行正常"; then
    send_alert "API响应内容异常"
    return 1
  fi
  
  echo -e "${GREEN}API健康状态正常${NC}"
  log_message "API健康状态正常"
  return 0
}

# 检查数据库连接
check_db_connection() {
  echo -e "${YELLOW}检查数据库连接...${NC}"
  
  # 运行数据库测试脚本
  cd /www/wwwroot/shiciapi
  node test_db.js > /dev/null 2>&1
  
  if [ $? -ne 0 ]; then
    send_alert "数据库连接测试失败"
    return 1
  fi
  
  echo -e "${GREEN}数据库连接正常${NC}"
  log_message "数据库连接正常"
  return 0
}

# 检查系统资源
check_system_resources() {
  echo -e "${YELLOW}检查系统资源...${NC}"
  
  # 检查内存使用
  MEM_USAGE=$(free | awk '/Mem/{printf "%.2f", $3/$2*100}')
  if (( $(echo "$MEM_USAGE > 90" | bc -l) )); then
    send_alert "内存使用率过高: ${MEM_USAGE}%"
  fi
  
  # 检查CPU使用
  CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}')
  if (( $(echo "$CPU_USAGE > 90" | bc -l) )); then
    send_alert "CPU使用率过高: ${CPU_USAGE}%"
  fi
  
  echo -e "${GREEN}系统资源使用情况: 内存 ${MEM_USAGE}%, CPU ${CPU_USAGE}%${NC}"
  log_message "系统资源使用情况: 内存 ${MEM_USAGE}%, CPU ${CPU_USAGE}%"
  return 0
}

# 主函数
main() {
  echo -e "${YELLOW}开始执行诗词API健康检查...${NC}"
  log_message "开始执行健康检查"
  
  check_pm2_status
  PM2_STATUS=$?
  
  check_api_health
  API_STATUS=$?
  
  check_db_connection
  DB_STATUS=$?
  
  check_system_resources
  
  # 汇总结果
  echo -e "\n${YELLOW}健康检查结果汇总:${NC}"
  if [ $PM2_STATUS -eq 0 ] && [ $API_STATUS -eq 0 ] && [ $DB_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ 所有检查项通过!${NC}"
    log_message "健康检查全部通过"
    exit 0
  else
    echo -e "${RED}❌ 部分检查项失败，请查看详细日志${NC}"
    log_message "健康检查部分失败"
    exit 1
  fi
}

# 执行主函数
main
```

### 8.2 设置执行权限

```bash
chmod +x health_check.sh
```

### 8.3 设置定时任务

在宝塔面板中设置定时任务：

1. 点击左侧菜单「计划任务」
2. 点击「添加任务」
3. 填写以下信息：
   - **任务类型**：Shell脚本
   - **脚本内容**：`/www/wwwroot/shiciapi/health_check.sh`
   - **执行周期**：每15分钟
   - **备注**：诗词API健康检查
4. 点击「确定」

## 9. 常见问题排查

### 9.1 API返回500错误

1. **检查应用日志**：查看详细错误信息
2. **验证数据库连接**：确保MongoDB服务正常运行
3. **检查环境变量**：验证所有必需的环境变量都已正确配置
4. **查看依赖版本**：确保使用了兼容的依赖版本

### 9.2 API返回404错误

1. **检查URL路径**：确认请求的URL路径正确
2. **验证路由配置**：检查应用的路由配置是否正确
3. **查看应用日志**：检查是否有路由相关的错误信息

### 9.3 API响应缓慢

1. **检查数据库性能**：优化慢查询，添加适当的索引
2. **检查服务器资源**：确保服务器有足够的CPU和内存
3. **检查网络连接**：验证网络延迟是否正常
4. **启用缓存**：考虑在应用中添加缓存层

### 9.4 应用频繁崩溃

1. **增加内存限制**：在PM2配置中增加内存限制
2. **检查内存泄漏**：使用工具如`node-memwatch`检测内存泄漏
3. **优化代码**：检查是否有导致崩溃的代码问题
4. **更新依赖**：更新可能有bug的依赖版本

## 10. 创建API测试文档

为了方便后续测试，可以创建一个API测试文档，包含所有端点的测试方法：

### 10.1 创建API测试文档

在项目根目录创建`API_TESTING.md`文件，内容可以参考：

```markdown
# 诗词API测试文档

## 1. 基础测试

### 1.1 健康检查

```bash
curl http://您的服务器IP:3000/
```

预期响应：
```json
{
  "code": 200,
  "msg": "诗词 API 服务运行正常",
  "data": null
}
```

## 2. 诗词相关API

### 2.1 获取诗词列表

```bash
curl http://您的服务器IP:3000/api/shicis
```

### 2.2 获取诗词详情

```bash
curl http://您的服务器IP:3000/api/shicis/{id}
```

### 2.3 创建新诗词（需要认证）

```bash
curl -X POST \
  http://您的服务器IP:3000/api/shicis \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"title":"新诗词","author":"作者","dynasty":"朝代","content":"诗词内容","tags":["标签1","标签2"]}'
```

## 3. 用户相关API

### 3.1 用户注册

```bash
curl -X POST \
  http://您的服务器IP:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpassword","email":"test@example.com"}'
```

### 3.2 用户登录

```bash
curl -X POST \
  http://您的服务器IP:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpassword"}'
```

## 4. 错误场景测试

### 4.1 访问不存在的端点

```bash
curl -v http://您的服务器IP:3000/api/nonexistent
```

预期响应：404 Not Found

### 4.2 未授权访问

```bash
curl -v http://您的服务器IP:3000/api/shicis/create
```

预期响应：401 Unauthorized
```
```

---

通过以上验证步骤，您应该能够全面测试诗词API服务的运行状态，确保服务正常工作并能够及时发现和解决潜在问题。定期执行健康检查是确保API服务稳定运行的重要措施。