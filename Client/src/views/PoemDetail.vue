<template>
  <div class="poem-detail-page">
    <!-- 页面头部 -->
    <div class="page-header bg-gradient-to-r from-primary/90 to-accent/90 text-white py-16">
      <div class="container mx-auto px-4">
        <nav class="text-sm mb-4 text-white/90" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-2">
            <li><router-link to="/" class="hover:text-white transition-colors">首页</router-link></li>
            <li><span class="mx-2">/</span></li>
            <li><router-link to="/poems" class="hover:text-white transition-colors">诗词列表</router-link></li>
            <li><span class="mx-2">/</span></li>
            <li class="text-white font-medium">{{ poem.title || '诗词详情' }}</li>
          </ol>
        </nav>
        <h1 class="text-4xl md:text-5xl font-serif font-bold mb-4">{{ poem.title }}</h1>
        <div class="flex flex-wrap items-center gap-4 text-white/90">
          <span class="text-lg">{{ poem.author }}</span>
          <span>·</span>
          <span>{{ poem.dynasty }}</span>
          <span>·</span>
          <span class="flex items-center"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{{ poem.views }} 阅读</span>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="container mx-auto px-4 py-8">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- 左侧：诗词详情 -->
        <main class="lg:w-2/3">
          <!-- 诗词正文卡片 -->
          <article class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 md:p-8 mb-8">
            <!-- 诗词内容 -->
            <div class="poem-content font-serif text-xl md:text-2xl text-gray-800 dark:text-gray-100 leading-relaxed mb-8">
              <p v-for="(line, index) in poemContentLines" :key="index" class="mb-4 last:mb-0">
                {{ line }}
              </p>
            </div>

            <!-- 交互按钮 -->
            <div class="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div class="flex gap-4">
                <button 
                  class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                  :class="{ 
                    'bg-primary/10 text-primary': isLiked,
                    'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600': !isLiked
                  }"
                  @click="handleLike"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14l5-5 5 5z" />
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                  </svg>
                  <span>{{ poem.likes }} {{ isLiked ? '已赞' : '点赞' }}</span>
                </button>
                <button 
                  class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                  :class="{ 
                    'bg-primary/10 text-primary': isCollected,
                    'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600': !isCollected
                  }"
                  @click="handleCollect"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                  </svg>
                  <span>{{ isCollected ? '已收藏' : '收藏' }}</span>
                </button>
                <button 
                  class="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  @click="handleShare"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>分享</span>
                </button>
              </div>
              <div>
                <button 
                  class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                  @click="handleCopyContent"
                >
                  <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  复制全文
                </button>
              </div>
            </div>
          </article>

          <!-- 注释与赏析 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 md:p-8 mb-8">
            <div class="tabs flex border-b border-gray-200 dark:border-gray-700 mb-6">
              <button 
                class="px-4 py-3 font-medium text-base transition-colors"
                :class="{ 
                  'text-primary border-b-2 border-primary': activeTab === 'notes',
                  'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white': activeTab !== 'notes'
                }"
                @click="activeTab = 'notes'"
              >
                注释
              </button>
              <button 
                class="px-4 py-3 font-medium text-base transition-colors"
                :class="{ 
                  'text-primary border-b-2 border-primary': activeTab === 'appreciation',
                  'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white': activeTab !== 'appreciation'
                }"
                @click="activeTab = 'appreciation'"
              >
                赏析
              </button>
            </div>

            <!-- 注释内容 -->
            <div v-show="activeTab === 'notes'" class="notes-content">
              <div v-for="(note, index) in poem.notes" :key="index" class="mb-4 last:mb-0">
                <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">{{ note.word }}</h4>
                <p class="text-gray-600 dark:text-gray-400">{{ note.explanation }}</p>
              </div>
            </div>

            <!-- 赏析内容 -->
            <div v-show="activeTab === 'appreciation'" class="appreciation-content">
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">{{ poem.appreciation }}</p>
            </div>
          </div>

          <!-- 作者信息 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 md:p-8 mb-8">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">作者信息</h3>
            <div class="flex flex-col md:flex-row gap-6">
              <div class="md:w-1/4">
                <div class="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span class="text-primary text-4xl font-bold">{{ poem.author.charAt(0) }}</span>
                </div>
              </div>
              <div class="md:w-3/4">
                <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">{{ poem.author }}</h4>
                <p class="text-gray-600 dark:text-gray-400 mb-4">{{ poem.dynasty }}</p>
                <p class="text-gray-600 dark:text-gray-400 leading-relaxed">{{ poem.authorInfo }}</p>
                <button class="mt-4 px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg transition-colors">
                  查看更多作品
                </button>
              </div>
            </div>
          </div>

          <!-- 评论区 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 md:p-8">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">评论区 ({{ comments.length }})</h3>

            <!-- 评论输入框 -->
            <div class="mb-8" v-if="isAuthenticated">
              <div class="flex gap-4">
                <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span class="text-gray-600 dark:text-gray-400">{{ userInitial }}</span>
                </div>
                <div class="flex-1">
                  <textarea 
                    v-model="commentText" 
                    placeholder="写下你的感受..."
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    rows="4"
                  ></textarea>
                  <div class="flex justify-end mt-3">
                    <button 
                      class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                      :disabled="!commentText.trim()"
                      @click="submitComment"
                    >
                      发表评论
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 未登录提示 -->
            <div v-else class="mb-8 p-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
              <p class="text-gray-600 dark:text-gray-400 mb-4">登录后可以发表评论</p>
              <router-link to="/login" class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors inline-block">
                去登录
              </router-link>
            </div>

            <!-- 评论列表 -->
            <div class="comments-list">
              <Comment
                v-for="comment in comments"
                :key="comment.id"
                :comment="comment"
                :current-user-id="currentUserId"
                @reply="handleReply"
                @delete="handleDeleteComment"
                @like="handleLikeComment"
              />
            </div>

            <!-- 加载更多 -->
            <div class="text-center mt-8">
              <button 
                class="px-6 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                @click="loadMoreComments"
                :disabled="loadingComments"
              >
                {{ loadingComments ? '加载中...' : '加载更多评论' }}
              </button>
            </div>
          </div>
        </main>

        <!-- 右侧：相关推荐 -->
        <aside class="lg:w-1/3">
          <!-- 相关诗词 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">相关推荐</h3>
            <div class="space-y-4">
              <div 
                v-for="item in relatedPoems" 
                :key="item.id"
                class="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                @click="navigateToPoem(item.id)"
              >
                <h4 class="font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">{{ item.title }}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">{{ item.author }} · {{ item.dynasty }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{{ item.content.substring(0, 50) }}...</p>
              </div>
            </div>
          </div>

          <!-- 热门标签 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">标签</h3>
            <div class="flex flex-wrap gap-2">
              <TagItem
                v-for="tag in poem.tags"
                :key="tag"
                :name="tag"
                :link="`/tag/${encodeURIComponent(tag)}`"
                type="primary"
              />
            </div>
          </div>

          <!-- 热门诗词 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">热门诗词</h3>
            <div class="space-y-4">
              <div 
                v-for="(item, index) in popularPoems" 
                :key="item.id"
                class="flex gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                @click="navigateToPoem(item.id)"
              >
                <div class="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 font-medium text-sm">
                  {{ index + 1 }}
                </div>
                <div>
                  <h4 class="font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">{{ item.title }}</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ item.author }}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <!-- 分享弹窗 -->
    <div v-if="showShareModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">分享诗词</h3>
          <button @click="showShareModal = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="mb-4">
          <p class="text-gray-600 dark:text-gray-400 mb-2">分享链接</p>
          <div class="flex gap-2">
            <input 
              :value="shareUrl" 
              readonly
              class="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button 
              class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
              @click="copyShareUrl"
            >
              复制
            </button>
          </div>
        </div>
        <div>
          <p class="text-gray-600 dark:text-gray-400 mb-3">分享到</p>
          <div class="flex gap-3">
            <button class="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396V21.5Z" />
              </svg>
            </button>
            <button class="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>
            <button class="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Comment from '../components/Comment.vue';
import TagItem from '../components/TagItem.vue';
import { request } from '../utils';
import { toast } from '../utils/toast';
import { getUserInfo, isLoggedIn } from '../utils/auth';

export default defineComponent({
  name: 'PoemDetail',
  components: {
    Comment,
    TagItem
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    
    // 诗词数据
    const poem = ref({
      id: '',
      title: '',
      author: '',
      dynasty: '',
      content: '',
      views: 0,
      likes: 0,
      notes: [],
      appreciation: '',
      authorInfo: '',
      tags: []
    });
    
    // 相关诗词
    const relatedPoems = ref([]);
    
    // 热门诗词
    const popularPoems = ref([]);
    
    // 评论列表
    const comments = ref([]);
    
    // 当前激活的标签页
    const activeTab = ref('notes');
    
    // 交互状态
    const isLiked = ref(false);
    const isCollected = ref(false);
    const showShareModal = ref(false);
    const loadingComments = ref(false);
    const commentText = ref('');
    
    // 用户信息
    const isAuthenticated = computed(() => isLoggedIn());
    const currentUser = computed(() => getUserInfo());
    const currentUserId = computed(() => currentUser.value?.id || null);
    const userInitial = computed(() => currentUser.value?.username?.charAt(0).toUpperCase() || 'U');
    
    // 计算属性：诗词内容分行
    const poemContentLines = computed(() => {
      return poem.value.content ? poem.value.content.split('\n') : [];
    });
    
    // 计算属性：分享链接
    const shareUrl = computed(() => {
      const baseUrl = window.location.origin;
      return `${baseUrl}/poem/${poem.value.id}`;
    });
    
    // 加载诗词详情
    const loadPoemDetail = async () => {
      const poemId = route.params.id;
      try {
        // 在实际项目中，这里应该调用API获取数据
        // const response = await request.get(`/api/poems/${poemId}`);
        // poem.value = response.data;
        
        // 模拟数据
        poem.value = {
          id: poemId,
          title: '静夜思',
          author: '李白',
          dynasty: '唐代',
          content: '床前明月光，疑是地上霜。\n举头望明月，低头思故乡。',
          views: 12800,
          likes: 3256,
          notes: [
            { word: '床前', explanation: '床前：古代的床不仅是睡卧的地方，也是坐的地方。' },
            { word: '明月光', explanation: '明亮的月光。' },
            { word: '疑', explanation: '怀疑，误以为。' },
            { word: '地上霜', explanation: '地上的霜，形容月光皎洁如霜。' },
            { word: '举头', explanation: '抬头。' },
            { word: '故乡', explanation: '家乡，自己出生或长期居住的地方。' }
          ],
          appreciation: '这首脍炙人口的诗描绘了游子思乡的心情。诗人以皎洁的月光和思乡的情绪，营造出一种宁静而忧伤的氛围。前两句写诗人看到月光洒在床前，误以为是地上的霜，表现出深夜的清冷和诗人的孤寂。后两句通过"举头"和"低头"的动作对比，将诗人抬头望明月的沉思和低头思乡的深情表现得淋漓尽致。全诗语言质朴自然，意境深远，是李白诗歌的代表作之一。',
          authorInfo: '李白（701年－762年），字太白，号青莲居士，又号"谪仙人"，唐代伟大的浪漫主义诗人，被后人誉为"诗仙"，与杜甫并称为"李杜"。其诗歌风格豪放飘逸、意境奇妙，代表作有《望庐山瀑布》《行路难》《蜀道难》《将进酒》《早发白帝城》等。',
          tags: ['思乡', '月亮', '夜晚', '唐代']
        };
        
        // 设置页面标题
        document.title = `${poem.value.title} - ${poem.value.author} - 诗词赏析`;
        
        // 加载相关数据
        loadRelatedPoems();
        loadPopularPoems();
        loadComments();
        
        // 记录浏览量
        incrementViews();
        
      } catch (error) {
        console.error('加载诗词详情失败:', error);
        toast.error('加载诗词详情失败，请稍后重试');
      }
    };
    
    // 加载相关诗词
    const loadRelatedPoems = async () => {
      try {
        // 在实际项目中，这里应该调用API获取数据
        // const response = await request.get(`/api/poems/${poem.value.id}/related`);
        // relatedPoems.value = response.data;
        
        // 模拟数据
        relatedPoems.value = [
          {
            id: 2,
            title: '望庐山瀑布',
            author: '李白',
            dynasty: '唐代',
            content: '日照香炉生紫烟，遥看瀑布挂前川。\n飞流直下三千尺，疑是银河落九天。'
          },
          {
            id: 3,
            title: '春望',
            author: '杜甫',
            dynasty: '唐代',
            content: '国破山河在，城春草木深。\n感时花溅泪，恨别鸟惊心。'
          },
          {
            id: 5,
            title: '春晓',
            author: '孟浩然',
            dynasty: '唐代',
            content: '春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。'
          }
        ];
        
      } catch (error) {
        console.error('加载相关诗词失败:', error);
      }
    };
    
    // 加载热门诗词
    const loadPopularPoems = async () => {
      try {
        // 在实际项目中，这里应该调用API获取数据
        // const response = await request.get('/api/poems/popular', { params: { limit: 5 } });
        // popularPoems.value = response.data;
        
        // 模拟数据
        popularPoems.value = [
          {
            id: 1,
            title: '静夜思',
            author: '李白'
          },
          {
            id: 4,
            title: '登鹳雀楼',
            author: '王之涣'
          },
          {
            id: 6,
            title: '江雪',
            author: '柳宗元'
          },
          {
            id: 7,
            title: '望天门山',
            author: '李白'
          },
          {
            id: 8,
            title: '赋得古原草送别',
            author: '白居易'
          }
        ];
        
      } catch (error) {
        console.error('加载热门诗词失败:', error);
      }
    };
    
    // 加载评论
    const loadComments = async () => {
      try {
        // 在实际项目中，这里应该调用API获取数据
        // const response = await request.get(`/api/poems/${poem.value.id}/comments`);
        // comments.value = response.data;
        
        // 模拟数据
        comments.value = [
          {
            id: 1,
            userId: 1,
            username: '诗词爱好者',
            content: '这首诗真是太美了，每次读都有不同的感受。李白的才华真是令人钦佩！',
            createdAt: '2023-10-15T10:30:00Z',
            likes: 42,
            isLiked: false,
            replies: [
              {
                id: 11,
                userId: 2,
                username: '古典文学迷',
                content: '同感！特别是最后两句，真的很打动人心。',
                createdAt: '2023-10-15T11:20:00Z',
                likes: 15,
                isLiked: false
              }
            ]
          },
          {
            id: 2,
            userId: 3,
            username: '月夜思乡',
            content: '离家多年，每次读到"低头思故乡"都忍不住落泪。',
            createdAt: '2023-10-14T18:45:00Z',
            likes: 28,
            isLiked: false,
            replies: []
          }
        ];
        
      } catch (error) {
        console.error('加载评论失败:', error);
        toast.error('加载评论失败，请稍后重试');
      }
    };
    
    // 增加浏览量
    const incrementViews = async () => {
      try {
        // 在实际项目中，这里应该调用API
        // await request.post(`/api/poems/${poem.value.id}/view`);
        
        // 模拟增加浏览量
        poem.value.views += 1;
        
      } catch (error) {
        console.error('记录浏览量失败:', error);
      }
    };
    
    // 点赞
    const handleLike = async () => {
      if (!isAuthenticated.value) {
        router.push('/login');
        return;
      }
      
      try {
        // 在实际项目中，这里应该调用API
        // await request.post(`/api/poems/${poem.value.id}/like`);
        
        // 模拟点赞
        isLiked.value = !isLiked.value;
        poem.value.likes += isLiked.value ? 1 : -1;
        toast.success(isLiked.value ? '点赞成功' : '已取消点赞');
        
      } catch (error) {
        console.error('点赞失败:', error);
        toast.error('操作失败，请稍后重试');
      }
    };
    
    // 收藏
    const handleCollect = async () => {
      if (!isAuthenticated.value) {
        router.push('/login');
        return;
      }
      
      try {
        // 在实际项目中，这里应该调用API
        // await request.post(`/api/poems/${poem.value.id}/collect`);
        
        // 模拟收藏
        isCollected.value = !isCollected.value;
        toast.success(isCollected.value ? '收藏成功' : '已取消收藏');
        
      } catch (error) {
        console.error('收藏失败:', error);
        toast.error('操作失败，请稍后重试');
      }
    };
    
    // 分享
    const handleShare = () => {
      showShareModal.value = true;
    };
    
    // 复制全文
    const handleCopyContent = () => {
      const content = `${poem.value.title}\n${poem.value.author} · ${poem.value.dynasty}\n\n${poem.value.content}`;
      navigator.clipboard.writeText(content).then(() => {
        toast.success('诗词内容已复制到剪贴板');
      }).catch(() => {
        toast.error('复制失败，请手动复制');
      });
    };
    
    // 复制分享链接
    const copyShareUrl = () => {
      navigator.clipboard.writeText(shareUrl.value).then(() => {
        toast.success('分享链接已复制');
      }).catch(() => {
        toast.error('复制失败，请手动复制');
      });
    };
    
    // 提交评论
    const submitComment = async () => {
      if (!commentText.value.trim()) return;
      
      try {
        // 在实际项目中，这里应该调用API
        // const response = await request.post(`/api/poems/${poem.value.id}/comments`, {
        //   content: commentText.value.trim()
        // });
        // comments.value.unshift(response.data);
        
        // 模拟提交评论
        const newComment = {
          id: Date.now(),
          userId: currentUserId.value,
          username: currentUser.value.username,
          content: commentText.value.trim(),
          createdAt: new Date().toISOString(),
          likes: 0,
          isLiked: false,
          replies: []
        };
        comments.value.unshift(newComment);
        commentText.value = '';
        toast.success('评论发表成功');
        
      } catch (error) {
        console.error('发表评论失败:', error);
        toast.error('发表评论失败，请稍后重试');
      }
    };
    
    // 回复评论
    const handleReply = (commentId, replyContent) => {
      // 在实际项目中，这里应该调用API
      console.log('回复评论:', commentId, replyContent);
    };
    
    // 删除评论
    const handleDeleteComment = async (commentId) => {
      try {
        // 在实际项目中，这里应该调用API
        // await request.delete(`/api/comments/${commentId}`);
        
        // 模拟删除评论
        const index = comments.value.findIndex(c => c.id === commentId);
        if (index > -1) {
          comments.value.splice(index, 1);
          toast.success('评论已删除');
        }
        
      } catch (error) {
        console.error('删除评论失败:', error);
        toast.error('删除评论失败，请稍后重试');
      }
    };
    
    // 点赞评论
    const handleLikeComment = async (commentId) => {
      // 在实际项目中，这里应该调用API
      console.log('点赞评论:', commentId);
    };
    
    // 加载更多评论
    const loadMoreComments = async () => {
      loadingComments.value = true;
      try {
        // 在实际项目中，这里应该调用API获取更多评论
        // const response = await request.get(`/api/poems/${poem.value.id}/comments`, {
        //   params: { page: nextPage, pageSize: 10 }
        // });
        // comments.value.push(...response.data);
        
        // 模拟加载更多
        setTimeout(() => {
          loadingComments.value = false;
          toast.info('没有更多评论了');
        }, 1000);
        
      } catch (error) {
        console.error('加载更多评论失败:', error);
        toast.error('加载更多评论失败，请稍后重试');
        loadingComments.value = false;
      }
    };
    
    // 跳转到诗词详情
    const navigateToPoem = (poemId) => {
      router.push(`/poem/${poemId}`);
    };
    
    // 监听路由变化
    watch(() => route.params.id, () => {
      loadPoemDetail();
    });
    
    onMounted(() => {
      loadPoemDetail();
    });
    
    return {
      poem,
      relatedPoems,
      popularPoems,
      comments,
      activeTab,
      isLiked,
      isCollected,
      showShareModal,
      loadingComments,
      commentText,
      isAuthenticated,
      currentUserId,
      userInitial,
      poemContentLines,
      shareUrl,
      handleLike,
      handleCollect,
      handleShare,
      handleCopyContent,
      copyShareUrl,
      submitComment,
      handleReply,
      handleDeleteComment,
      handleLikeComment,
      loadMoreComments,
      navigateToPoem
    };
  }
});
</script>

<style scoped>
.poem-detail-page {
  @apply bg-gray-50 dark:bg-gray-900 min-h-screen;
}

.page-header {
  @apply bg-gradient-to-r from-primary/90 to-accent/90 text-white py-16;
}

.poem-content {
  @apply font-serif text-xl md:text-2xl text-gray-800 dark:text-gray-100 leading-relaxed mb-8;
}

/* 标签页样式 */
.tabs {
  @apply flex border-b border-gray-200 dark:border-gray-700 mb-6;
}

/* 评论列表样式 */
.comments-list {
  @apply space-y-6;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .lg\:w-2\/3 {
    @apply w-full;
  }
  
  .lg\:w-1\/3 {
    @apply w-full;
  }
}

@media (max-width: 640px) {
  .page-header h1 {
    @apply text-3xl;
  }
  
  .poem-content {
    @apply text-lg;
  }
  
  .flex.flex-wrap.items-center.justify-between {
    @apply flex-col gap-3;
  }
}
</style>