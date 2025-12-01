<template>
  <div class="not-found-page min-h-screen flex flex-col">
    <!-- 导航栏 -->
    <header class="border-b border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm sticky top-0 z-30">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16 md:h-20">
          <router-link to="/" class="flex items-center space-x-2">
            <div class="text-primary text-2xl font-bold">诗词赏析</div>
          </router-link>
          
          <!-- 导航链接 -->
          <nav class="hidden md:flex items-center space-x-6">
            <router-link to="/" class="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">首页</router-link>
            <router-link to="/poems" class="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">诗词列表</router-link>
          </nav>
          
          <!-- 右侧按钮组 -->
          <div class="flex items-center space-x-4">
            <router-link to="/login" class="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">登录/注册</router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="flex-grow flex flex-col items-center justify-center py-16 px-4">
      <div class="text-center max-w-2xl mx-auto">
        <div class="text-9xl md:text-[10rem] font-bold text-gray-100 dark:text-gray-800 mb-6">404</div>
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">页面未找到</h1>
        <p class="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          抱歉，您访问的页面不存在或已被删除。请检查您输入的网址是否正确，或返回首页继续浏览。
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link 
            to="/" 
            class="bg-primary hover:bg-primary-dark text-white font-medium py-3 px-8 rounded-lg transition-colors text-center"
          >
            返回首页
          </router-link>
          <router-link 
            to="/poems" 
            class="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 font-medium py-3 px-8 rounded-lg transition-colors text-center"
          >
            浏览诗词
          </router-link>
        </div>
      </div>
      
      <!-- 装饰性诗词元素 -->
      <div class="mt-16 text-center text-gray-300 dark:text-gray-600 text-sm md:text-base italic">
        <p class="mb-2">"山重水复疑无路，柳暗花明又一村。"</p>
        <p>—— 陆游《游山西村》</p>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8">
      <div class="container mx-auto px-4">
        <div class="text-center text-gray-500 dark:text-gray-400 text-sm">
          <p class="mb-2">© 2024 诗词赏析. 保留所有权利.</p>
          <div class="flex justify-center space-x-4">
            <a href="/about" class="hover:text-primary transition-colors">关于我们</a>
            <span>|</span>
            <a href="/terms" class="hover:text-primary transition-colors">服务条款</a>
            <span>|</span>
            <a href="/privacy" class="hover:text-primary transition-colors">隐私政策</a>
            <span>|</span>
            <a href="/contact" class="hover:text-primary transition-colors">联系我们</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { defineComponent, onMounted } from 'vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'NotFound',
  setup() {
    const route = useRoute();
    
    // 设置页面标题
    onMounted(() => {
      document.title = '页面未找到 - 古诗词赏析';
      console.warn(`未找到的路径: ${route.fullPath}`);
    });
    
    return {};
  }
});
</script>

<style scoped>
.not-found-page {
  @apply min-h-screen flex flex-col;
}

/* 响应式调整已移除，避免Tailwind CSS循环依赖问题 */
</style>