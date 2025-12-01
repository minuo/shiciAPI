<template>
  <div class="tag-detail-page">
    <!-- 页面头部 -->
    <div class="page-header bg-gradient-to-r from-primary/90 to-accent/90 text-white py-16">
      <div class="container mx-auto px-4">
        <nav class="text-sm mb-4 text-white/90" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-2">
            <li><router-link to="/" class="hover:text-white transition-colors">首页</router-link></li>
            <li><span class="mx-2">/</span></li>
            <li><router-link to="/poems" class="hover:text-white transition-colors">诗词列表</router-link></li>
            <li><span class="mx-2">/</span></li>
            <li class="text-white font-medium">{{ decodeURIComponent(tagName) }}</li>
          </ol>
        </nav>
        <h1 class="text-4xl md:text-5xl font-serif font-bold mb-4">"{{ decodeURIComponent(tagName) }}" 主题诗词</h1>
        <div class="flex flex-wrap items-center gap-4 text-white/90">
          <span>{{ poems.length }} 首诗词</span>
          <span>·</span>
          <span>{{ totalViews }} 次阅读</span>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="container mx-auto px-4 py-8">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- 左侧：标签信息和诗词列表 -->
        <main class="lg:w-3/4">
          <!-- 标签信息卡片 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 md:p-8 mb-8">
            <div class="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
              <div class="tag-badge bg-primary/10 text-primary px-6 py-3 rounded-full text-xl font-medium">
                {{ decodeURIComponent(tagName) }}
              </div>
              <button 
                v-if="isAuthenticated" 
                class="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg transition-colors ml-auto"
                @click="handleFollowTag"
              >
                {{ isFollowing ? '已关注' : '关注标签' }}
              </button>
            </div>
            <div class="tag-description text-gray-600 dark:text-gray-400 leading-relaxed">
              {{ tagDescription }}
            </div>
          </div>

          <!-- 筛选和排序 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div class="flex flex-wrap gap-2">
                <button 
                  v-for="dynasty in popularDynasties" 
                  :key="dynasty"
                  class="px-3 py-1.5 rounded-full text-sm transition-colors"
                  :class="{ 
                    'bg-primary text-white': selectedDynasty === dynasty,
                    'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600': selectedDynasty !== dynasty
                  }"
                  @click="selectDynasty(dynasty)"
                >
                  {{ dynasty }}
                </button>
              </div>
              <div class="w-full md:w-auto">
                <select
                  v-model="sortBy"
                  class="w-full md:w-auto px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  @change="handleSortChange"
                >
                  <option value="popular">按热度排序</option>
                  <option value="latest">最新添加</option>
                  <option value="oldest">按朝代排序</option>
                </select>
              </div>
            </div>
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
          <div v-else class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <svg class="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-2">暂无符合条件的诗词</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">请尝试调整筛选条件</p>
            <button class="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-lg transition-colors" @click="resetFilters">
              重置筛选
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

        <!-- 右侧：相关信息 -->
        <aside class="lg:w-1/4">
          <!-- 热门作者 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">热门作者</h3>
            <div class="space-y-4">
              <div 
                v-for="author in popularAuthors" 
                :key="author.name"
                class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                @click="navigateToAuthor(author.name)"
              >
                <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">
                  {{ author.name.charAt(0) }}
                </div>
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900 dark:text-white">{{ author.name }}</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ author.poemCount }} 首诗词</p>
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-500">
                  {{ author.dynasty }}
                </div>
              </div>
            </div>
          </div>

          <!-- 相关标签 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">相关标签</h3>
            <div class="flex flex-wrap gap-2">
              <TagItem
                v-for="tag in relatedTags"
                :key="tag.name"
                :name="tag.name"
                :count="tag.count"
                :link="`/tag/${encodeURIComponent(tag.name)}`"
                type="secondary"
              />
            </div>
          </div>

          <!-- 标签统计 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">标签统计</h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400">诗词总数</span>
                <span class="font-medium text-gray-900 dark:text-white">{{ totalPoems }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400">阅读总量</span>
                <span class="font-medium text-gray-900 dark:text-white">{{ totalViews }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400">朝代分布</span>
                <span class="font-medium text-gray-900 dark:text-white">{{ dynastyCount }} 个</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400">作者数量</span>
                <span class="font-medium text-gray-900 dark:text-white">{{ authorCount }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400">关注人数</span>
                <span class="font-medium text-gray-900 dark:text-white">{{ followerCount }}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Card from '../components/Card.vue';
import TagItem from '../components/TagItem.vue';
import { request } from '../utils';
import { toast } from '../utils/toast';
import { isLoggedIn } from '../utils/auth';

export default defineComponent({
  name: 'TagDetail',
  components: {
    Card,
    TagItem
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    
    // 标签名称
    const tagName = computed(() => route.params.name || '');
    
    // 诗词列表
    const poems = ref([]);
    
    // 分页信息
    const currentPage = ref(1);
    const pageSize = ref(12);
    const totalCount = ref(0);
    
    // 筛选条件
    const selectedDynasty = ref('');
    const sortBy = ref('popular');
    
    // 标签相关数据
    const tagDescription = ref('');
    const popularDynasties = ref([]);
    const popularAuthors = ref([]);
    const relatedTags = ref([]);
    
    // 统计数据
    const totalPoems = ref(0);
    const totalViews = ref(0);
    const dynastyCount = ref(0);
    const authorCount = ref(0);
    const followerCount = ref(0);
    
    // 用户交互状态
    const isAuthenticated = computed(() => isLoggedIn());
    const isFollowing = ref(false);
    
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
    
    // 加载标签详情
    const loadTagDetail = async () => {
      if (!tagName.value) return;
      
      try {
        // 在实际项目中，这里应该调用API获取数据
        // const response = await request.get(`/api/tags/${encodeURIComponent(tagName.value)}`);
        // const data = response.data;
        
        // 模拟数据
        const mockData = {
          name: decodeURIComponent(tagName.value),
          description: `"${decodeURIComponent(tagName.value)}"是中国古典诗词中的常见主题，包含了丰富的文化内涵和艺术价值。这个主题下的诗词作品反映了古人对生活、自然、情感的独特见解和表达方式。`,
          poems: [
            {
              id: 1,
              title: '静夜思',
              author: '李白',
              dynasty: '唐代',
              content: '床前明月光，疑是地上霜。\n举头望明月，低头思故乡。',
              tags: ['思乡', '月亮', '夜晚'],
              views: 12800,
              likes: 3256
            },
            {
              id: 3,
              title: '春望',
              author: '杜甫',
              dynasty: '唐代',
              content: '国破山河在，城春草木深。\n感时花溅泪，恨别鸟惊心。\n烽火连三月，家书抵万金。\n白头搔更短，浑欲不胜簪。',
              tags: ['思乡', '春天', '战争'],
              views: 8900,
              likes: 2103
            },
            {
              id: 5,
              title: '春晓',
              author: '孟浩然',
              dynasty: '唐代',
              content: '春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。',
              tags: ['春天', '早晨', '惜春'],
              views: 10200,
              likes: 2876
            },
            {
              id: 7,
              title: '望天门山',
              author: '李白',
              dynasty: '唐代',
              content: '天门中断楚江开，碧水东流至此回。\n两岸青山相对出，孤帆一片日边来。',
              tags: ['山水', '长江', '自然风光'],
              views: 7600,
              likes: 1890
            },
            {
              id: 9,
              title: '枫桥夜泊',
              author: '张继',
              dynasty: '唐代',
              content: '月落乌啼霜满天，江枫渔火对愁眠。\n姑苏城外寒山寺，夜半钟声到客船。',
              tags: ['夜晚', '思乡', '秋夜'],
              views: 9300,
              likes: 2450
            },
            {
              id: 11,
              title: '送元二使安西',
              author: '王维',
              dynasty: '唐代',
              content: '渭城朝雨浥轻尘，客舍青青柳色新。\n劝君更尽一杯酒，西出阳关无故人。',
              tags: ['送别', '友情', '春天'],
              views: 8700,
              likes: 2200
            }
          ],
          popularDynasties: ['唐代', '宋代', '元代', '明代', '清代'],
          popularAuthors: [
            { name: '李白', poemCount: 128, dynasty: '唐代' },
            { name: '杜甫', poemCount: 105, dynasty: '唐代' },
            { name: '苏轼', poemCount: 97, dynasty: '宋代' },
            { name: '陆游', poemCount: 89, dynasty: '宋代' },
            { name: '白居易', poemCount: 85, dynasty: '唐代' }
          ],
          relatedTags: [
            { name: '思乡怀人', count: 328 },
            { name: '山水田园', count: 296 },
            { name: '咏史怀古', count: 245 },
            { name: '边塞战争', count: 198 },
            { name: '爱情闺怨', count: 176 },
            { name: '风花雪月', count: 165 },
            { name: '春夏秋冬', count: 142 }
          ],
          statistics: {
            totalPoems: 528,
            totalViews: 1258000,
            dynastyCount: 8,
            authorCount: 136,
            followerCount: 2845
          }
        };
        
        // 更新数据
        tagDescription.value = mockData.description;
        popularDynasties.value = mockData.popularDynasties;
        popularAuthors.value = mockData.popularAuthors;
        relatedTags.value = mockData.relatedTags;
        
        // 更新统计数据
        totalPoems.value = mockData.statistics.totalPoems;
        totalViews.value = mockData.statistics.totalViews;
        dynastyCount.value = mockData.statistics.dynastyCount;
        authorCount.value = mockData.statistics.authorCount;
        followerCount.value = mockData.statistics.followerCount;
        
        // 加载诗词列表
        poems.value = mockData.poems;
        totalCount.value = mockData.poems.length;
        
        // 设置页面标题
        document.title = `"${decodeURIComponent(tagName.value)}" 主题诗词 - 诗词赏析`;
        
      } catch (error) {
        console.error('加载标签详情失败:', error);
        toast.error('加载标签详情失败，请稍后重试');
      }
    };
    
    // 加载标签下的诗词
    const loadTagPoems = async () => {
      if (!tagName.value) return;
      
      try {
        // 在实际项目中，这里应该调用API获取数据
        // const response = await request.get(`/api/tags/${encodeURIComponent(tagName.value)}/poems`, {
        //   params: {
        //     dynasty: selectedDynasty.value,
        //     sort: sortBy.value,
        //     page: currentPage.value,
        //     pageSize: pageSize.value
        //   }
        // });
        // 
        // poems.value = response.data.items;
        // totalCount.value = response.data.total;
        
        // 模拟筛选和排序
        let filteredPoems = [
          {
            id: 1,
            title: '静夜思',
            author: '李白',
            dynasty: '唐代',
            content: '床前明月光，疑是地上霜。\n举头望明月，低头思故乡。',
            tags: ['思乡', '月亮', '夜晚'],
            views: 12800,
            likes: 3256
          },
          {
            id: 3,
            title: '春望',
            author: '杜甫',
            dynasty: '唐代',
            content: '国破山河在，城春草木深。\n感时花溅泪，恨别鸟惊心。\n烽火连三月，家书抵万金。\n白头搔更短，浑欲不胜簪。',
            tags: ['思乡', '春天', '战争'],
            views: 8900,
            likes: 2103
          },
          {
            id: 5,
            title: '春晓',
            author: '孟浩然',
            dynasty: '唐代',
            content: '春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。',
            tags: ['春天', '早晨', '惜春'],
            views: 10200,
            likes: 2876
          },
          {
            id: 7,
            title: '望天门山',
            author: '李白',
            dynasty: '唐代',
            content: '天门中断楚江开，碧水东流至此回。\n两岸青山相对出，孤帆一片日边来。',
            tags: ['山水', '长江', '自然风光'],
            views: 7600,
            likes: 1890
          },
          {
            id: 9,
            title: '枫桥夜泊',
            author: '张继',
            dynasty: '唐代',
            content: '月落乌啼霜满天，江枫渔火对愁眠。\n姑苏城外寒山寺，夜半钟声到客船。',
            tags: ['夜晚', '思乡', '秋夜'],
            views: 9300,
            likes: 2450
          },
          {
            id: 11,
            title: '送元二使安西',
            author: '王维',
            dynasty: '唐代',
            content: '渭城朝雨浥轻尘，客舍青青柳色新。\n劝君更尽一杯酒，西出阳关无故人。',
            tags: ['送别', '友情', '春天'],
            views: 8700,
            likes: 2200
          }
        ];
        
        // 朝代筛选
        if (selectedDynasty.value) {
          filteredPoems = filteredPoems.filter(poem => poem.dynasty === selectedDynasty.value);
        }
        
        // 排序
        if (sortBy.value === 'latest') {
          filteredPoems = filteredPoems.sort((a, b) => b.id - a.id);
        } else if (sortBy.value === 'oldest') {
          filteredPoems = filteredPoems.sort((a, b) => a.id - b.id);
        } else {
          // 按热度排序（默认）
          filteredPoems = filteredPoems.sort((a, b) => b.views - a.views);
        }
        
        // 分页
        const startIndex = (currentPage.value - 1) * pageSize.value;
        const endIndex = startIndex + pageSize.value;
        
        poems.value = filteredPoems.slice(startIndex, endIndex);
        totalCount.value = filteredPoems.length;
        
      } catch (error) {
        console.error('加载标签诗词失败:', error);
        toast.error('加载诗词列表失败，请稍后重试');
      }
    };
    
    // 选择朝代
    const selectDynasty = (dynasty) => {
      selectedDynasty.value = selectedDynasty.value === dynasty ? '' : dynasty;
      currentPage.value = 1;
      loadTagPoems();
    };
    
    // 处理排序变更
    const handleSortChange = () => {
      currentPage.value = 1;
      loadTagPoems();
    };
    
    // 重置筛选
    const resetFilters = () => {
      selectedDynasty.value = '';
      sortBy.value = 'popular';
      currentPage.value = 1;
      loadTagPoems();
    };
    
    // 切换页码
    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        loadTagPoems();
        
        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    
    // 关注标签
    const handleFollowTag = async () => {
      if (!isAuthenticated.value) {
        router.push('/login');
        return;
      }
      
      try {
        // 在实际项目中，这里应该调用API
        // await request.post(`/api/tags/${encodeURIComponent(tagName.value)}/follow`);
        
        // 模拟关注
        isFollowing.value = !isFollowing.value;
        followerCount.value += isFollowing.value ? 1 : -1;
        toast.success(isFollowing.value ? '关注成功' : '已取消关注');
        
      } catch (error) {
        console.error('关注标签失败:', error);
        toast.error('操作失败，请稍后重试');
      }
    };
    
    // 导航到作者页面
    const navigateToAuthor = (authorName) => {
      // 在实际项目中，这里应该导航到作者详情页
      console.log('Navigate to author:', authorName);
      toast.info('作者详情页功能正在开发中');
    };
    
    // 监听标签名称变化
    watch(() => tagName.value, () => {
      currentPage.value = 1;
      selectedDynasty.value = '';
      sortBy.value = 'popular';
      loadTagDetail();
    });
    
    onMounted(() => {
      loadTagDetail();
    });
    
    return {
      tagName,
      poems,
      currentPage,
      pageSize,
      totalCount,
      selectedDynasty,
      sortBy,
      tagDescription,
      popularDynasties,
      popularAuthors,
      relatedTags,
      totalPoems,
      totalViews,
      dynastyCount,
      authorCount,
      followerCount,
      isAuthenticated,
      isFollowing,
      totalPages,
      pageNumbers,
      selectDynasty,
      handleSortChange,
      resetFilters,
      changePage,
      handleFollowTag,
      navigateToAuthor,
      decodeURIComponent,
      encodeURIComponent
    };
  }
});
</script>

<style scoped>
.tag-detail-page {
  @apply bg-gray-50 dark:bg-gray-900 min-h-screen;
}

.page-header {
  @apply bg-gradient-to-r from-primary/90 to-accent/90 text-white py-16;
}

.tag-badge {
  @apply bg-primary/10 text-primary px-6 py-3 rounded-full text-xl font-medium;
}

.tag-description {
  @apply text-gray-600 dark:text-gray-400 leading-relaxed;
}

.pagination {
  @apply mt-10 flex justify-center;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .lg\:flex-row {
    flex-direction: column;
  }
  
  .lg\:w-3\/4 {
    @apply w-full;
  }
  
  .lg\:w-1\/4 {
    @apply w-full;
  }
}

@media (max-width: 640px) {
  .page-header h1 {
    @apply text-3xl;
  }
  
  .flex.flex-col.md\:flex-row.justify-between {
    flex-direction: column;
    gap: 1rem;
  }
  
  .md\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>