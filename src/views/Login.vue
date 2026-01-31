<template>
  <div class="min-h-[100dvh] overflow-hidden text-white flex flex-col">
    <!-- Top bar -->
    <div class="sticky top-0 z-10 glass-card-no-hover border-b border-white/10">
      <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <img :src="logoMarkUrl" alt="TradeXion" class="w-7 h-7 object-contain" />
          <span class="font-semibold tracking-tight text-white">TradeXion</span>
        </div>
        <router-link
          to="/register"
          class="px-4 py-1.5 rounded-full text-sm font-semibold glass-button-no-hover text-white border border-white/20 hover:border-white/30 transition-colors"
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

      <!-- Tabs -->
      <div class="flex gap-6 text-sm font-semibold mb-3">
        <button
          type="button"
          class="pb-2 border-b-2 transition-colors"
          :class="loginMode === 'email' ? 'border-white text-white' : 'border-transparent text-white/50 hover:text-white/80'"
          @click="setMode('email')"
        >
          Email
        </button>
        <button
          type="button"
          class="pb-2 border-b-2 transition-colors"
          :class="loginMode === 'phone' ? 'border-white text-white' : 'border-transparent text-white/50 hover:text-white/80'"
          @click="setMode('phone')"
        >
          Phone
        </button>
      </div>

      <!-- Alerts shown via top Toast -->

      <!-- Card -->
      <div class="glass-card-no-hover rounded-xl border border-white/12 p-3">
        <!-- EMAIL MODE -->
        <form v-if="loginMode === 'email'" @submit.prevent="onPrimaryAction" class="space-y-2.5">
          <!-- Step 1: identifier -->
          <div v-if="step === 'identifier'" class="space-y-2.5">
            <label class="block text-xs text-white/80 font-medium">Email</label>
            <input
              v-model.trim="email"
              type="email"
              autocomplete="email"
              class="w-full px-3 py-2.5 text-sm glass-input rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              placeholder="Email"
              required
            />

            <button
              type="submit"
              :disabled="loading || !canGoNext"
              class="w-full py-2.5 text-sm rounded-full font-semibold glass-button-no-hover text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
            >
              Next
            </button>
          </div>

          <!-- Step 2: password -->
          <div v-else class="space-y-2.5">
            <div class="flex items-center gap-2 mb-1.5">
              <button
                type="button"
                class="p-1 hover:bg-white/10 rounded-lg transition-colors"
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

            <label class="block text-xs text-white/80 font-medium">Email</label>
            <input
              :value="email"
              type="email"
              autocomplete="email"
              readonly
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-white/5 text-white/80 placeholder-white/40 focus:outline-none"
            />

            <label class="block text-xs text-white/80 font-medium">Password</label>
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              class="w-full px-3 py-2.5 text-sm glass-input rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              placeholder="Password"
              required
            />

            <div class="flex justify-end">
              <router-link to="/forgot-password" class="text-xs font-semibold text-white/80 hover:text-white">
                Forgot password
              </router-link>
            </div>

            <!-- Turnstile only when we actually submit credentials -->
            <div class="flex justify-center pt-1">
              <div v-show="step === 'password'" ref="turnstileWidget" id="turnstile-widget-login"></div>
            </div>

            <button
              type="submit"
              :disabled="loading || !turnstileToken || !password"
              class="w-full py-2.5 text-sm rounded-full font-semibold glass-button-no-hover text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
            >
              {{ loading ? t('auth.loggingIn') : 'Log In' }}
            </button>
          </div>
        </form>

        <!-- PHONE MODE -->
        <form v-else @submit.prevent="handlePhoneLogin" class="space-y-2.5">
          <label class="block text-xs text-white/80 font-medium">Phone</label>
          <div class="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-white/20 focus-within:border-white/25">
            <div class="text-white/70 text-sm font-semibold">+</div>
            <input
              v-model.trim="phone"
              type="tel"
              inputmode="tel"
              autocomplete="tel"
              class="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/40"
              placeholder="Enter phone number"
              required
            />
          </div>

          <button
            type="submit"
            :disabled="loading || !phone"
            class="w-full py-2.5 text-sm rounded-full font-semibold glass-button-no-hover text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
          >
            Next
          </button>
        </form>
      </div>

      <!-- Divider -->
      <div class="my-3 flex items-center gap-3">
        <div class="h-px flex-1 bg-white/15"></div>
        <div class="text-xs text-white/60">Or</div>
        <div class="h-px flex-1 bg-white/15"></div>
      </div>

      <!-- Google button -->
      <button
        type="button"
        @click="loginWithGoogle"
        class="w-full py-2.5 text-sm rounded-lg glass-card-no-hover border border-white/12 hover:border-white/20 transition-colors flex items-center justify-center gap-2 font-semibold text-white"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      <div class="mt-3 mb-4 mb-safe text-center text-xs text-white/70">
        <router-link to="/register" class="font-semibold text-white hover:text-white/80">Create a TradeXion Account</router-link>
      </div>
        </div>
      </div>
    </div>

    <SiteFooter />

    <!-- "Invalid user" modal -->
    <div v-if="showInvalidUserModal" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-black/40" @click="showInvalidUserModal = false"></div>
      <div class="relative w-full max-w-sm glass-card-no-hover rounded-xl border border-white/12 p-4">
        <div class="text-sm text-white/80 leading-relaxed">
          We can't find this account. Please click "Confirm" to sign up and log in now.
        </div>
        <div class="mt-4 flex gap-3">
          <button
            type="button"
            class="flex-1 py-2.5 rounded-full border border-white/15 text-white/80 font-semibold hover:bg-white/10"
            @click="showInvalidUserModal = false"
          >
            Cancel
          </button>
          <button
            type="button"
            class="flex-1 py-2.5 rounded-full glass-button-no-hover text-white font-semibold border border-white/20"
            @click="goRegisterFromModal"
          >
            Confirm
          </button>
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
const year = new Date().getFullYear();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
const phone = ref('');

const loginMode = ref('email'); // 'email' | 'phone'
const step = ref('identifier'); // 'identifier' | 'password'
const showInvalidUserModal = ref(false);

const canGoNext = computed(() => {
  const v = email.value.trim();
  // simple, strict-enough email check for UI gating; backend is final authority
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
});


const displayIdentifier = computed(() => {
  const v = email.value.trim();
  if (!v) return '';
  // show a short identifier (like Gate)
  if (v.length <= 22) return v;
  return `${v.slice(0, 10)}…${v.slice(-8)}`;
});

const initTurnstile = () => {
  if (!window.turnstile) return;
  if (turnstileWidgetId) return; // already rendered
  if (step.value !== 'password') return;
  if (!turnstileWidget.value) return;

  turnstileWidgetId = window.turnstile.render('#turnstile-widget-login', {
    sitekey: TURNSTILE_SITE_KEY,
    callback: (token) => {
      turnstileToken.value = token;
    },
    'error-callback': () => {
      turnstileToken.value = '';
    },
    'expired-callback': () => {
      turnstileToken.value = '';
    },
  });
};

const resetTurnstile = () => {
  if (!turnstileWidgetId || !window.turnstile) {
    turnstileToken.value = '';
    return;
  }
  window.turnstile.reset(turnstileWidgetId);
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
  // Prefill email from query params (e.g., from password reset)
  const emailParam = route.query.email;
  if (emailParam && typeof emailParam === 'string') {
    email.value = emailParam;
  }

  // Turnstile is only needed on password step; we still watch for script load
  if (window.turnstile) return;
  const checkTurnstile = setInterval(() => {
    if (window.turnstile) {
      clearInterval(checkTurnstile);
      // if user is already on password step, render now
      nextTick().then(() => initTurnstile());
    }
  }, 100);

  setTimeout(() => {
    clearInterval(checkTurnstile);
  }, 8000);
});

onUnmounted(() => {
  removeTurnstile();
});

watch(
  () => step.value,
  async (v) => {
    if (v !== 'password') {
      removeTurnstile();
      return;
    }
    await nextTick();
    initTurnstile();
  }
);

const setMode = (mode) => {
  loginMode.value = mode;
  error.value = '';
  loading.value = false;
  password.value = '';
  phone.value = '';
  step.value = 'identifier';
  removeTurnstile();
};

const backToIdentifier = () => {
  step.value = 'identifier';
  password.value = '';
  error.value = '';
  removeTurnstile();
};

const onPrimaryAction = async () => {
  if (step.value === 'identifier') {
    error.value = '';
    if (!canGoNext.value) return;
    step.value = 'password';
    await nextTick();
    initTurnstile();
    return;
  }

  await handleLogin();
};

const handleLogin = async () => {
  if (!turnstileToken.value) {
    if (typeof window !== 'undefined' && window.__toast?.error) {
      window.__toast.error('Please complete the CAPTCHA verification');
    }
    return;
  }

  error.value = '';
  loading.value = true;

  const result = await authStore.login(email.value.trim(), password.value, turnstileToken.value);

  if (result.success) {
    resetTurnstile();
    router.push('/');
  } else {
    error.value = result.error;
    if (typeof window !== 'undefined' && window.__toast?.error) {
      window.__toast.error(result.error || 'Login failed');
    }
    // Only show signup modal for specific "account not found" errors, not for wrong password
    // Since backend returns "Invalid credentials" for both cases, we don't show the modal
    // to avoid confusing users who just entered the wrong password
    resetTurnstile();
  }

  loading.value = false;
};

const handlePhoneLogin = async () => {
  // Phone login is disabled - show message like register page
  if (typeof window !== 'undefined' && window.__toast?.info) {
    window.__toast.info('Phone login is not available yet. Please use Email.');
  }
};

const goRegisterFromModal = () => {
  showInvalidUserModal.value = false;
  router.push({ path: '/register', query: { email: email.value.trim() } });
};


const loginWithGoogle = () => {
  // Get API URL from config utility
  const apiUrl = getApiUrl();
  
  // Construct OAuth URL - API URL already includes /api
  const oauthUrl = apiUrl.endsWith('/api') 
    ? `${apiUrl}/auth/google`
    : `${apiUrl}/api/auth/google`;
  
  window.location.href = oauthUrl;
};
</script>
