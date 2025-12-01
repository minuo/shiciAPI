/**
 * 路由配置
 */
import { createRouter, createWebHistory } from 'vue-router';
import { isLoggedIn } from '../utils/auth';

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: '首页 - 古诗词赏析',
      requiresAuth: false
    }
  },
  {
    path: '/poems',
    name: 'PoemList',
    component: () => import('../views/PoemList.vue'),
    meta: {
      title: '诗词列表 - 古诗词赏析',
      requiresAuth: false
    }
  },
  {
    path: '/poem/:id',
    name: 'PoemDetail',
    component: () => import('../views/PoemDetail.vue'),
    meta: {
      title: '诗词详情 - 古诗词赏析',
      requiresAuth: false
    },
    props: true
  },
  {
    path: '/tags/:name',
    name: 'TagDetail',
    component: () => import('../views/TagDetail.vue'),
    meta: {
      title: '标签详情 - 古诗词赏析',
      requiresAuth: false
    },
    props: true
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: {
      title: '登录/注册 - 古诗词赏析',
      requiresAuth: false,
      redirectIfLoggedIn: true
    }
  },
  {
    // 404页面
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: {
      title: '页面未找到 - 古诗词赏析',
      requiresAuth: false
    }
  }
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  }
});

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || '古诗词赏析';
  
  // 检查是否需要登录
  if (to.meta.requiresAuth && !isLoggedIn()) {
    // 未登录则重定向到登录页
    return next({
      path: '/login',
      query: { redirect: to.fullPath }
    });
  }
  
  // 如果已登录且访问登录页，则重定向到首页
  if (to.meta.redirectIfLoggedIn && isLoggedIn()) {
    return next({ path: '/' });
  }
  
  next();
});

export default router;