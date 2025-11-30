# 宝塔面板 - 项目代码部署指南

本文档详细介绍如何将诗词API项目代码部署到宝塔面板配置的服务器上，包括多种部署方法和详细步骤。

## 1. 准备工作

在开始部署前，请确保您已完成以下准备工作：

1. 已安装宝塔面板
2. 已创建网站站点
3. 已配置MongoDB数据库
4. 已开放必要端口（3000、27017等）

## 2. 部署方法一：通过Git部署（推荐）

使用Git是最简便且易于更新的部署方法。

### 2.1 准备Git仓库

确保您的代码已上传到GitHub或其他Git仓库。如果还没有，请参考以下步骤：

```bash
# 在本地项目目录
git init
git add .
git commit -m "初始提交"
git remote add origin https://github.com/您的用户名/shiciAPI.git
git push -u origin main
```

### 2.2 在宝塔面板中使用Git

1. 进入您创建的站点
2. 点击「文件」选项卡
3. 删除默认生成的文件（如index.html）
4. 点击「终端」按钮
5. 在终端中执行以下命令：

```bash
# 进入站点根目录
cd /www/wwwroot/shiciapi

# 克隆仓库代码
git clone https://github.com/您的用户名/shiciAPI.git .

# 注意：末尾的点(.)表示在当前目录克隆，不要创建新目录
```

### 2.3 处理Git认证问题

如果您的Git仓库是私有的，需要配置Git凭证：

```bash
# 配置Git全局用户名和邮箱
git config --global user.name "您的用户名"
git config --global user.email "您的邮箱"

# 缓存Git凭证，避免每次都需要输入密码
git config --global credential.helper store
```

首次克隆时，系统会提示输入GitHub用户名和密码或Personal Access Token（推荐使用）。

## 3. 部署方法二：通过文件上传

如果无法使用Git，也可以通过文件上传的方式部署代码。

### 3.1 本地打包项目

1. 在本地项目目录执行：

```bash
# 安装依赖
npm install

# 构建项目（如果有构建步骤）
npm run build

# 创建压缩包
zip -r shiciapi.zip .
```

### 3.2 上传并解压文件

1. 进入宝塔面板站点的「文件」选项卡
2. 点击「上传」按钮
3. 选择本地的`shiciapi.zip`文件上传
4. 上传完成后，选中上传的zip文件
5. 点击「解压」按钮
6. 选择解压路径为站点根目录

### 3.3 处理文件权限

上传完成后，确保文件权限正确：

```bash
# 在终端中执行
chmod -R 755 /www/wwwroot/shiciapi
chown -R www:www /www/wwwroot/shiciapi
```

## 4. 部署方法三：使用FTP部署

对于熟悉FTP的开发者，可以使用FTP工具部署项目。

### 4.1 在宝塔面板中创建FTP账户

1. 点击左侧菜单「网站」
2. 进入您的站点
3. 点击「FTP」选项卡
4. 点击「创建FTP」
5. 填写FTP信息：
   - **FTP用户名**：自定义
   - **FTP密码**：设置安全密码
   - **目录**：选择站点根目录
   - **权限**：勾选「读取」和「写入」
6. 点击「提交」

### 4.2 使用FTP客户端上传文件

1. 使用您喜欢的FTP客户端（如FileZilla）
2. 连接信息：
   - **主机**：服务器IP地址
   - **用户名**：您创建的FTP用户名
   - **密码**：您设置的FTP密码
   - **端口**：21（默认FTP端口）
3. 连接成功后，将本地项目文件上传到服务器

## 5. 验证部署文件

部署完成后，验证项目文件是否正确上传：

1. 在宝塔面板中进入站点的「文件」选项卡
2. 检查以下关键文件是否存在：
   - `package.json`
   - `server.js` 或 `app.js`（主入口文件）
   - `models/`（模型目录）
   - `routes/`（路由目录）
   - `controllers/`（控制器目录）

## 6. 创建部署脚本

为了方便后续部署，可以创建一个简单的部署脚本：

### 6.1 创建部署脚本文件

在项目根目录创建`deploy.sh`文件：

```bash
#!/bin/bash

# 定义颜色输出
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m" # No Color

echo -e "${GREEN}开始部署诗词API项目...${NC}"

# 进入项目目录
cd /www/wwwroot/shiciapi

# 拉取最新代码
echo -e "${YELLOW}拉取最新代码...${NC}"
git pull origin main
if [ $? -ne 0 ]; then
    echo -e "${RED}Git拉取失败，请检查仓库权限和网络连接${NC}"
    exit 1
fi

# 更新文件权限
echo -e "${YELLOW}更新文件权限...${NC}"
chmod -R 755 .
chown -R www:www .

# 检查.env文件是否存在
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}警告：未找到.env文件，请确保环境变量已配置${NC}"
fi

echo -e "${GREEN}部署完成！${NC}"
echo -e "请继续安装依赖并启动应用：npm install && pm2 restart shiciAPI"
```

### 6.2 设置脚本执行权限

```bash
chmod +x deploy.sh
```

### 6.3 运行部署脚本

后续部署时，只需执行：

```bash
./deploy.sh
```

## 7. 自动化部署（高级选项）

对于需要频繁更新的项目，可以配置自动化部署。

### 7.1 使用WebHook自动部署

1. 在宝塔面板中进入站点
2. 点击「WebHook」选项卡
3. 点击「添加」
4. 填写WebHook信息：
   - **名称**：`shiciAPI_auto_deploy`
   - **脚本内容**：
   ```bash
   cd /www/wwwroot/shiciapi
   git pull origin main
   chmod -R 755 .
   chown -R www:www .
   # 可选：安装新依赖
   # npm install --production
   # 可选：重启应用
   # pm2 restart shiciAPI
   ```
5. 点击「提交」
6. 复制生成的WebHook URL
7. 在GitHub仓库设置中添加这个WebHook

### 7.2 使用GitHub Actions自动化部署

1. 在项目根目录创建`.github/workflows/deploy.yml`文件
2. 内容示例：

```yaml
name: Deploy to Server

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USERNAME }}
          password: ${{ secrets.SERVER_PASSWORD }}
          script: |
            cd /www/wwwroot/shiciapi
            git pull origin main
            chmod -R 755 .
            chown -R www:www .
            # 可选：安装依赖和重启应用
            # npm install --production
            # pm2 restart shiciAPI
```

3. 在GitHub仓库设置中添加`SERVER_HOST`、`SERVER_USERNAME`和`SERVER_PASSWORD`密钥

## 8. 代码部署注意事项

1. **忽略文件**：确保`.gitignore`文件正确配置，避免上传不必要的文件（如`node_modules`、`.env`等）

2. **敏感信息**：不要将敏感信息（如API密钥、数据库密码）直接硬编码在代码中

3. **环境变量**：确保在部署后配置正确的环境变量

4. **依赖管理**：在生产环境中使用`npm install --production`只安装生产依赖

5. **版本控制**：使用Git标签标记重要版本，便于回滚

6. **备份**：部署前备份当前运行的代码，以便在出现问题时快速回滚

## 9. 回滚操作

如果部署后出现问题，可以执行以下回滚操作：

### 9.1 使用Git回滚

```bash
# 查看提交历史
git log

# 回滚到指定版本
git reset --hard 提交ID

# 重新部署到服务器
git push origin main --force
```

### 9.2 使用备份回滚

如果您在部署前创建了备份：

1. 将备份文件解压到站点根目录
2. 恢复文件权限
3. 重启应用

## 10. 常见部署问题排查

### 10.1 Git克隆失败

可能的原因和解决方案：

1. **网络问题**：检查服务器网络连接，尝试使用代理
2. **认证失败**：使用Personal Access Token代替密码
3. **权限不足**：确保当前用户有权限在目标目录写入文件

### 10.2 文件上传不完整

1. **上传超时**：对于大型项目，考虑分多次上传或使用Git部署
2. **权限问题**：确保FTP用户或宝塔用户有足够的文件写入权限

### 10.3 文件权限错误

1. 执行以下命令修复权限：
   ```bash
   chmod -R 755 /www/wwwroot/shiciapi
   chown -R www:www /www/wwwroot/shiciapi
   ```

### 10.4 找不到入口文件

1. 检查主入口文件是否存在（通常是`server.js`或`app.js`）
2. 确认文件名大小写是否正确（Linux系统区分大小写）

---

通过以上步骤，您应该能够成功将诗词API项目代码部署到宝塔面板配置的服务器上。完成代码部署后，请继续进行环境变量配置和依赖安装。