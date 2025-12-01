<template>
  <router-link
    v-if="isLink"
    :to="tagLink"
    class="tag-item inline-flex items-center px-3 py-1 rounded-full text-sm transition-all"
    :class="tagClasses"
  >
    <span v-if="showIcon" class="w-2 h-2 rounded-full bg-current mr-2"></span>
    {{ tagText }}
  </router-link>
  
  <span
    v-else
    class="tag-item inline-flex items-center px-3 py-1 rounded-full text-sm transition-all cursor-pointer"
    :class="tagClasses"
    @click="$emit('click', tag)"
  >
    <span v-if="showIcon" class="w-2 h-2 rounded-full bg-current mr-2"></span>
    {{ tagText }}
  </span>
</template>

<script>
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'TagItem',
  props: {
    tag: {
      type: [String, Object],
      required: true
    },
    type: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'primary', 'secondary', 'success', 'warning', 'danger'].includes(value)
    },
    small: {
      type: Boolean,
      default: false
    },
    showIcon: {
      type: Boolean,
      default: false
    },
    isLink: {
      type: Boolean,
      default: true
    }
  },
  emits: ['click'],
  setup(props) {
    // 计算标签文本
    const tagText = computed(() => {
      if (typeof props.tag === 'string') {
        return props.tag;
      }
      return props.tag.name || props.tag.title || '未命名';
    });
    
    // 计算标签链接
    const tagLink = computed(() => {
      if (typeof props.tag === 'string') {
        return `/tag/${encodeURIComponent(props.tag)}`;
      }
      return props.tag.id ? `/tag/${props.tag.id}` : `/tag/${encodeURIComponent(props.tag.name || props.tag.title)}`;
    });
    
    // 计算标签样式类
    const tagClasses = computed(() => {
      const baseClasses = props.small ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
      
      // 根据类型设置不同的颜色样式
      const typeClasses = {
        default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600',
        primary: 'bg-primary/10 text-primary hover:bg-primary/20',
        secondary: 'bg-secondary/10 text-secondary hover:bg-secondary/20',
        success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/40',
        warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800/40',
        danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/40'
      };
      
      return `${baseClasses} ${typeClasses[props.type] || typeClasses.default}`;
    });
    
    return {
      tagText,
      tagLink,
      tagClasses
    };
  }
});
</script>

<style scoped>
.tag-item {
  @apply inline-flex items-center rounded-full transition-all duration-200;
}

.tag-item:hover {
  @apply transform scale-105;
}
</style>