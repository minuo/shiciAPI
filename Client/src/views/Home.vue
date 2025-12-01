<template>
  <div class="home-page">
    <!-- 英雄区 -->
    <section class="hero bg-gradient-to-r from-primary to-primary-dark text-white py-20">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 leading-tight">
            品味中华经典<br>感受诗词魅力
          </h1>
          <p class="text-xl md:text-2xl mb-8 text-white/90">
            探索千年文化瑰宝，聆听古人智慧心声
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <router-link to="/poems" class="btn bg-white text-primary hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              浏览诗词
            </router-link>
            <router-link to="/random" class="btn bg-transparent border-2 border-white text-white hover:bg-white/10 font-medium py-3 px-8 rounded-lg transition-all">
              随机欣赏
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- 统计数据卡片 -->
    <section class="stats py-8 bg-gray-50 dark:bg-gray-900">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          <div class="stat-card bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
            <div class="stat-number text-3xl md:text-4xl font-bold text-primary mb-2">{{ totalPoems }}</div>
            <div class="stat-label text-gray-600 dark:text-gray-400">经典诗词</div>
          </div>
          <div class="stat-card bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
            <div class="stat-number text-3xl md:text-4xl font-bold text-primary mb-2">{{ totalPoets }}</div>
            <div class="stat-label text-gray-600 dark:text-gray-400">著名诗人</div>
          </div>
          <div class="stat-card bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
            <div class="stat-number text-3xl md:text-4xl font-bold text-primary mb-2">{{ totalTags }}</div>
            <div class="stat-label text-gray-600 dark:text-gray-400">诗词标签</div>
          </div>
          <div class="stat-card bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
            <div class="stat-number text-3xl md:text-4xl font-bold text-primary mb-2">{{ totalAppreciations }}</div>
            <div class="stat-label text-gray-600 dark:text-gray-400">诗词赏析</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 推荐诗词 -->
    <section class="recommended py-16">
      <div class="container mx-auto px-4">
        <div class="section-header mb-10 flex justify-between items-center">
          <h2 class="text-3xl font-serif font-bold text-gray-900 dark:text-white">推荐诗词</h2>
          <router-link to="/poems" class="text-primary hover:text-primary-dark flex items-center">
            查看全部
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </router-link>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <Card
            v-for="poem in recommendedPoems"
            :key="poem.id"
            :title="poem.title"
            :subtitle="`${poem.author} · ${poem.dynasty}`"
            :content="poem.content"
            :tags="poem.tags"
            :link="`/poem/${poem.id}`"
          />
        </div>
      </div>
    </section>

    <!-- 特色功能区域 -->
    <section class="features py-16 bg-gray-50 dark:bg-gray-900">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-serif font-bold text-center text-gray-900 dark:text-white mb-12">
          特色功能
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="feature-card bg-white dark:bg-gray-800 p-8 rounded-lg shadow transition-all duration-300 hover:shadow-lg">
            <div class="feature-icon w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">诗词赏析</h3>
            <p class="text-gray-600 dark:text-gray-400">
              每首诗词都配有详细的赏析内容，帮助你深入理解古人的思想感情和艺术手法。
            </p>
          </div>
          
          <div class="feature-card bg-white dark:bg-gray-800 p-8 rounded-lg shadow transition-all duration-300 hover:shadow-lg">
            <div class="feature-icon w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">标签分类</h3>
            <p class="text-gray-600 dark:text-gray-400">
              通过标签系统，按主题、情感、季节等维度筛选诗词，快速找到你感兴趣的内容。
            </p>
          </div>
          
          <div class="feature-card bg-white dark:bg-gray-800 p-8 rounded-lg shadow transition-all duration-300 hover:shadow-lg">
            <div class="feature-icon w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">互动评论</h3>
            <p class="text-gray-600 dark:text-gray-400">
              分享你的读后感受，与其他诗词爱好者交流心得，共同探讨古典文化的魅力。
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 热门标签 -->
    <section class="popular-tags py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-8">
          热门标签
        </h2>
        
        <div class="tags-cloud flex flex-wrap gap-3">
          <TagItem
            v-for="tag in popularTags"
            :key="tag.id"
            :tag="tag"
            :type="getRandomType()"
          />
        </div>
      </div>
    </section>

    <!-- 最新诗词 -->
    <section class="latest-poems py-16 bg-gray-50 dark:bg-gray-900">
      <div class="container mx-auto px-4">
        <div class="section-header mb-10 flex justify-between items-center">
          <h2 class="text-3xl font-serif font-bold text-gray-900 dark:text-white">最新添加</h2>
          <router-link to="/poems?sort=latest" class="text-primary hover:text-primary-dark flex items-center">
            查看全部
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </router-link>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <Card
            v-for="poem in latestPoems"
            :key="poem.id"
            :title="poem.title"
            :subtitle="`${poem.author} · ${poem.dynasty}`"
            :content="poem.content"
            :tags="poem.tags"
            :link="`/poem/${poem.id}`"
          />
        </div>
      </div>
    </section>

    <!-- 底部号召性区域 -->
    <section class="cta py-16 bg-primary text-white">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl font-serif font-bold mb-4">开始你的诗词之旅</h2>
        <p class="text-xl mb-8 max-w-2xl mx-auto text-white/90">
          注册账号，收藏喜爱的诗词，参与讨论，深入探索中华古典文化的博大精深。
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <router-link to="/login" class="btn bg-white text-primary hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl">
            立即注册/登录
          </router-link>
          <router-link to="/about" class="btn bg-transparent border-2 border-white text-white hover:bg-white/10 font-medium py-3 px-8 rounded-lg transition-all">
            了解更多
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import Card from '../components/Card.vue';
import TagItem from '../components/TagItem.vue';
import { request } from '../utils';
import { toast } from '../utils/toast';

export default defineComponent({
  name: 'Home',
  components: {
    Card,
    TagItem
  },
  setup() {
    // 统计数据
    const totalPoems = ref(1000);
    const totalPoets = ref(100);
    const totalTags = ref(50);
    const totalAppreciations = ref(500);
    
    // 推荐诗词
    const recommendedPoems = ref([
      {
        id: 1,
        title: '静夜思',
        author: '李白',
        dynasty: '唐代',
        content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
        tags: ['思乡', '月亮', '夜晚']
      },
      {
        id: 2,
        title: '望庐山瀑布',
        author: '李白',
        dynasty: '唐代',
        content: '日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。',
        tags: ['山水', '壮观', '庐山']
      },
      {
        id: 3,
        title: '春望',
        author: '杜甫',
        dynasty: '唐代',
        content: '国破山河在，城春草木深。感时花溅泪，恨别鸟惊心。烽火连三月，家书抵万金。白头搔更短，浑欲不胜簪。',
        tags: ['春天', '战争', '思乡']
      }
    ]);
    
    // 最新诗词
    const latestPoems = ref([
      {
        id: 4,
        title: '登鹳雀楼',
        author: '王之涣',
        dynasty: '唐代',
        content: '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。',
        tags: ['山水', '哲理', '登高']
      },
      {
        id: 5,
        title: '春晓',
        author: '孟浩然',
        dynasty: '唐代',
        content: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。',
        tags: ['春天', '早晨', '惜春']
      },
      {
        id: 6,
        title: '江雪',
        author: '柳宗元',
        dynasty: '唐代',
        content: '千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。',
        tags: ['冬天', '孤独', '钓鱼']
      }
    ]);
    
    // 热门标签
    const popularTags = ref([
      { id: 1, name: '山水田园' },
      { id: 2, name: '思乡怀人' },
      { id: 3, name: '咏史怀古' },
      { id: 4, name: '边塞战争' },
      { id: 5, name: '爱情闺怨' },
      { id: 6, name: '哲理思辨' },
      { id: 7, name: '春夏秋冬' },
      { id: 8, name: '风花雪月' },
      { id: 9, name: '饮酒品茗' },
      { id: 10, name: '人生感悟' }
    ]);
    
    // 获取随机标签类型
    const getRandomType = () => {
      const types = ['default', 'primary', 'secondary', 'success', 'warning', 'info'];
      return types[Math.floor(Math.random() * types.length)];
    };
    
    // 加载数据
    const loadData = async () => {
      try {
        // 在实际项目中，这里应该调用API获取数据
        // 模拟API调用
        // const [statsRes, poemsRes, tagsRes] = await Promise.all([
        //   request.get('/api/stats'),
        //   request.get('/api/poems/recommended'),
        //   request.get('/api/tags/popular')
        // ]);
        // 
        // totalPoems.value = statsRes.data.poems;
        // totalPoets.value = statsRes.data.poets;
        // totalTags.value = statsRes.data.tags;
        // totalAppreciations.value = statsRes.data.appreciations;
        // recommendedPoems.value = poemsRes.data;
        // latestPoems.value = await request.get('/api/poems/latest').then(res => res.data);
        // popularTags.value = tagsRes.data;
        
        console.log('首页数据加载完成');
      } catch (error) {
        console.error('加载首页数据失败:', error);
        toast.error('加载数据失败，请稍后重试');
      }
    };
    
    onMounted(() => {
      loadData();
      
      // 设置页面标题
      document.title = '诗词赏析 - 首页';
    });
    
    return {
      totalPoems,
      totalPoets,
      totalTags,
      totalAppreciations,
      recommendedPoems,
      latestPoems,
      popularTags,
      getRandomType
    };
  }
});
</script>

<style scoped>
.home-page {
  @apply bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200;
}

.hero {
  @apply bg-gradient-to-r from-primary to-accent text-white py-20;
}

/* 使用新的自定义类 */
.hero .btn {
  @apply transition-all duration-300;
}

.stat-card {
  @apply bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center transition-all duration-300 hover:shadow-md hover:translate-y-[-2px];
}

.feature-card {
  @apply bg-white dark:bg-gray-800 p-8 rounded-lg shadow transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px];
}

.section-header {
  @apply mb-10 flex justify-between items-center;
}

.section-header h2 {
  @apply page-title;
}

.tags-cloud {
  @apply flex flex-wrap gap-3;
}

/* 动画效果 */
.hero h1,
.hero p,
.hero .btn,
.stat-card,
.feature-card,
.tags-cloud .tag-item {
  @apply fade-in;
}

.hero h1 {
  animation-delay: 0.1s;
}

.hero p {
  animation-delay: 0.2s;
}

.hero .btn:first-child {
  animation-delay: 0.3s;
}

.hero .btn:last-child {
  animation-delay: 0.4s;
}

/* 响应式调整已移至全局样式，但保留组件特定的响应式调整 */
@media (max-width: 480px) {
  .hero {
    @apply py-16;
  }
  
  .feature-card {
    @apply p-6;
  }
  
  .feature-icon {
    @apply w-12 h-12 mb-4;
  }
  
  .feature-icon svg {
    @apply w-6 h-6;
  }
}

/* 深色模式优化 */
@media (prefers-color-scheme: dark) {
  .hero {
    @apply bg-gradient-to-r from-primary/90 to-accent/90;
  }
  
  .stat-card,
  .feature-card {
    @apply bg-gray-800/80;
  }
}
</style>