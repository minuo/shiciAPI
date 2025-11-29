module.exports = (err, req, res, next) => {
  console.error('Error:', err.message || err);
  
  // 根据错误类型返回不同状态码
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      code: 400, 
      msg: '参数验证失败: ' + Object.values(err.errors).map(e => e.message).join(', '),
      data: null 
    });
  }
  
  // 默认返回服务器错误
  res.status(500).json({
    code: 500,
    msg: '服务器错误',
    data: null
  });
};