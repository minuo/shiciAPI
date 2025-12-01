<template>
  <div class="auth-page min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-md mx-auto">
        <!-- 头部标题 -->
        <div class="text-center mb-10">
          <router-link to="/" class="inline-block">
            <div class="text-primary text-4xl font-bold mb-2">诗词赏析</div>
            <p class="text-gray-600 dark:text-gray-400">中国古典诗词数据库</p>
          </router-link>
        </div>
        
        <!-- 认证卡片 -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-10">
          <!-- 标签切换 -->
          <div class="flex border-b border-gray-200 dark:border-gray-700 mb-8">
            <button
              class="flex-1 py-3 px-4 text-center font-medium transition-colors"
              :class="{
                'text-primary border-b-2 border-primary': activeTab === 'login',
                'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300': activeTab !== 'login'
              }"
              @click="switchTab('login')"
            >
              登录
            </button>
            <button
              class="flex-1 py-3 px-4 text-center font-medium transition-colors"
              :class="{
                'text-primary border-b-2 border-primary': activeTab === 'register',
                'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300': activeTab !== 'register'
              }"
              @click="switchTab('register')"
            >
              注册
            </button>
          </div>
          
          <!-- 登录表单 -->
          <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="space-y-6">
            <div class="space-y-2">
              <label for="login-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">邮箱</label>
              <input
                id="login-email"
                v-model="loginForm.email"
                type="email"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                placeholder="请输入邮箱"
                required
              >
            </div>
            
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <label for="login-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">密码</label>
                <router-link to="/forgot-password" class="text-sm text-primary hover:text-primary-dark transition-colors">忘记密码？</router-link>
              </div>
              <input
                id="login-password"
                v-model="loginForm.password"
                type="password"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                placeholder="请输入密码"
                required
              >
            </div>
            
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="rememberMe"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/50"
              >
              <label for="remember-me" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                记住我
              </label>
            </div>
            
            <button
              type="submit"
              class="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ isLoading ? '登录中...' : '登录' }}</span>
            </button>
          </form>
          
          <!-- 注册表单 -->
          <form v-else @submit.prevent="handleRegister" class="space-y-6">
            <div class="space-y-2">
              <label for="register-username" class="block text-sm font-medium text-gray-700 dark:text-gray-300">用户名</label>
              <input
                id="register-username"
                v-model="registerForm.username"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                placeholder="请输入用户名"
                minlength="3"
                maxlength="20"
                required
              >
              <p v-if="registerForm.username && registerForm.username.length < 3" class="text-xs text-red-500">用户名至少需要3个字符</p>
              <p v-if="registerForm.username && registerForm.username.length > 20" class="text-xs text-red-500">用户名不能超过20个字符</p>
            </div>
            
            <div class="space-y-2">
              <label for="register-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">邮箱</label>
              <input
                id="register-email"
                v-model="registerForm.email"
                type="email"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                placeholder="请输入邮箱"
                required
              >
              <p v-if="registerForm.email && !isValidEmail(registerForm.email)" class="text-xs text-red-500">请输入有效的邮箱地址</p>
            </div>
            
            <div class="space-y-2">
              <label for="register-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">密码</label>
              <input
                id="register-password"
                v-model="registerForm.password"
                type="password"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                placeholder="请输入密码（至少8位）"
                minlength="8"
                required
              >
              <p v-if="registerForm.password && registerForm.password.length < 8" class="text-xs text-red-500">密码至少需要8个字符</p>
            </div>
            
            <div class="space-y-2">
              <label for="register-confirm-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">确认密码</label>
              <input
                id="register-confirm-password"
                v-model="registerForm.confirmPassword"
                type="password"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                placeholder="请再次输入密码"
                required
              >
              <p v-if="registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword" class="text-xs text-red-500">两次输入的密码不一致</p>
            </div>
            
            <div class="flex items-start">
              <input
                id="terms-and-policy"
                v-model="acceptTerms"
                type="checkbox"
                class="h-4 w-4 mt-1 rounded border-gray-300 text-primary focus:ring-primary/50"
                required
              >
              <label for="terms-and-policy" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                我已阅读并同意 <a href="/terms" class="text-primary hover:text-primary-dark transition-colors">服务条款</a> 和 <a href="/privacy" class="text-primary hover:text-primary-dark transition-colors">隐私政策</a>
              </label>
            </div>
            
            <button
              type="submit"
              class="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              :disabled="isLoading || !isRegisterFormValid"
            >
              <span v-if="isLoading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ isLoading ? '注册中...' : '注册' }}</span>
            </button>
          </form>
          
          <!-- 分隔线 -->
          <div class="relative my-8">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div class="relative flex justify-center">
              <span class="px-4 bg-white dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
                或使用以下方式登录
              </span>
            </div>
          </div>
          
          <!-- 第三方登录 -->
          <div class="grid grid-cols-3 gap-3">
            <button
              type="button"
              class="flex items-center justify-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              @click="loginWithProvider('github')"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
              </svg>
            </button>
            <button
              type="button"
              class="flex items-center justify-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              @click="loginWithProvider('weibo')"
            >
              <svg class="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.43 3.705c3.17 1.1 4.11 5.11 2.54 7.895-1.77 3.15-6.4 4.9-8.58 4.9-2.67 0-3.64-1.15-4.15-1.67-.37-.36-.7-.68-.7-1.51 0-1.03.94-1.03.94-1.03 1.08-.03 1.91-.83 1.91-1.98 0-1.56-1.42-2.67-3.22-2.67-1.7 0-2.42 1.15-2.68 1.76-.37.83-.89 1.37-.89 2.71 0 2.39 2.22 4.07 5.33 4.07 3.38 0 6.04-1.85 6.62-3.3.25-.67.4-1.3.4-2.54 0-.11-.01-2.99-2.95-4.75z"/>
              </svg>
            </button>
            <button
              type="button"
              class="flex items-center justify-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              @click="loginWithProvider('wechat')"
            >
              <svg class="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.96 7.156C18.96 3.156 16.06.256 12.06.256S5.16 3.156 5.16 7.156c0 2.728 1.728 5.156 4.224 6.016-.064-.256-.192-.512-.256-.768-.128-.512-.064-1.024.064-1.472.128-.512.512-.96.96-.96.064 0 .128.064.256.064.064 0 .128-.064.192-.064.256 0 .512.192.512.512.064.384.384.64.768.64.192 0 .384-.064.512-.128.064-.256.128-.512.192-.768.064-.256.064-.512.064-.768 0-.256-.064-.512-.064-.768-.064-.512.192-1.024.704-1.344.512-.384 1.152-.32 1.6.064.256.192.448.448.576.704.192.384.256.768.256 1.152 0 .704-.256 1.344-.704 1.856-.128.064-.256.128-.448.192.32.256.64.576.896.96.512.704.832 1.536.832 2.432 0 2.624-1.792 4.768-4.032 4.768-.64 0-1.28-.064-1.856-.256-.576.512-1.344.832-2.176.832-.512 0-1.024-.064-1.472-.256.064-.256.064-.512.064-.768 0-2.728 1.92-5.056 4.416-5.952.192.256.448.448.704.576.128.576.192 1.152.192 1.728 0 2.624-1.792 4.768-4.032 4.768-.64 0-1.28-.064-1.856-.256.576-.576 1.088-1.28 1.408-2.048C17.28 12.16 18.96 9.728 18.96 7.156M17.728 19.712C17.728 15.552 14.592 12.48 10.432 12.48c-4.16 0-7.296 3.072-7.296 7.232 0 4.16 3.136 7.296 7.296 7.296 4.16 0 7.296-3.136 7.296-7.296z"/>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- 底部提示 -->
        <div class="text-center mt-8">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <span v-if="activeTab === 'login'">还没有账号？</span>
            <span v-else>已有账号？</span>
            <button
              class="text-primary hover:text-primary-dark font-medium transition-colors ml-1"
              @click="switchTab(activeTab === 'login' ? 'register' : 'login')"
            >
              {{ activeTab === 'login' ? '立即注册' : '立即登录' }}
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { request } from '../utils';
import { toast } from '../utils/toast';
import { saveToken, getToken, removeToken, saveUserInfo } from '../utils/auth';

export default defineComponent({
  name: 'Login',
  setup() {
    const router = useRouter();
    const route = useRoute();
    
    // 状态管理
    const activeTab = ref('login'); // 'login' 或 'register'
    const isLoading = ref(false);
    const rememberMe = ref(false);
    const acceptTerms = ref(false);
    
    // 登录表单
    const loginForm = ref({
      email: '',
      password: ''
    });
    
    // 注册表单
    const registerForm = ref({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    
    // 计算属性：注册表单是否有效
    const isRegisterFormValid = computed(() => {
      return (
        registerForm.value.username && 
        registerForm.value.username.length >= 3 && 
        registerForm.value.username.length <= 20 &&
        registerForm.value.email && 
        isValidEmail(registerForm.value.email) &&
        registerForm.value.password && 
        registerForm.value.password.length >= 8 &&
        registerForm.value.password === registerForm.value.confirmPassword &&
        acceptTerms.value
      );
    });
    
    // 邮箱验证
    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };
    
    // 切换标签
    const switchTab = (tab) => {
      activeTab.value = tab;
      // 切换时重置表单错误状态
      if (tab === 'login') {
        loginForm.value = {
          username: '',
          password: ''
        };
      } else {
        registerForm.value = {
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        };
        acceptTerms.value = false;
      }
    };
    
    // 处理登录
    const handleLogin = async () => {
      isLoading.value = true;
      
      try {
        // 发送登录请求到真实API端点
        const response = await request.post('/auth/login', loginForm.value);
        const { token, user } = response.data;
        
        // 验证响应数据
        if (!token || !user) {
          throw new Error('无效的响应数据');
        }
        
        // 保存认证信息（使用auth.js中的工具函数）
        saveToken(token);
        saveUserInfo(user);
        
        // 显示成功消息
        toast.success(`欢迎回来，${user.username || user.email}！`);
        
        // 跳转到首页或重定向页面
        const redirect = route.query.redirect || '/';
        setTimeout(() => {
          router.push(redirect);
        }, 1000);
        
      } catch (error) {
        console.error('登录失败:', error);
        // 根据错误类型显示不同的提示信息
        let errorMessage = '用户名或密码错误，请重试';
        
        if (error.response) {
          // 服务器返回错误
          if (error.response.status === 401) {
            errorMessage = '用户名或密码错误，请重试';
          } else if (error.response.status === 500) {
            errorMessage = '服务器错误，请稍后重试';
          } else if (error.response.status === 400 && error.response.data) {
            // 处理400错误，显示具体的验证错误信息
            if (error.response.data.data && Array.isArray(error.response.data.data)) {
              // 提取并拼接所有错误信息
              errorMessage = error.response.data.data.map(err => err.msg).join('；');
            } else if (error.response.data.message) {
              errorMessage = error.response.data.message;
            } else if (error.response.data.msg) {
              errorMessage = error.response.data.msg;
            }
          } else if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data && error.response.data.msg) {
            errorMessage = error.response.data.msg;
          }
        } else if (error.request) {
          // 请求发出但未收到响应
          errorMessage = '网络连接失败，请检查您的网络设置';
        } else {
          // 其他错误
          errorMessage = error.message || '登录失败，请稍后重试';
        }
        
        toast.error(errorMessage);
      } finally {
        isLoading.value = false;
      }
    };
    
    // 处理注册
    const handleRegister = async () => {
      // 验证表单
      if (!isRegisterFormValid.value) {
        toast.warning('请检查并完善注册信息');
        return;
      }
      
      isLoading.value = true;
      
      try {
        // 在实际项目中，这里应该调用API
        // const response = await request.post('/auth/register', {
        //   username: registerForm.value.username,
        //   email: registerForm.value.email,
        //   password: registerForm.value.password
        // });
        // const { token, user } = response.data;
        
        // 模拟注册成功
        const mockToken = 'mock_jwt_token_' + Date.now();
        const mockUser = {
          id: Math.floor(Math.random() * 1000),
          username: registerForm.value.username,
          email: registerForm.value.email,
          role: 'user'
        };
        
        // 保存认证信息
        saveToken(mockToken);
        localStorage.setItem('userInfo', JSON.stringify(mockUser));
        
        // 显示成功消息
        toast.success(`注册成功，欢迎 ${mockUser.username}！`);
        
        // 跳转到首页
        setTimeout(() => {
          router.push('/');
        }, 1000);
        
      } catch (error) {
        console.error('注册失败:', error);
        // 在实际项目中，应该根据错误信息显示不同的提示
        toast.error('注册失败，请稍后重试或联系客服');
      } finally {
        isLoading.value = false;
      }
    };
    
    // 第三方登录
    const loginWithProvider = async (provider) => {
      try {
        // 在实际项目中，这里应该重定向到第三方认证页面
        console.log(`使用 ${provider} 登录`);
        toast.info(`${provider} 登录功能正在开发中`);
        
        // 模拟第三方登录成功
        // window.location.href = `/api/auth/${provider}`;
      } catch (error) {
        console.error('第三方登录失败:', error);
        toast.error('登录失败，请稍后重试');
      }
    };
    
    // 检查是否已登录
    const checkAuth = () => {
      if (getToken()) {
        // 已登录，跳转到首页
        router.push('/');
      }
    };
    
    // 组件加载时检查认证状态
    checkAuth();
    
    return {
      activeTab,
      isLoading,
      rememberMe,
      acceptTerms,
      loginForm,
      registerForm,
      isRegisterFormValid,
      isValidEmail,
      switchTab,
      handleLogin,
      handleRegister,
      loginWithProvider
    };
  }
});
</script>

<style scoped>
.auth-page {
  @apply min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5;
}

/* 自定义动画 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .max-w-md {
    @apply max-w-full;
  }
  
  .p-8.md\:p-10 {
    @apply p-6;
  }
  

}

@media (max-width: 480px) {
  .text-4xl {
    @apply text-3xl;
  }
  
  .py-8 {
    @apply py-4;
  }
}

/* 深色模式调整 */
.dark .bg-white.dark\:bg-gray-800 {
  @apply bg-gray-800;
}

.dark .border-gray-300.dark\:border-gray-600 {
  @apply border-gray-600;
}

.dark .text-gray-900.dark\:text-white {
  @apply text-white;
}

.dark .bg-gray-100.dark\:bg-gray-700 {
  @apply bg-gray-700;
}

.dark .hover\:bg-gray-50.dark\:hover\:bg-gray-700 {
  @apply hover:bg-gray-700;
}

.dark .hover\:bg-gray-200.dark\:hover\:bg-gray-600 {
  @apply hover:bg-gray-600;
}

.dark .text-gray-700.dark\:text-gray-300 {
  @apply text-gray-300;
}

.dark .text-gray-600.dark\:text-gray-400 {
  @apply text-gray-400;
}

.dark .text-gray-500.dark\:text-gray-400 {
  @apply text-gray-400;
}
</style>