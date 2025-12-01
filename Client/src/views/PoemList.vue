<template>
  <div class="poem-list-page">
    <!-- 页面标题 -->
    <div class="page-header bg-white dark:bg-gray-800 py-6 border-b border-gray-200 dark:border-gray-700">
      <div class="container mx-auto px-4">
        <h1 class="text-3xl font-serif font-bold text-gray-900 dark:text-white">诗词列表</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">探索中国古典诗词的瑰宝</p>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="container mx-auto px-4 py-8">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- 筛选侧边栏 -->
        <aside class="lg:w-1/4">
          <div class="filter-sidebar bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-8">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">筛选条件</h3>
            
            <!-- 朝代筛选 -->
            <div class="filter-section mb-6">
              <h4 class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">朝代</h4>
              <div class="flex flex-wrap gap-2">
                <label 
                  v-for="dynasty in dynasties" 
                  :key="dynasty"
                  class="inline-flex items-center px-3 py-1.5 rounded-full cursor-pointer transition-all text-sm"
                  :class="{ 
                    'bg-primary text-white': filters.dynasty === dynasty,
                    'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600': filters.dynasty !== dynasty
                  }"
                  @click="updateFilter('dynasty', filters.dynasty === dynasty ? '' : dynasty)"
                >
                  {{ dynasty }}
                </label>
              </div>
            </div>
            
            <!-- 主题标签筛选 -->
            <div class="filter-section mb-6">
              <h4 class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">主题标签</h4>
              <div class="flex flex-wrap gap-2">
                <label 
                  v-for="tag in allTags" 
                  :key="tag.name"
                  class="inline-flex items-center px-3 py-1.5 rounded-full cursor-pointer transition-all text-sm"
                  :class="{ 
                    'bg-primary text-white': selectedTags.includes(tag.name),
                    'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600': !selectedTags.includes(tag.name)
                  }"
                  @click="toggleTag(tag.name)"
                >
                  {{ tag.name }}
                </label>
              </div>
            </div>
            
            <!-- 作者搜索 -->
            <div class="filter-section mb-6">
              <h4 class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">作者</h4>
              <input
                type="text"
                v-model="filters.author"
                placeholder="输入作者姓名..."
                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                @input="handleAuthorSearch"
              />
              
              <!-- 作者建议列表 -->
              <div v-if="authorSuggestions.length > 0 && filters.author.trim()" class="mt-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
                <div
                  v-for="author in authorSuggestions"
                  :key="author"
                  class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                  @click="selectAuthor(author)"
                >
                  {{ author }}
                </div>
              </div>
            </div>
            
            <!-- 排序方式 -->
            <div class="filter-section mb-6">
              <h4 class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">排序方式</h4>
              <select
                v-model="filters.sort"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                @change="handleSortChange"
              >
                <option value="popular">按热度排序</option>
                <option value="latest">最新添加</option>
                <option value="oldest">按朝代排序</option>
              </select>
            </div>
            
            <!-- 重置按钮 -->
            <button 
              class="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
              @click="resetFilters"
            >
              重置筛选条件
            </button>
          </div>
        </aside>
        
        <!-- 诗词列表 -->
        <main class="lg:w-3/4">
          <!-- 搜索框 -->
          <div class="search-container bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
            <div class="relative">
              <input
                type="text"
                v-model="filters.keyword"
                placeholder="搜索诗词标题或内容..."
                class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                @input="handleKeywordSearch"
              />
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <button 
                v-if="filters.keyword.trim()" 
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                @click="clearKeyword"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- 筛选结果统计 -->
          <div class="result-stats mb-6 text-gray-600 dark:text-gray-400">
            共找到 <span class="font-medium text-primary">{{ poems.length }}</span> 首诗词
            <span v-if="activeFilters.length > 0" class="ml-2">
              <span class="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm" v-for="filter in activeFilters" :key="filter">
                {{ filter }}
                <button class="ml-1" @click="removeFilter(filter)">×</button>
              </span>
            </span>
          </div>
          
          <!-- 诗词卡片列表 -->
          <div v-if="poems.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card
              v-for="poem in poems"
              :key="poem.id"
              :title="poem.title"
              :subtitle="`${poem.author} · ${poem.dynasty}`"
              :content="poem.content"
              :tags="poem.tags"
              :link="`/poem/${poem.id}`"
            />
          </div>
          
          <!-- 空状态 -->
          <div v-else class="empty-state bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <svg class="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-2">暂无符合条件的诗词</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">请尝试调整筛选条件或搜索关键词</p>
            <button class="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-lg transition-colors" @click="resetFilters">
              重置所有筛选
            </button>
          </div>
          
          <!-- 分页控件 -->
          <div v-if="poems.length > 0" class="pagination mt-10 flex justify-center">
            <button 
              class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 mr-2"
              :disabled="currentPage === 1"
              @click="changePage(currentPage - 1)"
            >
              上一页
            </button>
            
            <button
              v-for="page in pageNumbers"
              :key="page"
              class="px-4 py-2 rounded-lg mx-1 transition-colors"
              :class="{
                'bg-primary text-white': currentPage === page,
                'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700': currentPage !== page
              }"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
            
            <button 
              class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 ml-2"
              :disabled="currentPage === totalPages"
              @click="changePage(currentPage + 1)"
            >
              下一页
            </button>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Card from '../components/Card.vue';
import { request } from '../utils';
import { toast } from '../utils/toast';

export default defineComponent({
  name: 'PoemList',
  components: {
    Card
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    
    // 诗词列表数据
    const poems = ref([
      {
        id: 1,
        title: '静夜思',
        author: '李白',
        dynasty: '唐代',
        content: '床前明月光，疑是地上霜。\n举头望明月，低头思故乡。',
        tags: ['思乡', '月亮', '夜晚']
      },
      {
        id: 2,
        title: '望庐山瀑布',
        author: '李白',
        dynasty: '唐代',
        content: '日照香炉生紫烟，遥看瀑布挂前川。\n飞流直下三千尺，疑是银河落九天。',
        tags: ['山水', '壮观', '庐山']
      },
      {
        id: 3,
        title: '春望',
        author: '杜甫',
        dynasty: '唐代',
        content: '国破山河在，城春草木深。\n感时花溅泪，恨别鸟惊心。\n烽火连三月，家书抵万金。\n白头搔更短，浑欲不胜簪。',
        tags: ['春天', '战争', '思乡']
      },
      {
        id: 4,
        title: '登鹳雀楼',
        author: '王之涣',
        dynasty: '唐代',
        content: '白日依山尽，黄河入海流。\n欲穷千里目，更上一层楼。',
        tags: ['山水', '哲理', '登高']
      },
      {
        id: 5,
        title: '春晓',
        author: '孟浩然',
        dynasty: '唐代',
        content: '春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。',
        tags: ['春天', '早晨', '惜春']
      },
      {
        id: 6,
        title: '江雪',
        author: '柳宗元',
        dynasty: '唐代',
        content: '千山鸟飞绝，万径人踪灭。\n孤舟蓑笠翁，独钓寒江雪。',
        tags: ['冬天', '孤独', '钓鱼']
      }
    ]);
    
    // 筛选条件
    const filters = ref({
      keyword: '',
      dynasty: '',
      author: '',
      tags: [],
      sort: 'popular'
    });
    
    // 分页信息
    const currentPage = ref(1);
    const pageSize = ref(12);
    const totalCount = ref(0);
    
    // 可用的朝代列表
    const dynasties = ref(['先秦', '两汉', '魏晋', '南北朝', '唐代', '五代', '宋代', '元代', '明代', '清代']);
    
    // 所有标签
    const allTags = ref([
      { name: '山水田园' },
      { name: '思乡怀人' },
      { name: '咏史怀古' },
      { name: '边塞战争' },
      { name: '爱情闺怨' },
      { name: '哲理思辨' },
      { name: '春夏秋冬' },
      { name: '风花雪月' }
    ]);
    
    // 作者建议列表
    const authorSuggestions = ref([]);
    
    // 模拟作者列表
    const mockAuthors = ['李白', '杜甫', '白居易', '王维', '孟浩然', '李商隐', '杜牧', '苏轼', '辛弃疾', '陆游'];
    
    // 计算属性：选中的标签
    const selectedTags = computed(() => filters.value.tags);
    
    // 计算属性：活跃的筛选条件显示
    const activeFilters = computed(() => {
      const active = [];
      if (filters.value.keyword) active.push(`关键词: ${filters.value.keyword}`);
      if (filters.value.dynasty) active.push(`朝代: ${filters.value.dynasty}`);
      if (filters.value.author) active.push(`作者: ${filters.value.author}`);
      if (filters.value.tags.length > 0) active.push(...filters.value.tags);
      return active;
    });
    
    // 计算属性：总页数
    const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value));
    
    // 计算属性：分页页码数组
    const pageNumbers = computed(() => {
      const pages = [];
      const total = totalPages.value;
      const current = currentPage.value;
      
      // 生成页码，最多显示7个页码
      let start = Math.max(1, current - 3);
      let end = Math.min(total, start + 6);
      
      // 如果末尾页码不足7个，向前补
      if (end - start + 1 < 7) {
        start = Math.max(1, end - 6);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      return pages;
    });
    
    // 加载诗词列表
    const loadPoems = async () => {
      try {
        // 在实际项目中，这里应该调用API获取数据
        // const response = await request.get('/api/poems', {
        //   params: {
        //     keyword: filters.value.keyword,
        //     dynasty: filters.value.dynasty,
        //     author: filters.value.author,
        //     tags: filters.value.tags.join(','),
        //     sort: filters.value.sort,
        //     page: currentPage.value,
        //     pageSize: pageSize.value
        //   }
        // });
        // 
        // poems.value = response.data.items;
        // totalCount.value = response.data.total;
        
        // 模拟筛选功能
        let filtered = [...poems.value];
        
        // 关键词筛选
        if (filters.value.keyword) {
          const keyword = filters.value.keyword.toLowerCase();
          filtered = filtered.filter(poem => 
            poem.title.toLowerCase().includes(keyword) || 
            poem.content.toLowerCase().includes(keyword)
          );
        }
        
        // 朝代筛选
        if (filters.value.dynasty) {
          filtered = filtered.filter(poem => poem.dynasty === filters.value.dynasty);
        }
        
        // 作者筛选
        if (filters.value.author) {
          filtered = filtered.filter(poem => poem.author.includes(filters.value.author));
        }
        
        // 标签筛选
        if (filters.value.tags.length > 0) {
          filtered = filtered.filter(poem => 
            filters.value.tags.some(tag => poem.tags.includes(tag))
          );
        }
        
        // 排序
        if (filters.value.sort === 'latest') {
          filtered = filtered.sort((a, b) => b.id - a.id);
        } else if (filters.value.sort === 'oldest') {
          // 这里简单按ID升序，可以根据实际朝代顺序排序
          filtered = filtered.sort((a, b) => a.id - b.id);
        }
        
        // 分页
        const startIndex = (currentPage.value - 1) * pageSize.value;
        const endIndex = startIndex + pageSize.value;
        
        poems.value = filtered.slice(startIndex, endIndex);
        totalCount.value = filtered.length;
        
      } catch (error) {
        console.error('加载诗词列表失败:', error);
        toast.error('加载诗词列表失败，请稍后重试');
      }
    };
    
    // 更新筛选条件
    const updateFilter = (key, value) => {
      filters.value[key] = value;
      currentPage.value = 1; // 重置到第一页
      loadPoems();
      updateRouteQuery();
    };
    
    // 切换标签选择
    const toggleTag = (tagName) => {
      const index = filters.value.tags.indexOf(tagName);
      if (index > -1) {
        filters.value.tags.splice(index, 1);
      } else {
        filters.value.tags.push(tagName);
      }
      currentPage.value = 1;
      loadPoems();
      updateRouteQuery();
    };
    
    // 处理关键词搜索
    const handleKeywordSearch = () => {
      // 防抖处理
      clearTimeout(window.keywordSearchTimeout);
      window.keywordSearchTimeout = setTimeout(() => {
        currentPage.value = 1;
        loadPoems();
        updateRouteQuery();
      }, 500);
    };
    
    // 清除关键词
    const clearKeyword = () => {
      filters.value.keyword = '';
      currentPage.value = 1;
      loadPoems();
      updateRouteQuery();
    };
    
    // 处理作者搜索
    const handleAuthorSearch = () => {
      // 根据输入过滤作者建议
      if (filters.value.author.trim()) {
        const input = filters.value.author.toLowerCase();
        authorSuggestions.value = mockAuthors.filter(author => 
          author.toLowerCase().includes(input)
        );
      } else {
        authorSuggestions.value = [];
      }
    };
    
    // 选择作者
    const selectAuthor = (author) => {
      filters.value.author = author;
      authorSuggestions.value = [];
      currentPage.value = 1;
      loadPoems();
      updateRouteQuery();
    };
    
    // 处理排序变更
    const handleSortChange = () => {
      currentPage.value = 1;
      loadPoems();
      updateRouteQuery();
    };
    
    // 重置筛选条件
    const resetFilters = () => {
      filters.value = {
        keyword: '',
        dynasty: '',
        author: '',
        tags: [],
        sort: 'popular'
      };
      currentPage.value = 1;
      authorSuggestions.value = [];
      loadPoems();
      updateRouteQuery();
    };
    
    // 移除特定筛选条件
    const removeFilter = (filter) => {
      if (filter.startsWith('关键词:')) {
        filters.value.keyword = '';
      } else if (filter.startsWith('朝代:')) {
        filters.value.dynasty = '';
      } else if (filter.startsWith('作者:')) {
        filters.value.author = '';
      } else {
        // 移除标签
        const index = filters.value.tags.indexOf(filter);
        if (index > -1) {
          filters.value.tags.splice(index, 1);
        }
      }
      currentPage.value = 1;
      loadPoems();
      updateRouteQuery();
    };
    
    // 切换页码
    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        loadPoems();
        updateRouteQuery();
        
        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    
    // 更新路由查询参数
    const updateRouteQuery = () => {
      const query = {
        ...filters.value,
        page: currentPage.value
      };
      
      // 移除空值
      Object.keys(query).forEach(key => {
        if (!query[key] || (Array.isArray(query[key]) && query[key].length === 0)) {
          delete query[key];
        }
      });
      
      router.replace({ query });
    };
    
    // 从路由参数初始化筛选条件
    const initFiltersFromRoute = () => {
      const query = route.query;
      
      if (query.keyword) filters.value.keyword = query.keyword;
      if (query.dynasty) filters.value.dynasty = query.dynasty;
      if (query.author) filters.value.author = query.author;
      if (query.tags) {
        filters.value.tags = Array.isArray(query.tags) ? query.tags : [query.tags];
      }
      if (query.sort) filters.value.sort = query.sort;
      if (query.page) currentPage.value = parseInt(query.page);
    };
    
    // 监听路由变化
    watch(() => route.query, () => {
      initFiltersFromRoute();
      loadPoems();
    }, { deep: true });
    
    onMounted(() => {
      // 从路由初始化筛选条件
      initFiltersFromRoute();
      
      // 加载诗词列表
      loadPoems();
      
      // 设置页面标题
      document.title = '诗词列表 - 诗词赏析';
    });
    
    return {
      poems,
      filters,
      currentPage,
      pageSize,
      totalCount,
      dynasties,
      allTags,
      selectedTags,
      authorSuggestions,
      activeFilters,
      totalPages,
      pageNumbers,
      updateFilter,
      toggleTag,
      handleKeywordSearch,
      clearKeyword,
      handleAuthorSearch,
      selectAuthor,
      handleSortChange,
      resetFilters,
      removeFilter,
      changePage
    };
  }
});
</script>

<style scoped>
.poem-list-page {
  @apply bg-gray-50 dark:bg-gray-900 min-h-screen;
}

.page-header {
  @apply bg-white dark:bg-gray-800 py-6 border-b border-gray-200 dark:border-gray-700;
}

.filter-sidebar {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6;
}

.filter-section {
  @apply mb-6;
}

.result-stats {
  @apply mb-6 text-gray-600 dark:text-gray-400;
}

.empty-state {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center;
}

.pagination {
  @apply mt-10 flex justify-center;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .lg\:flex-row {
    flex-direction: column;
  }
  
  .lg\:w-1\/4 {
    @apply w-full;
  }
  
  .lg\:w-3\/4 {
    @apply w-full;
  }
  
  .filter-sidebar {
    @apply sticky top-0;
  }
}

@media (max-width: 640px) {
  .md\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
  
  .page-header h1 {
    @apply text-2xl;
  }
  
  .filter-sidebar h3 {
    @apply text-lg;
  }
  
  .filter-sidebar h4 {
    @apply text-base;
  }
}
</style>