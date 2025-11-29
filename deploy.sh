#!/bin/bash

# 诗词API部署脚本

echo "开始部署诗词API后端服务..."

# 设置变量
APP_DIR="/home/shiciAPI"
NODE_VERSION="16"

# 创建应用目录
mkdir -p $APP_DIR
cd $APP_DIR

# 检查并安装Node.js
if ! command -v node &> /dev/null; then
    echo "安装Node.js $NODE_VERSION..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
fi

# 安装PM2进程管理器
if ! command -v pm2 &> /dev/null; then
    echo "安装PM2..."
    npm install -g pm2
fi

# 克隆代码（如果还没有克隆）
if [ ! -d ".git" ]; then
    echo "克隆代码库..."
    git clone https://github.com/your-username/shiciAPI.git .
fi

# 安装依赖
echo "安装依赖..."
npm install --production

# 创建环境变量文件
if [ ! -f ".env" ]; then
    echo "创建.env文件..."
    cat > .env << EOF
PORT=3000
MONGO_URI=mongodb://localhost:27017/shici
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
EOF
fi

# 启动应用
echo "启动应用..."
pm2 start app.js --name shiciAPI

# 设置PM2开机自启
echo "配置PM2开机自启..."
pm2 startup systemd -u $(whoami) --hp $(pwd)
pm2 save

echo "部署完成！应用已通过PM2启动。"
echo "访问地址: http://your-server-ip:3000"