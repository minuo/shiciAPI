# 诗词API后端项目部署指南

## 1. 本地准备工作

### 已完成的工作
- ✅ 创建了合适的`.gitignore`文件
- ✅ 初始化了Git仓库
- ✅ 创建了GitHub Actions工作流文件
- ✅ 编写了部署脚本`deploy.sh`
- ✅ 生成了SSH密钥配置指南

## 2. GitHub仓库设置

1. **创建GitHub仓库**：
   - 登录GitHub，点击"New repository"
   - 填写仓库名称，如"shiciAPI"
   - 选择公开或私有，点击"Create repository"

2. **推送本地代码**：
   ```bash
   git remote add origin https://github.com/你的用户名/shiciAPI.git
   git push -u origin main
   ```

3. **配置GitHub Secrets**：
   - 进入仓库Settings > Secrets and variables > Actions
   - 添加以下Secrets：
     - `ALIYUN_HOST`: 阿里云服务器IP
     - `ALIYUN_USERNAME`: 服务器用户名
     - `ALIYUN_PORT`: 22
     - `ALIYUN_SSH_KEY`: SSH私钥内容

## 3. 阿里云服务器配置

1. **登录服务器**：
   ```bash
   ssh 用户名@服务器IP
   ```

2. **首次部署**：
   - 将`deploy.sh`文件上传到服务器
   - 执行：
     ```bash
     chmod +x deploy.sh
     ./deploy.sh
     ```

3. **配置数据库**：
   - 安装MongoDB（如果尚未安装）
   - 创建`shici`数据库

4. **配置环境变量**：
   - 编辑`/home/shiciAPI/.env`文件
   - 设置正确的数据库连接信息和JWT密钥

## 4. 自动化部署流程

1. **触发部署**：
   - 每次向`main`分支推送代码时，GitHub Actions将自动触发部署

2. **部署过程**：
   - 检出代码
   - 安装依赖
   - 运行测试（可选）
   - 通过SSH连接到阿里云服务器
   - 拉取最新代码
   - 重新安装生产依赖
   - 重启应用

## 5. 验证部署

1. **检查PM2状态**：
   ```bash
   pm2 list
   pm2 logs shiciAPI
   ```

2. **测试API访问**：
   - 访问`http://服务器IP:3000/api/health`验证服务健康状态

## 6. 常见问题排查

1. **部署失败**：
   - 检查GitHub Actions日志
   - 验证SSH密钥是否正确配置
   - 确保服务器防火墙开放了必要端口

2. **应用无法启动**：
   - 检查环境变量配置
   - 查看PM2错误日志
   - 验证数据库连接

3. **端口冲突**：
   - 修改`.env`文件中的PORT配置
   - 或使用Nginx进行反向代理