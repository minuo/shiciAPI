const { body, validationResult } = require('express-validator');

// 注册参数验证
const validateRegister = [
  body('username').isLength({ min: 3 }).withMessage('用户名至少3个字符'),
  body('email').isEmail().withMessage('邮箱格式不正确'),
  body('password').isLength({ min: 6 }).withMessage('密码至少6个字符'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        code: 400, 
        msg: '参数验证失败', 
        data: errors.array() 
      });
    }
    next();
  }
];

// 登录验证
const validateLogin = [
  body('email').notEmpty().withMessage('邮箱不能为空'),
  body('password').notEmpty().withMessage('密码不能为空'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        msg: '参数验证失败',
        data: errors.array()
      });
    }
    next();
  }
];

module.exports = { validateRegister, validateLogin };