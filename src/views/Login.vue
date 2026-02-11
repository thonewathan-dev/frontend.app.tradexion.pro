<template>
  <div class="min-h-[100dvh] overflow-hidden text-white flex flex-col">
    <!-- Top bar -->
    <div class="sticky top-0 z-10 bg-[#181A20] border-b border-gray-800">
      <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-2 group">
          <img :src="logoMarkUrl" alt="TrustXGlobal" class="w-7 h-7 object-contain" />
          <span class="font-semibold tracking-tight text-white group-hover:text-binance-yellow transition-colors">TrustXGlobal</span>
        </router-link>
        <router-link
          to="/register"
          class="px-4 py-1.5 rounded-full text-sm font-bold bg-binance-yellow text-binance-black hover:bg-opacity-90 transition-colors shadow-lg shadow-binance-yellow/10"
        >
          {{ t('auth.register') }}
        </router-link>
      </div>
    </div>

    <div class="flex-1 max-w-5xl mx-auto w-full px-4 pt-6 pb-8 md:pt-10 md:pb-10 md:flex md:items-center">
      <div class="grid md:grid-cols-2 gap-6 md:gap-10 items-start w-full">
        <!-- Desktop left panel (market preview like the reference) -->
        <div class="hidden md:block">
          <AuthMarketPanel />
        </div>

        <!-- Right: login form -->
        <div class="min-w-0">
          <h1 class="text-2xl md:text-3xl font-bold tracking-tight mb-3 text-white">Log In</h1>

      <!-- Title removed tabs -->
      <div class="mb-4">
        <h2 class="text-sm font-bold text-white border-b-2 border-binance-yellow pb-2 w-fit">Email Login</h2>
      </div>

      <!-- Alerts shown via top Toast -->

      <!-- Card -->
      <div class="glass-card-no-hover rounded-xl border border-white/10 p-4 bg-white/[0.02]">
        <!-- EMAIL ONLY MODE -->
        <form @submit.prevent="onPrimaryAction" class="space-y-2.5">
          <!-- Step 1: identifier -->
          <div v-if="step === 'identifier'" class="space-y-2.5">
            <label class="block text-xs text-white/70 font-medium">Email</label>
            <input
              v-model.trim="email"
              type="email"
              autocomplete="email"
              class="w-full px-4 py-3 text-sm rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-binance-yellow/40 transition-all focus:bg-white/10"
              placeholder="Email"
              required
            />

            <button
              type="submit"
              :disabled="loading || !canGoNext"
              class="w-full py-2.5 text-sm rounded-full font-bold bg-binance-yellow text-binance-black hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-binance-yellow/10"
            >
              Next
            </button>
          </div>

          <!-- Step 2: password -->
          <div v-else class="space-y-2.5">
            <div class="flex items-center gap-2 mb-1.5">
              <button
                type="button"
                class="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                @click="backToIdentifier"
                aria-label="Back"
              >
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <div class="flex-1 text-center text-xs font-semibold text-white truncate px-2">Log In</div>
              <div class="w-7"></div>
            </div>

            <label class="block text-xs text-white/70 font-medium">Email</label>
            <input
              :value="email"
              type="email"
              autocomplete="email"
              readonly
              class="w-full px-4 py-3 text-sm rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:bg-white/10"
            />

            <label class="block text-xs text-white/70 font-medium">Password</label>
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              class="w-full px-4 py-3 text-sm rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-binance-yellow/40 transition-all focus:bg-white/10"
              placeholder="Password"
              required
            />

            <div class="flex justify-end">
              <router-link to="/forgot-password" class="text-xs font-semibold text-gray-400 hover:text-white">
                Forgot password
              </router-link>
            </div>


            <!-- Submit Button (captcha removed from here) -->
            <button
              type="submit"
              :disabled="loading || !password"
              class="w-full py-2.5 text-sm rounded-full font-bold bg-binance-yellow text-binance-black hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-binance-yellow/10"
            >
              {{ loading ? t('auth.loggingIn') : 'Log In' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Divider -->
      <div class="my-3 flex items-center gap-3">
        <div class="h-px flex-1 bg-gray-700"></div>
        <div class="text-xs text-white/40">Or</div>
        <div class="h-px flex-1 bg-gray-700"></div>
      </div>

      <!-- Google button -->
      <button
        type="button"
        @click="loginWithGoogle"
        class="w-full py-2.5 text-sm rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-2 font-bold text-white"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      <div class="mt-3 mb-4 mb-safe text-center text-xs text-white/60">
        <router-link to="/register" class="font-bold text-white hover:text-binance-yellow transition-colors">Create a TrustXGlobal Account</router-link>
      </div>
        </div>
      </div>
    </div>

    <SiteFooter />

    <!-- "Invalid user" modal -->
    <div v-if="showInvalidUserModal" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-black/40" @click="showInvalidUserModal = false"></div>
      <div class="relative w-full max-w-sm glass-card-no-hover rounded-xl border border-gray-200 p-4 bg-white shadow-2xl">
        <div class="text-sm text-slate-700 leading-relaxed">
          We can't find this account. Please click "Confirm" to sign up and log in now.
        </div>
        <div class="mt-4 flex gap-3">
          <button
            type="button"
            class="flex-1 py-2.5 rounded-full border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
            @click="showInvalidUserModal = false"
          >
            Cancel
          </button>
          <button
            type="button"
            class="flex-1 py-2.5 rounded-full bg-binance-yellow text-binance-black font-bold shadow-lg shadow-binance-yellow/10"
            @click="goRegisterFromModal"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>

    <!-- Security Verification Modal -->
    <div v-if="showCaptchaModal" class="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeCaptchaModal"></div>
      <div class="relative w-full max-w-sm glass-card-no-hover rounded-2xl border border-white/10 p-6 bg-[#1e2329] shadow-2xl transform transition-all scale-100">
        <button 
          @click="closeCaptchaModal"
          class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h3 class="text-lg font-bold text-white mb-2 text-center">Security Verification</h3>
        <p class="text-sm text-gray-400 mb-6 text-center">Please complete the challenge below to continue.</p>
        
        <div class="flex justify-center min-h-[65px]">
          <div id="turnstile-widget-login"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AuthMarketPanel from '../components/AuthMarketPanel.vue';
import SiteFooter from '../components/SiteFooter.vue';
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/auth';
import { getApiUrl } from '../utils/config.js';

const { t } = useI18n();

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const TURNSTILE_SITE_KEY = '0x4AAAAAACNscU1_JGFhgUPj';
const turnstileWidget = ref(null);
const turnstileToken = ref('');
let turnstileWidgetId = null;

const logoMarkUrl = new URL('../assets/logo/Logo-Only.png', import.meta.url).href;

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const loginMode = ref('email');
const step = ref('identifier'); // 'identifier' | 'password'
const showInvalidUserModal = ref(false);
const showCaptchaModal = ref(false);

const canGoNext = computed(() => {
  const v = email.value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
});

const initTurnstile = () => {
  if (!window.turnstile) return;
  if (turnstileWidgetId) return;
  // Ensure DOM is ready
  nextTick(() => {
    const el = document.getElementById('turnstile-widget-login');
    if (!el) return;
    
    turnstileWidgetId = window.turnstile.render('#turnstile-widget-login', {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token) => {
        turnstileToken.value = token;
        // Auto-submit when captcha is passed
        finishLogin();
      },
      'error-callback': () => {
        turnstileToken.value = '';
      },
      'expired-callback': () => {
        turnstileToken.value = '';
      },
    });
  });
};

const resetTurnstile = () => {
  if (turnstileWidgetId && window.turnstile) {
    window.turnstile.reset(turnstileWidgetId);
  }
  turnstileToken.value = '';
};

const removeTurnstile = () => {
  if (turnstileWidgetId && window.turnstile) {
    window.turnstile.remove(turnstileWidgetId);
  }
  turnstileWidgetId = null;
  turnstileToken.value = '';
};

onMounted(() => {
  const emailParam = route.query.email;
  if (emailParam && typeof emailParam === 'string') {
    email.value = emailParam;
  }
});

onUnmounted(() => {
  removeTurnstile();
});

const backToIdentifier = () => {
  step.value = 'identifier';
  password.value = '';
  error.value = '';
  showCaptchaModal.value = false;
  removeTurnstile();
};

const onPrimaryAction = async () => {
  if (step.value === 'identifier') {
    error.value = '';
    if (!canGoNext.value) return;
    step.value = 'password';
    return;
  }

  // If on password step, user clicked "Log In"
  // Show Captcha Modal
  openCaptchaModal();
};

const openCaptchaModal = async () => {
  if (!password.value) return;
  showCaptchaModal.value = true;
  await nextTick();
  // Small delay to ensure transition fits
  setTimeout(initTurnstile, 100);
};

const closeCaptchaModal = () => {
  showCaptchaModal.value = false;
  resetTurnstile();
  removeTurnstile(); // Fully remove so we can re-render fresh
};

const finishLogin = async () => {
  if (!turnstileToken.value) return;

  error.value = '';
  loading.value = true;
  // Keep modal open while loading, or close it? 
  // Better to keep it or show loading state inside it.
  // For now, let's keep it open but show loading.

  const result = await authStore.login(email.value.trim(), password.value, turnstileToken.value);

  if (result.success) {
    closeCaptchaModal();
    router.push('/');
  } else {
    loading.value = false;
    error.value = result.error;
    if (typeof window !== 'undefined' && window.__toast?.error) {
      window.__toast.error(result.error || 'Login failed');
    }
    // Reset captcha on failure so user can try again
    resetTurnstile();
    // Optional: close modal on error
    // closeCaptchaModal(); 
  }
};

const goRegisterFromModal = () => {
  showInvalidUserModal.value = false;
  router.push({ path: '/register', query: { email: email.value.trim() } });
};

const loginWithGoogle = () => {
  const apiUrl = getApiUrl();
  const oauthUrl = apiUrl.endsWith('/api') 
    ? `${apiUrl}/auth/google`
    : `${apiUrl}/api/auth/google`;
  window.location.href = oauthUrl;
};
</script>
