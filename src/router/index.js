import { createRouter, createWebHistory } from 'vue-router';
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';

// Global route loading state so we can show a loader while pages change
export const isRouteLoading = ref(false);

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
    path: '/spot-account',
    name: 'SpotAccount',
    component: () => import('../views/SpotAccount.vue'),
    meta: { requiresAuth: true, title: 'Spot Account' },
  },
  {
    path: '/contract-account',
    name: 'ContractAccount',
    component: () => import('../views/ContractAccount.vue'),
    meta: { requiresAuth: true, title: 'Contract Account' },
  },
  {
    path: '/deposit',
    name: 'Deposit',
    component: () => import('../views/Deposit.vue'),
    meta: { requiresAuth: true, title: 'Deposit' },
  },
  {
    path: '/withdraw',
    name: 'Withdraw',
    component: () => import('../views/Withdraw.vue'),
    meta: { requiresAuth: true, title: 'Withdraw' },
  },
  {
    path: '/transfer',
    name: 'Transfer',
    component: () => import('../views/Transfer.vue'),
    meta: { requiresAuth: true, title: 'Transfer' },
  },
  {
    path: '/flash-exchange',
    name: 'FlashExchange',
    component: () => import('../views/FlashExchange.vue'),
    meta: { requiresAuth: true, title: 'Flash Exchange' },
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: () => import('../views/ChangePassword.vue'),
    meta: { requiresAuth: true, title: 'Modify Password' },
  },
  {
    path: '/about-tradexion',
    name: 'AboutTradeXion',
    component: () => import('../views/AboutTradeXion.vue'),
    meta: { requiresAuth: true, title: 'About TradeXion' },
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('../views/Chat.vue'),
    meta: { requiresAuth: true, title: 'Customer Support' },
  },
  {
    path: '/privacy-policy',
    name: 'PrivacyPolicy',
    component: () => import('../views/PrivacyPolicy.vue'),
    meta: { requiresAuth: false, title: 'Privacy Policy' },
  },
  {
    path: '/terms-of-service',
    name: 'TermsOfService',
    component: () => import('../views/TermsOfService.vue'),
    meta: { requiresAuth: false, title: 'Terms of Service' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  isRouteLoading.value = true;
  
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
  isRouteLoading.value = false;
  const base = 'TradeXion';
  const title = typeof to.meta?.title === 'function' ? to.meta.title(to) : to.meta?.title;
  document.title = title ? `${base} | ${title}` : base;
});

// Ensure loader is cleared even if navigation errors
router.onError((err) => {
  console.error('Router error:', err);
  isRouteLoading.value = false;
});

export default router;
