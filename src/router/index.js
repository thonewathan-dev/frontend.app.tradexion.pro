import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: false, title: 'Home' },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false, title: 'Login', transition: 'auth' },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { requiresAuth: false, title: 'Register', transition: 'auth' },
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: () => import('../views/AuthCallback.vue'),
    meta: { requiresAuth: false, title: 'Auth' },
  },
  {
    path: '/spot',
    name: 'Spot',
    component: () => import('../views/Spot.vue'),
    meta: { requiresAuth: true, title: 'Spot' },
  },
  {
    path: '/kline',
    name: 'Kline',
    component: () => import('../views/Kline.vue'),
    meta: { requiresAuth: false, title: 'Kline' },
  },
  {
    path: '/contracts',
    name: 'Contracts',
    component: () => import('../views/Contracts.vue'),
    meta: { requiresAuth: true, title: 'Contracts' },
  },
  {
    path: '/staking',
    name: 'Staking',
    component: () => import('../views/Staking.vue'),
    meta: { requiresAuth: true, title: 'Staking' },
  },
  {
    path: '/assets',
    name: 'Assets',
    component: () => import('../views/Assets.vue'),
    meta: { requiresAuth: true, title: 'Assets' },
  },
  {
    path: '/deposit',
    name: 'Deposit',
    component: () => import('../views/Deposit.vue'),
    meta: { requiresAuth: true, title: 'Deposit' },
  },
  {
    path: '/flash-exchange',
    name: 'FlashExchange',
    component: () => import('../views/FlashExchange.vue'),
    meta: { requiresAuth: true, title: 'Flash Exchange' },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true, title: 'Profile' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // If route requires auth and we have a token but no user, try to fetch user
  if (to.meta.requiresAuth && authStore.accessToken && !authStore.user) {
    await authStore.fetchCurrentUser();
  }
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

router.afterEach((to) => {
  const base = 'TradeXion';
  const title = typeof to.meta?.title === 'function' ? to.meta.title(to) : to.meta?.title;
  document.title = title ? `${base} | ${title}` : base;
});

export default router;
