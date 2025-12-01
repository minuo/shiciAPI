/**
 * Axios请求封装
 */
import axios from 'axios';
import { getToken, logout } from './auth';

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: import.meta.env.VITE_API_TIMEOUT || 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 添加token到请求头
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data;
    console.log('响应数据:', res);
    // 根据后端约定的响应格式处理
    if (res.code !== 200 && res.code !== undefined) {
      // 错误处理
      console.error('错误:', res.message || '请求失败');
      
      // 未授权，需要登录
      if (res.code === 401) {
        // 可以在这里触发登录弹窗或跳转到登录页
        logout();
        window.location.href = '/login';
      }
      
      return Promise.reject(new Error(res.message || '请求失败'));
    }
    
    return res;
  },
  error => {
    // 处理网络错误
    let message = '网络错误，请稍后重试';
    
    if (error.response) {
      // 服务器返回错误状态码
      const { status } = error.response;
      switch (status) {
        case 401:
          message = '未授权，请重新登录';
          logout();
          window.location.href = '/login';
          break;
        case 403:
          message = '拒绝访问';
          break;
        case 404:
          message = '请求的资源不存在';
          break;
        case 500:
          message = '服务器内部错误';
          break;
        default:
          message = `请求失败: ${status}`;
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      message = '服务器无响应';
    }
    
    console.error('响应错误:', message);
    return Promise.reject(new Error(message));
  }
);

// 封装请求方法
export default {
  get(url, params = {}) {
    return service.get(url, { params });
  },
  
  post(url, data = {}) {
    return service.post(url, data);
  },
  
  put(url, data = {}) {
    return service.put(url, data);
  },
  
  delete(url, params = {}) {
    return service.delete(url, { params });
  }
};