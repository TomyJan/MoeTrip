import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import OrderDetail from '../views/OrderDetail.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    redirect: '/attractions',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
  },
  {
    path: '/attractions',
    name: 'Attractions',
    component: () => import('../views/Attractions.vue'),
  },
  {
    path: '/attractions/:id',
    name: 'AttractionDetail',
    component: () => import('../views/AttractionDetail.vue'),
  },
  {
    path: '/ticket/buy',
    name: 'TicketBuy',
    component: () => import('../views/TicketBuy.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: () => import('../views/UserProfile.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/feedback',
    name: 'AdminFeedback',
    component: () => import('../views/Feedback.vue'),
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('../views/AdminUsers.vue'),
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin/attractions',
    name: 'AdminAttractions',
    component: () => import('../views/AdminAttractions.vue'),
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin/facilities',
    name: 'AdminFacilities',
    component: () => import('../views/AdminFacilities.vue'),
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin/tickets',
    name: 'AdminTickets',
    component: () => import('../views/AdminTickets.vue'),
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin/orders',
    name: 'AdminOrders',
    component: () => import('../views/AdminOrders.vue'),
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin/logs',
    name: 'AdminLogs',
    component: () => import('../views/AdminLogs.vue'),
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin/settings',
    name: 'AdminSettings',
    component: () => import('../views/AdminSettings.vue'),
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/Admin.vue'),
    meta: { requiresAdmin: true },
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: OrderDetail,
    meta: {
      requiresAuth: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 导航守卫，用于检查用户是否已登录和是否有管理员权限
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  console.log('Navigation guard:', to.path);
  console.log('Auth status:', { token, userRole });
  console.log('Route meta:', to.meta);

  // 检查localStorage中有token但实际可能已经过期或无效的情况
  if (token) {
    // 直接从localStorage检查用户信息完整性
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');

    // 如果token存在但其他用户信息不完整，判断为登录状态失效
    if (!userId || !username) {
      // 清除localStorage中的用户信息
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('userRole');

      // 如果访问的是需要权限的页面，则重定向到登录页
      if (to.meta.requiresAuth || to.meta.requiresAdmin) {
        return next({ name: 'Login' });
      }
    }
  }

  if (to.meta.requiresAdmin && userRole !== 'admin') {
    console.log('Redirecting: admin required');
    next({ name: 'Login' });
  } else if (to.meta.requiresAuth && !token) {
    console.log('Redirecting: auth required');
    next({ name: 'Login' });
  } else {
    console.log('Navigation allowed');
    next();
  }
});

export default router;
