<template>
  <div id="app" class="min-h-screen flex flex-col">
    <!-- 导航栏 -->
    <Navbar />
    
    <!-- 主要内容区域 -->
    <main class="flex-1 py-8">
      <div class="container mx-auto px-4">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
    
    <!-- 页脚 -->
    <Footer />
    
    <!-- 全局提示组件 -->
    <Toast />
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
import Toast from './components/Toast.vue';

export default {
  name: 'App',
  components: {
    Navbar,
    Footer,
    Toast
  }
};
</script>

<style>
/* 页面过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
