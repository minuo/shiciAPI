#!/usr/bin/env node

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 环境配置
const environments = {
  development: {
    baseUrl: 'http://localhost:3000',
    timeout: 3000,
    retryCount: 0
  },
  test: {
    baseUrl: 'http://test-api.example.com',
    timeout: 2000,
    retryCount: 1
  },
  production: {
    baseUrl: 'https://api.example.com',
    timeout: 5000,
    retryCount: 2
  }
};

// 获取环境参数
const args = process.argv.slice(2);
const environment = args[0] || 'development';
const config = environments[environment];

// 缓存测试结果
const testCache = {};

if (!config) {
  console.error(`错误：未知的环境 "${environment}"。可用环境: development, test, production`);
  process.exit(1);
}

console.log(`正在使用 ${environment} 环境配置...`);

// 定义测试用户信息
// 动态生成测试用户名，避免重复注册失败
const timestamp = Date.now();
const testUser = {
  username: `testuser_${timestamp}`,
  email: `test_${timestamp}@example.com`,
  password: 'Test123456'
};

// 定义测试标签信息
const testTag = {
  name: `测试标签_${timestamp}`,
  description: '这是一个测试标签描述'
};

// 存储测试中创建的标签ID
let testTagId = '';

// 存储认证token
let authToken = '';

// 定义要测试的端点
const endpoints = [
  {
    name: '健康检查',
    path: '/',
    method: 'GET',
    expectedStatus: 200,
    verifyResponse: (data) => {
      return data.code === 200 && data.msg === '诗词 API 服务运行正常';
    }
  },
  // 诗词相关测试
  {
    name: '诗词列表-基础查询',
    path: '/api/poems',
    method: 'GET',
    expectedStatus: 200,
    verifyResponse: (data) => {
      return data.code === 200 && Array.isArray(data.data?.list) && typeof data.data?.pagination === 'object';
    }
  },
  {
    name: '诗词列表-带分页参数',
    path: '/api/poems?page=1&size=5',
    method: 'GET',
    expectedStatus: 200,
    verifyResponse: (data) => {
      return data.code === 200 && data.data?.pagination?.page === 1 && data.data?.pagination?.size === 5;
    }
  },
  {
    name: '诗词列表-带排序参数',
    path: '/api/poems?sort=createTime',
    method: 'GET',
    expectedStatus: 200,
    verifyResponse: (data) => {
      return data.code === 200 && Array.isArray(data.data?.list);
    }
  },
  {
    name: '随机诗词',
    path: '/api/poems/random',
    method: 'GET',
    expectedStatus: 200,
    verifyResponse: (data) => {
      return data.code === 200 && data.data && data.data.title && data.data.author;
    }
  },
    {
      name: '诗词详情-无效ID',
      path: '/api/poems/123456', // 无效的ObjectId
      method: 'GET',
      expectedStatus: 500,
      verifyResponse: (data) => {
        return data.code === 500;
      }
    },
    {
      name: '诗词点赞-无效ID',
      path: '/api/poems/123456/like',
      method: 'PATCH',
      expectedStatus: 500,
      verifyResponse: (data) => {
        return data.code === 500;
      }
    },
  // 评论相关测试
  {
    name: '获取评论列表-无效诗词ID',
    path: '/api/poems/123456/comments',
    method: 'GET',
    expectedStatus: 404,
    verifyResponse: (data) => {
      return data.code === 404 || data.code === 500;
    }
  },
  // 认证相关测试
  {
    name: '用户注册-有效数据',
    path: '/api/auth/register',
    method: 'POST',
    expectedStatus: 200,
    verifyResponse: (data) => {
      return data.code === 200 && data.msg === '注册成功';
    },
    requestBody: testUser
  },
  {
    name: '用户注册-重复用户名',
    path: '/api/auth/register',
    method: 'POST',
    expectedStatus: 400,
    verifyResponse: (data) => {
      return data.code === 400 && data.msg.includes('已存在');
    },
    requestBody: testUser
  },
  {
    name: '用户注册-缺少必填字段',
    path: '/api/auth/register',
    method: 'POST',
    expectedStatus: 400,
    verifyResponse: (data) => {
      return data.code === 400 || data.code === 500;
    },
    requestBody: {
      username: `testuser2_${timestamp}`,
      password: 'Test123456'
    }
  },
  {
    name: '用户登录-有效凭据',
    path: '/api/auth/login',
    method: 'POST',
    expectedStatus: 200,
    verifyResponse: (data) => {
      return data.code === 200 && data.data?.token && data.data?.user;
    },
    requestBody: {
      email: testUser.email,
      password: testUser.password
    }
  },
  {
    name: '用户登录-无效邮箱',
    path: '/api/auth/login',
    method: 'POST',
    expectedStatus: 401,
    verifyResponse: (data) => {
      return data.code === 401 && data.msg.includes('错误');
    },
    requestBody: {
      email: `wrong_${testUser.email}`,
      password: testUser.password
    }
  },
  {
    name: '用户登录-无效密码',
    path: '/api/auth/login',
    method: 'POST',
    expectedStatus: 401,
    verifyResponse: (data) => {
      return data.code === 401 && data.msg.includes('错误');
    },
    requestBody: {
      email: testUser.email,
      password: 'wrongpassword'
    }
  },
  {
    name: '用户登录-缺少凭据',
    path: '/api/auth/login',
    method: 'POST',
    expectedStatus: 400,
    verifyResponse: (data) => {
      return data.code === 400 || data.code === 500;
    },
    requestBody: {
      email: testUser.email
    }
  },
  // 标签相关测试（公开接口）
    {
      name: '获取标签列表-基础查询',
      path: '/api/tags',
      method: 'GET',
      expectedStatus: 200,
      verifyResponse: (data) => {
        return data.code === 200 && data.data && Array.isArray(data.data.tags);
      }
    },
    {
      name: '获取标签列表-带分页参数',
      path: '/api/tags?page=1&size=10',
      method: 'GET',
      expectedStatus: 200,
      verifyResponse: (data) => {
        return data.code === 200 && data.data && data.data.pagination;
      }
    },
    {
      name: '获取标签列表-带关键词搜索',
      path: '/api/tags?keyword=test',
      method: 'GET',
      expectedStatus: 200,
      verifyResponse: (data) => {
        return data.code === 200 && data.data;
      }
    },
    {
      name: '获取热门标签',
      path: '/api/tags/popular',
      method: 'GET',
      expectedStatus: 200,
      verifyResponse: (data) => {
        return data.code === 200 && data.data && Array.isArray(data.data.tags);
      }
    },
    {
      name: '获取热门标签-自定义数量',
      path: '/api/tags/popular?limit=5',
      method: 'GET',
      expectedStatus: 200,
      verifyResponse: (data) => {
        return data.code === 200 && data.data;
      }
    },
    {
      name: '获取标签详情-无效ID',
      path: '/api/tags/123456',
      method: 'GET',
      expectedStatus: 500,
      verifyResponse: (data) => {
        return data.code === 500;
      }
    },
  // 需要认证但非管理员权限的测试
  {
    name: '创建评论-无效诗词ID',
    path: '/api/poems/123456/comments',
    method: 'POST',
    expectedStatus: 404,
    verifyResponse: (data) => {
      return data.code === 404 || data.code === 403 || data.code === 500;
    },
    requestBody: {
      content: '这是一条测试评论'
    },
    requireAuth: true
  },
  // 需要管理员权限的测试
  {
    name: '创建诗词-权限检查',
    path: '/api/poems',
    method: 'POST',
    expectedStatus: 401,
    verifyResponse: (data) => {
      return data.code === 401;
    },
    requestBody: {
      title: '测试诗词',
      author: '测试作者',
      content: '测试内容',
      dynasty: '测试朝代',
      tags: []
    },
    requireAuth: true
  },
  {
    name: '更新诗词-权限检查',
    path: '/api/poems/123456',
    method: 'PUT',
    expectedStatus: 401,
    verifyResponse: (data) => {
      return data.code === 401;
    },
    requestBody: {
      title: '更新后的测试诗词'
    },
    requireAuth: true
  },
  {
    name: '删除诗词-权限检查',
    path: '/api/poems/123456',
    method: 'DELETE',
    expectedStatus: 401,
    verifyResponse: (data) => {
      return data.code === 401;
    },
    requireAuth: true
  },
  {
    name: '创建标签-权限检查',
    path: '/api/tags',
    method: 'POST',
    expectedStatus: 401,
    verifyResponse: (data) => {
      return data.code === 401;
    },
    requestBody: testTag,
    requireAuth: true
  },
  {
    name: '更新标签-权限检查',
    path: '/api/tags/123456',
    method: 'PUT',
    expectedStatus: 401,
    verifyResponse: (data) => {
      return data.code === 401;
    },
    requestBody: { name: '更新的标签' },
    requireAuth: true
  },
  {
    name: '删除标签-权限检查',
    path: '/api/tags/123456',
    method: 'DELETE',
    expectedStatus: 401,
    verifyResponse: (data) => {
      return data.code === 401;
    },
    requireAuth: true
  },
  {
    name: '批量创建标签-权限检查',
    path: '/api/tags/bulk',
    method: 'POST',
    expectedStatus: 401,
    verifyResponse: (data) => {
      return data.code === 401;
    },
    requestBody: { tags: ['标签1', '标签2', '标签3'] },
    requireAuth: true
  },
  // 边界条件测试
  {
    name: '诗词列表-极端分页参数',
    path: '/api/poems?page=99999&size=1000',
    method: 'GET',
    expectedStatus: 200,
    verifyResponse: (data) => {
      return data.code === 200;
    }
  },
    {
      name: '获取热门标签-零数量限制',
      path: '/api/tags/popular?limit=0',
      method: 'GET',
      expectedStatus: 200,
      verifyResponse: (data) => {
        return data.code === 200 && data.data;
      }
    }
];

// 按照依赖关系排序端点
// 1. 首先测试不需要认证的端点
// 2. 然后测试认证相关端点
// 3. 最后测试需要认证的端点
const orderedEndpoints = [
  // 基础端点（不需要认证）
  endpoints.find(e => e.name === '健康检查'),
  // 诗词相关测试（不需要认证）
  endpoints.find(e => e.name === '诗词列表-基础查询'),
  endpoints.find(e => e.name === '诗词列表-带分页参数'),
  endpoints.find(e => e.name === '诗词列表-带排序参数'),
  endpoints.find(e => e.name === '随机诗词'),
  endpoints.find(e => e.name === '诗词详情-无效ID'),
  endpoints.find(e => e.name === '诗词点赞-无效ID'),
  // 评论相关测试（不需要认证）
  endpoints.find(e => e.name === '获取评论列表-无效诗词ID'),
  // 标签相关测试（公开接口，不需要认证）
  endpoints.find(e => e.name === '获取标签列表-基础查询'),
  endpoints.find(e => e.name === '获取标签列表-带分页参数'),
  endpoints.find(e => e.name === '获取标签列表-带关键词搜索'),
  endpoints.find(e => e.name === '获取热门标签'),
  endpoints.find(e => e.name === '获取热门标签-自定义数量'),
  endpoints.find(e => e.name === '获取标签详情-无效ID'),
  // 认证相关端点（注册登录）
  endpoints.find(e => e.name === '用户注册-有效数据'),
  endpoints.find(e => e.name === '用户注册-重复用户名'),
  endpoints.find(e => e.name === '用户注册-缺少必填字段'),
  endpoints.find(e => e.name === '用户登录-有效凭据'),
  endpoints.find(e => e.name === '用户登录-无效邮箱'),
  endpoints.find(e => e.name === '用户登录-无效密码'),
  endpoints.find(e => e.name === '用户登录-缺少凭据'),
  // 需要认证的测试（登录后执行）
  endpoints.find(e => e.name === '创建评论-无效诗词ID'),
  endpoints.find(e => e.name === '创建诗词-权限检查'),
  endpoints.find(e => e.name === '更新诗词-权限检查'),
  endpoints.find(e => e.name === '删除诗词-权限检查'),
  endpoints.find(e => e.name === '创建标签-权限检查'),
  endpoints.find(e => e.name === '更新标签-权限检查'),
  endpoints.find(e => e.name === '删除标签-权限检查'),
  endpoints.find(e => e.name === '批量创建标签-权限检查'),
  // 边界条件测试
  endpoints.find(e => e.name === '诗词列表-极端分页参数'),
  endpoints.find(e => e.name === '获取热门标签-零数量限制')
].filter(Boolean); // 过滤掉undefined项

// 测试结果存储
const testResults = {
  environment,
  startTime: new Date(),
  endTime: null,
  duration: null,
  total: orderedEndpoints.length,
  passed: 0,
  failed: 0,
  tests: []
};

/**
 * 发送HTTP请求的函数
 * @param {Object} endpoint - 端点配置
 * @returns {Promise} - 请求结果
 */
async function makeRequest(endpoint) {
  const url = new URL(endpoint.path, config.baseUrl);
  const isHttps = url.protocol === 'https:';
  const httpModule = isHttps ? https : http;
  
  const options = {
    method: endpoint.method,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: config.timeout
  };
  
  // 添加认证token
  if (endpoint.requireAuth && authToken) {
    options.headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  // 构建请求体
  const body = endpoint.requestBody ? JSON.stringify(endpoint.requestBody) : null;
  if (body) {
    options.headers['Content-Length'] = Buffer.byteLength(body);
  }
  
  return new Promise((resolve, reject) => {
    const req = httpModule.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          // 尝试解析JSON，处理可能的非JSON响应
          let parsedData;
          try {
            parsedData = data ? JSON.parse(data) : {};
          } catch (e) {
            parsedData = { raw: data };
          }
          resolve({ status: res.statusCode, data: parsedData });
        } catch (e) {
          reject(new Error(`响应处理错误: ${e.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`请求错误: ${error.message}`));
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`请求超时: ${url}`));
    });
    
    if (body) {
      req.write(body);
    }
    
    req.end();
  });
}

/**
 * 测试单个端点
 * @param {Object} endpoint - 端点配置
 * @returns {Object} - 测试结果
 */
async function testEndpoint(endpoint) {
  console.log(`测试 "${endpoint.name}" (${endpoint.method} ${endpoint.path})...`);
  
  let result = {
    name: endpoint.name,
    path: endpoint.path,
    method: endpoint.method,
    passed: false,
    expectedStatus: endpoint.expectedStatus,
    actualStatus: null,
    responseTime: null,
    error: null
  };
  
  const startTime = Date.now();
  
  try {
    // 发送请求
    const response = await makeRequest(endpoint);
    const responseTime = Date.now() - startTime;
    
    // 记录结果
    result.actualStatus = response.status;
    result.responseTime = responseTime;
    
    // 验证状态码
    const statusMatched = response.status === endpoint.expectedStatus;
    
    // 验证响应内容（如果状态码匹配）
    let contentValid = false;
    if (statusMatched && endpoint.verifyResponse) {
      contentValid = endpoint.verifyResponse(response.data);
    }
    
    // 判断测试是否通过
    result.passed = statusMatched && (contentValid || !endpoint.verifyResponse);
    
    // 如果是登录成功，保存token
    if (endpoint.name === '用户登录-有效凭据' && result.passed && response.data?.data?.token) {
      authToken = response.data.data.token;
      console.log('已获取认证token');
    }
    
    // 如果测试失败，记录错误信息
    if (!result.passed) {
      if (!statusMatched) {
        result.error = `状态码不匹配: 期望 ${endpoint.expectedStatus}, 实际 ${response.status}`;
      } else if (!contentValid) {
        result.error = '响应内容验证失败';
      }
    }
  } catch (error) {
    // 捕获请求过程中的错误
    result.error = error.message;
    result.responseTime = Date.now() - startTime;
  }
  
  return result;
}

/**
 * 生成测试报告
 * @returns {boolean} - 是否所有测试都通过
 */
function generateReport() {
  testResults.endTime = new Date();
  testResults.duration = testResults.endTime - testResults.startTime;
  
  // 统计通过和失败的测试数量
  testResults.passed = testResults.tests.filter(test => test.passed).length;
  testResults.failed = testResults.tests.filter(test => !test.passed).length;
  
  // 计算平均响应时间
  const totalResponseTime = testResults.tests.reduce((sum, test) => sum + (test.responseTime || 0), 0);
  const avgResponseTime = testResults.tests.length > 0 ? Math.round(totalResponseTime / testResults.tests.length) : 0;
  
  // 找出最长响应时间
  const maxResponseTime = Math.max(...testResults.tests.map(test => test.responseTime || 0), 0);
  
  // 格式化时间
  const formatDate = (date) => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  // 打印测试报告
  console.log('\n========== 测试报告 ==========');
  console.log(`环境: ${testResults.environment}`);
  console.log(`执行时间: ${formatDate(testResults.endTime)}`);
  console.log(`总耗时: ${testResults.duration}ms`);
  console.log(`测试结果: ${testResults.passed} 通过, ${testResults.failed} 失败`);
  console.log(`性能统计: 平均响应时间 ${avgResponseTime}ms, 最长响应时间 ${maxResponseTime}ms`);
  console.log('\n详细结果:');
  
  // 打印每个测试的详细结果
  testResults.tests.forEach(test => {
    const status = test.passed ? '✓ 通过' : '✗ 失败';
    console.log(`  ${test.method} ${test.path} - ${test.name} - ${status} (${test.responseTime}ms)`);
    if (!test.passed && test.error) {
      console.log(`    错误: ${test.error}`);
    }
  });
  
  console.log('==============================');
  
  // 保存报告到文件
  const reportDir = path.join(__dirname, '../reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportFilename = `endpoint-test-report-${Date.now()}.json`;
  const reportPath = path.join(reportDir, reportFilename);
  
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\n报告已保存到: ${reportPath}`);
  
  // 返回是否所有测试都通过
  return testResults.failed === 0;
}

/**
 * 主测试函数
 */
async function runTests() {
  // 清理可能存在的旧token和测试数据
  authToken = '';
  testTagId = '';
  
  console.log(`开始测试 API 端点 (环境: ${environment}, 超时设置: ${config.timeout}ms)`);
  console.log(`将测试 ${orderedEndpoints.length} 个端点...`);
  
  for (const endpoint of orderedEndpoints) {
    const result = await testEndpoint(endpoint);
    testResults.tests.push(result);
    
    // 可选：如果遇到严重失败可以提前退出
    // if (!result.passed && result.error && result.error.includes('连接')) {
    //   console.log('\n[错误] 遇到严重连接问题，测试提前终止');
    //   break;
    // }
  }
  
  const allPassed = generateReport();
  process.exit(allPassed ? 0 : 1);
}

// 启动测试
runTests();