const app = require('./app');
const connectDB = require('./config/db');
require('dotenv').config();

// 连接数据库
connectDB();

// 获取端口
const PORT = process.env.PORT || 3000;

// 启动服务器
const server = app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.log('未捕获的异常:', err);
  process.exit(1);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (err) => {
  console.log('未处理的Promise拒绝:', err.message);
  server.close(() => {
    process.exit(1);
  });
});