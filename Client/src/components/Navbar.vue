<template>
  <nav class="bg-white shadow-md sticky top-0 z-40">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <div class="flex-shrink-0">
          <router-link to="/" class="flex items-center space-x-2">
            <span class="text-primary text-2xl font-serif font-bold">诗词赏析</span>
          </router-link>
        </div>
        
        <!-- 导航菜单 - 桌面端 -->
        <div class="hidden md:block">
          <div class="ml-10 flex items-center space-x-8">
            <router-link 
              to="/" 
              class="nav-link" 
              :class="{ active: currentRoute === '/' }"
            >
              首页
            </router-link>
            <router-link 
              to="/poems" 
              class="nav-link" 
              :class="{ active: currentRoute === '/poems' }"
            >
              诗词列表
            </router-link>
          </div>
        </div>
        
        <!-- 用户菜单 -->
        <div class="hidden md:flex items-center space-x-4">
          <div v-if="isLoggedIn" class="flex items-center space-x-2">
            <span class="text-sm text-gray-700">
              {{ userInfo?.username || '用户' }}
            </span>
            <button 
              @click="handleLogout" 
              class="text-sm text-gray-600 hover:text-danger transition-colors"
            >
              退出
            </button>
          </div>
          <router-link 
            v-else 
            to="/login" 
            class="btn btn-primary text-sm"
          >
            登录
          </router-link>
        </div>
        
        <!-- 移动端菜单按钮 -->
        <div class="md:hidden flex items-center">
          <button 
            @click="mobileMenuOpen = !mobileMenuOpen" 
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 focus:outline-none"
          >
            <svg 
              class="h-6 w-6" 
              stroke="currentColor" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <path 
                v-if="!mobileMenuOpen"
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M4 6h16M4 12h16m-7 6h7"
              ></path>
              <path 
                v-else
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 移动端菜单 -->
    <div v-if="mobileMenuOpen" class="md:hidden">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <router-link 
          to="/" 
          class="block px-3 py-2 rounded-md text-base font-medium"
          :class="{ 'bg-primary text-white': currentRoute === '/' }"
          @click="mobileMenuOpen = false"
        >
          首页
        </router-link>
        <router-link 
          to="/poems" 
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
          :class="{ 'bg-primary text-white': currentRoute === '/poems' }"
          @click="mobileMenuOpen = false"
        >
          诗词列表
        </router-link>
        <div v-if="isLoggedIn" class="pt-4 pb-3 border-t border-gray-200">
          <div class="flex items-center px-5">
            <div class="flex-shrink-0">
              <span class="text-sm text-gray-700 font-medium">{{ userInfo?.username || '用户' }}</span>
            </div>
            <button 
              @click="handleLogout" 
              class="ml-auto text-sm text-danger hover:text-danger/80 transition-colors"
            >
              退出
            </button>
          </div>
        </div>
        <router-link 
          v-else 
          to="/login" 
          class="block px-3 py-2 rounded-md text-base font-medium text-center"
          @click="mobileMenuOpen = false"
        >
          <button class="btn btn-primary w-full">登录</button>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { isLoggedIn, getUserInfo, logout as logoutUser } from '../utils/auth';
import { toast } from '../utils/toast';

export default {
  name: 'Navbar',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const mobileMenuOpen = ref(false);
    const currentUser = ref(null);
    
    // 计算当前路由
    const currentRoute = computed(() => route.path.split('/')[1] ? `/${route.path.split('/')[1]}` : '/');
    
    // 检查登录状态
    const checkLoginStatus = () => {
      if (isLoggedIn()) {
        currentUser.value = getUserInfo();
      } else {
        currentUser.value = null;
      }
    };
    
    // 退出登录处理
    const handleLogout = () => {
      logoutUser();
      currentUser.value = null;
      mobileMenuOpen.value = false;
      toast.success('退出成功');
      router.push('/');
    };
    
    // 监听路由变化
    watch(() => route.path, () => {
      mobileMenuOpen.value = false;
    });
    
    // 组件挂载时检查登录状态
    onMounted(() => {
      checkLoginStatus();
      
      // 添加全局事件监听，用于在其他组件中更新登录状态
      window.addEventListener('userLoggedIn', checkLoginStatus);
      window.addEventListener('userLoggedOut', checkLoginStatus);
    });
    
    return {
      mobileMenuOpen,
      currentRoute,
      isLoggedIn: computed(() => !!currentUser.value),
      userInfo: computed(() => currentUser.value),
      handleLogout
    };
  }
};
</script>

<style scoped>
.nav-link {
  @apply inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium;
  @apply text-gray-700 border-transparent hover:text-primary hover:border-primary/30;
}

.nav-link.active {
  @apply border-primary text-primary;
}
</style>