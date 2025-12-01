/**
 * 认证相关工具函数
 */

const TOKEN_KEY = 'shici_auth_token';
const USER_INFO_KEY = 'shici_user_info';

/**
 * 保存认证token
 * @param {string} token - JWT token
 */
export const saveToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * 获取认证token
 * @returns {string|null} - JWT token或null
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * 移除认证token
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * 保存用户信息
 * @param {object} userInfo - 用户信息对象
 */
export const saveUserInfo = (userInfo) => {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
};

/**
 * 获取用户信息
 * @returns {object|null} - 用户信息对象或null
 */
export const getUserInfo = () => {
  const userInfo = localStorage.getItem(USER_INFO_KEY);
  return userInfo ? JSON.parse(userInfo) : null;
};

/**
 * 移除用户信息
 */
export const removeUserInfo = () => {
  localStorage.removeItem(USER_INFO_KEY);
};

/**
 * 检查是否已登录
 * @returns {boolean} - 是否已登录
 */
export const isLoggedIn = () => {
  return !!getToken();
};

/**
 * 退出登录
 */
export const logout = () => {
  removeToken();
  removeUserInfo();
  // 可以在这里添加其他清理操作
};