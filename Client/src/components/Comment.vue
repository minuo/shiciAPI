<template>
  <div class="comment bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4">
    <!-- 评论头部 -->
    <div class="comment-header flex items-center justify-between mb-3">
      <!-- 用户信息 -->
      <div class="user-info flex items-center">
        <!-- 用户头像 -->
        <div class="avatar w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
          <img v-if="comment.user?.avatar" :src="comment.user.avatar" :alt="comment.user?.username || '用户头像'" class="w-full h-full object-cover" />
          <span v-else class="text-gray-500 dark:text-gray-400 text-lg">{{ userInitial }}</span>
        </div>
        
        <!-- 用户名和时间 -->
        <div class="ml-3">
          <h4 class="username font-medium text-gray-900 dark:text-white">{{ comment.user?.username || '匿名用户' }}</h4>
          <p class="time text-sm text-gray-500 dark:text-gray-400">{{ formatDate(comment.createdAt) }}</p>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div v-if="showActions" class="actions">
        <button 
          class="action-btn text-gray-500 hover:text-primary transition-colors"
          @click="$emit('reply', comment)"
          title="回复"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
        
        <button 
          v-if="canEdit" 
          class="action-btn text-gray-500 hover:text-primary transition-colors ml-2"
          @click="$emit('edit', comment)"
          title="编辑"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        
        <button 
          v-if="canDelete" 
          class="action-btn text-gray-500 hover:text-danger transition-colors ml-2"
          @click="$emit('delete', comment.id)"
          title="删除"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- 评论内容 -->
    <div class="comment-content text-gray-700 dark:text-gray-300 whitespace-pre-line">
      {{ comment.content }}
    </div>
    
    <!-- 回复区域 -->
    <div v-if="replies && replies.length > 0" class="replies mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
      <div v-for="reply in replies" :key="reply.id" class="reply ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4 py-2">
        <div class="flex items-center mb-1">
          <span class="reply-username text-sm font-medium text-gray-900 dark:text-white">{{ reply.user?.username || '匿名用户' }}</span>
          <span class="reply-time text-xs text-gray-500 dark:text-gray-400 ml-2">{{ formatDate(reply.createdAt) }}</span>
        </div>
        <p class="reply-content text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{{ reply.content }}</p>
      </div>
    </div>
    
    <!-- 回复表单（如果需要） -->
    <div v-if="showReplyForm" class="reply-form mt-4">
      <slot name="reply-form"></slot>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'Comment',
  props: {
    comment: {
      type: Object,
      required: true
    },
    replies: {
      type: Array,
      default: () => []
    },
    showActions: {
      type: Boolean,
      default: true
    },
    showReplyForm: {
      type: Boolean,
      default: false
    },
    canEdit: {
      type: Boolean,
      default: false
    },
    canDelete: {
      type: Boolean,
      default: false
    }
  },
  emits: ['reply', 'edit', 'delete'],
  setup(props) {
    // 获取用户名称首字母
    const userInitial = computed(() => {
      const username = props.comment.user?.username || '匿名';
      return username.charAt(0).toUpperCase();
    });
    
    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);
      
      // 根据时间差决定显示格式
      if (diffSec < 60) {
        return '刚刚';
      } else if (diffMin < 60) {
        return `${diffMin}分钟前`;
      } else if (diffHour < 24) {
        return `${diffHour}小时前`;
      } else if (diffDay < 7) {
        return `${diffDay}天前`;
      } else {
        // 超过7天显示具体日期
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    };
    
    return {
      userInitial,
      formatDate
    };
  }
});
</script>

<style scoped>
.comment {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4;
}

.comment-header {
  @apply flex items-center justify-between mb-3;
}

.user-info {
  @apply flex items-center;
}

.avatar {
  @apply w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden;
}

.username {
  @apply font-medium text-gray-900 dark:text-white;
}

.time {
  @apply text-sm text-gray-500 dark:text-gray-400;
}

.comment-content {
  @apply text-gray-700 dark:text-gray-300 whitespace-pre-line;
}

.replies {
  @apply mt-4 pt-4 border-t border-gray-100 dark:border-gray-700;
}

.reply {
  @apply ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4 py-2;
}

.action-btn {
  @apply p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700;
}
</style>