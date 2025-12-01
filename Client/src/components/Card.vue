<template>
  <div class="card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
    <!-- 可选的图片区域 -->
    <div v-if="image" class="h-48 overflow-hidden">
      <img :src="image" :alt="title || '卡片图片'" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
    </div>
    
    <!-- 卡片内容区域 -->
    <div class="p-6">
      <!-- 标题 -->
      <h3 v-if="title" class="text-xl font-serif font-bold mb-2 text-gray-900 dark:text-white">{{ title }}</h3>
      
      <!-- 副标题/作者信息 -->
      <p v-if="subtitle" class="text-gray-600 dark:text-gray-400 text-sm mb-4">{{ subtitle }}</p>
      
      <!-- 内容 -->
      <div v-if="content" class="mb-4 text-gray-700 dark:text-gray-300">
        <p v-if="!truncate" class="whitespace-pre-line">{{ content }}</p>
        <p v-else class="line-clamp-3 whitespace-pre-line">{{ content }}</p>
      </div>
      
      <!-- 标签区域 -->
      <div v-if="tags && tags.length > 0" class="flex flex-wrap gap-2 mb-4">
        <TagItem v-for="tag in tags" :key="tag.id || tag" :tag="tag" :small="true" />
      </div>
      
      <!-- 底部操作区域 -->
      <div v-if="$slots.actions" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <slot name="actions"></slot>
      </div>
      
      <!-- 默认插槽 -->
      <slot v-if="!$slots.actions"></slot>
      
      <!-- 链接按钮 -->
      <router-link v-if="link" :to="link" class="inline-flex items-center text-primary hover:text-primary-dark transition-colors">
        {{ linkText || '查看详情' }}
        <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </router-link>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import TagItem from './TagItem.vue';

export default defineComponent({
  name: 'Card',
  components: {
    TagItem
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: ''
    },
    tags: {
      type: Array,
      default: () => []
    },
    link: {
      type: String,
      default: ''
    },
    linkText: {
      type: String,
      default: ''
    },
    truncate: {
      type: Boolean,
      default: true
    }
  }
});
</script>

<style scoped>
.card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg;
}

.card:hover {
  @apply transform -translate-y-1;
}
</style>