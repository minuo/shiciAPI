<template>
  <transition-group name="toast" tag="div" class="toast-container fixed top-4 right-4 z-50">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast-item flex items-center px-4 py-3 rounded-lg shadow-lg max-w-xs transition-all duration-300"
      :class="toastClasses(toast)"
    >
      <!-- 图标 -->
      <div class="toast-icon mr-3">
        <svg v-if="toast.type === 'success'" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else-if="toast.type === 'error'" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <svg v-else-if="toast.type === 'warning'" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <svg v-else-if="toast.type === 'info'" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <!-- 内容 -->
      <div class="toast-content flex-1">
        <h4 v-if="toast.title" class="toast-title font-medium text-white text-sm">{{ toast.title }}</h4>
        <p v-if="toast.message" class="toast-message text-white text-sm opacity-90">{{ toast.message }}</p>
      </div>
      
      <!-- 关闭按钮 -->
      <button
        v-if="toast.closable"
        class="toast-close ml-2 text-white opacity-70 hover:opacity-100"
        @click="removeToast(toast.id)"
        aria-label="关闭"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </transition-group>
</template>

<script>
import { defineComponent, ref, onMounted, onBeforeUnmount, nextTick } from 'vue';

export default defineComponent({
  name: 'Toast',
  setup() {
    const toasts = ref([]);
    let toastId = 0;
    
    // 生成唯一ID
    const generateId = () => {
      return `toast-${toastId++}`;
    };
    
    // 计算Toast样式类
    const toastClasses = (toast) => {
      const baseClasses = 'flex items-center px-4 py-3 rounded-lg shadow-lg max-w-xs transition-all duration-300';
      
      // 根据类型设置背景颜色
      const typeClasses = {
        success: 'bg-success',
        error: 'bg-danger',
        warning: 'bg-warning',
        info: 'bg-info',
        default: 'bg-gray-700'
      };
      
      // 根据位置设置定位类
      const positionClasses = {
        topRight: 'top-4 right-4',
        topLeft: 'top-4 left-4',
        bottomRight: 'bottom-4 right-4',
        bottomLeft: 'bottom-4 left-4',
        topCenter: 'top-4 left-1/2 transform -translate-x-1/2',
        bottomCenter: 'bottom-4 left-1/2 transform -translate-x-1/2'
      };
      
      return `${baseClasses} ${typeClasses[toast.type] || typeClasses.default}`;
    };
    
    // 添加Toast
    const addToast = (options) => {
      const toast = {
        id: generateId(),
        type: 'default',
        duration: 3000,
        closable: true,
        position: 'topRight',
        ...options
      };
      
      toasts.value.push(toast);
      
      // 设置自动关闭
      if (toast.duration > 0) {
        setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration);
      }
      
      return toast.id;
    };
    
    // 移除Toast
    const removeToast = (id) => {
      const index = toasts.value.findIndex(toast => toast.id === id);
      if (index > -1) {
        toasts.value.splice(index, 1);
      }
    };
    
    // 清空所有Toast
    const clearAll = () => {
      toasts.value = [];
    };
    
    // 便捷方法
    const success = (message, options = {}) => {
      return addToast({ ...options, type: 'success', message });
    };
    
    const error = (message, options = {}) => {
      return addToast({ ...options, type: 'error', message });
    };
    
    const warning = (message, options = {}) => {
      return addToast({ ...options, type: 'warning', message });
    };
    
    const info = (message, options = {}) => {
      return addToast({ ...options, type: 'info', message });
    };
    
    // 全局错误处理
    const handleGlobalError = (error) => {
      error(error.message || '发生未知错误', { duration: 5000 });
    };
    
    onMounted(() => {
      // 全局事件监听示例
      window.addEventListener('error', (event) => {
        handleGlobalError(event.error || new Error('未知错误'));
      });
      
      window.addEventListener('unhandledrejection', (event) => {
        handleGlobalError(event.reason || new Error('Promise 拒绝但未被捕获'));
      });
    });
    
    onBeforeUnmount(() => {
      // 清理事件监听
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleGlobalError);
    });
    
    // 暴露给全局使用
    const toast = {
      add: addToast,
      remove: removeToast,
      clear: clearAll,
      success,
      error,
      warning,
      info
    };
    
    // 将toast方法挂载到Vue实例上
    nextTick(() => {
      window.$toast = toast;
    });
    
    return {
      toasts,
      toastClasses,
      removeToast
    };
  }
});
</script>

<style scoped>
.toast-container {
  @apply fixed top-4 right-4 z-50 flex flex-col gap-2;
}

.toast-item {
  @apply flex items-center px-4 py-3 rounded-lg shadow-lg max-w-xs transition-all duration-300 transform;
}

/* 过渡动画 */
.toast-enter-active,
.toast-leave-active {
  @apply transition-all duration-300 ease-in-out;
}

.toast-enter-from {
  @apply opacity-0 translate-x-full;
}

.toast-leave-to {
  @apply opacity-0 translate-x-full scale-90;
}

.toast-move {
  @apply transition-transform duration-300;
}

/* 关闭按钮悬停效果 */
.toast-close {
  @apply p-1 rounded-full hover:bg-black/20 transition-colors;
}
</style>