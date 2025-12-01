const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { success, error } = require('../utils/response');

// 用户注册
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 检查用户是否已存在
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return error(res, 400, '用户名或邮箱已存在');
    }
    
    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // 创建新用户
    const user = new User({
      username,
      email,
      password: hashedPassword
    });
    
    await user.save();
    success(res, null, '注册成功');
  } catch (err) {
    error(res, 500, '注册失败', err.message);
  }
};

// 用户登录
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return error(res, 401, '邮箱或密码错误');
    }
    
    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return error(res, 401, '用户名或密码错误');
    }
    
    // 生成JWT令牌
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    success(res, { token, user: { id: user._id, username: user.username, role: user.role } }, '登录成功');
  } catch (err) {
    error(res, 500, '登录失败', err.message);
  }
};

module.exports = { register, login };