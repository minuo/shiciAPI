<template>
  <footer class="bg-dark text-white py-8 mt-12">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row justify-between">
        <!-- 关于信息 -->
        <div class="mb-6 md:mb-0">
          <h3 class="text-xl font-serif font-bold mb-4">诗词赏析</h3>
          <p class="text-gray-400 text-sm max-w-md">
            一个专注于中国古典诗词的赏析平台，让你感受中华文化的魅力。
            在这里，你可以浏览经典诗词，了解诗词背景，欣赏古人的智慧与情感。
          </p>
        </div>
        
        <!-- 快速链接 -->
        <div>
          <h4 class="text-lg font-medium mb-4">快速链接</h4>
          <ul class="space-y-2 text-gray-400">
            <li>
              <router-link to="/" class="hover:text-white transition-colors">首页</router-link>
            </li>
            <li>
              <router-link to="/poems" class="hover:text-white transition-colors">诗词列表</router-link>
            </li>
            <li>
              <a href="#" class="hover:text-white transition-colors">关于我们</a>
            </li>
            <li>
              <a href="#" class="hover:text-white transition-colors">使用帮助</a>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-sm">
        <p>&copy; {{ currentYear }} 诗词赏析平台 - 传承中华文化</p>
      </div>
    </div>
  </footer>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'Footer',
  setup() {
    const currentYear = ref(new Date().getFullYear());
    
    onMounted(() => {
      // 监听年份变化，确保自动更新
      const updateYear = () => {
        currentYear.value = new Date().getFullYear();
      };
      
      // 设置每年1月1日更新年份
      const now = new Date();
      const nextYear = new Date(now.getFullYear() + 1, 0, 1);
      const timeUntilNextYear = nextYear - now;
      
      setTimeout(updateYear, timeUntilNextYear);
    });
    
    return {
      currentYear
    };
  }
};
</script>

<style scoped>
footer a {
  @apply text-gray-400 hover:text-white transition-colors;
}
</style>