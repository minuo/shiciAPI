/**
 * 本地存储工具函数
 */

/**
 * 设置localStorage项
 * @param {string} key - 存储键名
 * @param {*} value - 存储值（会自动JSON序列化）
 */
export const setLocalStorage = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error('设置localStorage失败:', error);
    return false;
  }
};

/**
 * 获取localStorage项
 * @param {string} key - 存储键名
 * @param {*} defaultValue - 默认值（如果键不存在）
 * @returns {*} - 解析后的值或默认值
 */
export const getLocalStorage = (key, defaultValue = null) => {
  try {
    const serializedValue = localStorage.getItem(key);
    if (serializedValue === null) {
      return defaultValue;
    }
    return JSON.parse(serializedValue);
  } catch (error) {
    console.error('获取localStorage失败:', error);
    return defaultValue;
  }
};

/**
 * 移除localStorage项
 * @param {string} key - 存储键名
 */
export const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('移除localStorage失败:', error);
    return false;
  }
};

/**
 * 清空localStorage
 */
export const clearLocalStorage = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('清空localStorage失败:', error);
    return false;
  }
};

/**
 * 设置sessionStorage项
 * @param {string} key - 存储键名
 * @param {*} value - 存储值（会自动JSON序列化）
 */
export const setSessionStorage = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    sessionStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error('设置sessionStorage失败:', error);
    return false;
  }
};

/**
 * 获取sessionStorage项
 * @param {string} key - 存储键名
 * @param {*} defaultValue - 默认值（如果键不存在）
 * @returns {*} - 解析后的值或默认值
 */
export const getSessionStorage = (key, defaultValue = null) => {
  try {
    const serializedValue = sessionStorage.getItem(key);
    if (serializedValue === null) {
      return defaultValue;
    }
    return JSON.parse(serializedValue);
  } catch (error) {
    console.error('获取sessionStorage失败:', error);
    return defaultValue;
  }
};

/**
 * 移除sessionStorage项
 * @param {string} key - 存储键名
 */
export const removeSessionStorage = (key) => {
  try {
    sessionStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('移除sessionStorage失败:', error);
    return false;
  }
};