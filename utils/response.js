module.exports = {
  // 成功响应
  success: (res, data = null, msg = '操作成功') => {
    res.json({ code: 200, msg, data });
  },
  // 错误响应
  error: (res, code = 500, msg = '服务器错误', data = null) => {
    res.status(code).json({ code, msg, data });
  },
  // 参数错误
  badRequest: (res, msg = '参数错误', data = null) => {
    res.status(400).json({ code: 400, msg, data });
  },
  // 未授权
  unauthorized: (res, msg = '未授权操作', data = null) => {
    res.status(401).json({ code: 401, msg, data });
  }
};