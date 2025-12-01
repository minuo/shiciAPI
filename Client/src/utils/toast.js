/**
 * Toast提示工具函数
 */

const TOAST_TYPES = ['success', 'error', 'warning', 'info'];
const TOAST_DEFAULT_DURATION = 3000;

class ToastManager {
  constructor() {
    this.toasts = [];
    this.container = null;
    this._initContainer();
  }

  // 初始化toast容器
  _initContainer() {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
    document.body.appendChild(this.container);
  }

  // 创建单个toast元素
  _createToastElement(message, type = 'info') {
    const toast = document.createElement('div');
    const toastId = Date.now().toString();
    
    // 设置样式
    toast.id = `toast-${toastId}`;
    toast.className = `px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 transform transition-all duration-300 ease-in-out`;
    
    // 根据类型设置背景色
    switch (type) {
      case 'success':
        toast.classList.add('bg-success/90', 'text-white');
        break;
      case 'error':
        toast.classList.add('bg-danger/90', 'text-white');
        break;
      case 'warning':
        toast.classList.add('bg-warning/90', 'text-white');
        break;
      default:
        toast.classList.add('bg-secondary/90', 'text-white');
    }

    // 添加消息内容
    toast.innerHTML = `
      <span class="text-sm font-medium">${message}</span>
      <button class="ml-auto text-white/80 hover:text-white focus:outline-none" onclick="document.getElementById('toast-${toastId}').remove()">
        ×
      </button>
    `;

    return toast;
  }

  // 显示toast
  show(message, type = 'info', duration = TOAST_DEFAULT_DURATION) {
    if (!TOAST_TYPES.includes(type)) {
      type = 'info';
    }

    const toast = this._createToastElement(message, type);
    
    // 添加到容器
    this.container.appendChild(toast);
    
    // 添加动画效果
    setTimeout(() => {
      toast.classList.add('opacity-100');
      toast.classList.remove('opacity-0', 'translate-x-full');
    }, 10);

    // 自动关闭
    if (duration > 0) {
      setTimeout(() => {
        this.hide(toast);
      }, duration);
    }

    return toast;
  }

  // 隐藏toast
  hide(toast) {
    toast.classList.add('opacity-0', 'translate-x-full');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  // 清空所有toast
  clear() {
    const toasts = this.container.querySelectorAll('div');
    toasts.forEach(toast => this.hide(toast));
  }
}

// 创建单例实例
const toastManager = new ToastManager();

// 导出便捷方法
export const toast = {
  success: (message, duration) => toastManager.show(message, 'success', duration),
  error: (message, duration) => toastManager.show(message, 'error', duration),
  warning: (message, duration) => toastManager.show(message, 'warning', duration),
  info: (message, duration) => toastManager.show(message, 'info', duration),
  clear: () => toastManager.clear()
};

export default toast;