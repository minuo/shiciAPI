const express = require('express');
const cors = require('cors');
const errorMiddleware = require('./middleware/error');
const routes = require('./routes');

const app = express();

// 配置中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查路由
app.get('/', (req, res) => {
  res.json({
    code: 200,
    msg: '诗词 API 服务运行正常',
    data: null
  });
});

// API路由
app.use('/api', routes);

// 错误处理中间件
app.use(errorMiddleware);

module.exports = app;