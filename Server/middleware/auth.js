const jwt = require('jsonwebtoken');

// 主认证中间件
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('未提供认证令牌');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ code: 401, msg: '认证失败', data: null });
  }
};

// 权限检查辅助函数
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(401).json({ code: 401, msg: '权限不足', data: null });
    }
    next();
  };
};

module.exports = { auth, checkRole };