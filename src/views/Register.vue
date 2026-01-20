<template>
  <div class="min-h-[100dvh] min-h-[100svh] overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
    <!-- Center on desktop + mobile, no page scroll -->
    <div class="min-h-[100dvh] min-h-[100svh] flex items-center justify-center px-4 py-4">
      <div class="w-full max-w-5xl">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <!-- Left (Brand / Info) -->
          <div class="hidden lg:flex glass-card-no-hover rounded-xl p-10 flex-col justify-between relative overflow-hidden">
            <!-- Background icons -->
            <div class="absolute inset-0 pointer-events-none">
              <img
                v-for="(bg, idx) in bgIcons"
                :key="idx"
                :src="bg.src"
                alt=""
                class="absolute object-contain opacity-[0.10] blur-[0.2px]"
                :style="bg.style"
              />
            </div>

            <div class="relative z-10">
              <div class="flex items-center gap-3 mb-6">
                <!-- Bigger logo (desktop) -->
                <img
                  :src="logoUrl"
                  alt="TradeXion"
                  class="w-auto object-contain h-[clamp(140px,18vw,320px)]"
                />
              </div>
              <h2 class="text-3xl font-bold text-white mb-3">{{ t('auth.createAccount') }}</h2>
              <p class="text-white/70">{{ t('auth.joinUs') }}</p>
            </div>

            <div class="relative z-10 flex items-end justify-between">
              <div class="text-xs text-white/50">© {{ year }} TradeXion</div>
            </div>
          </div>

          <!-- Right (Form) -->
          <!-- Mobile: fit inside viewport, no scroll, no empty bottom gap -->
          <div class="glass-card-no-hover rounded-xl p-4 sm:p-6 lg:p-10 relative overflow-hidden flex flex-col justify-center max-h-[calc(100dvh-32px)] max-h-[calc(100svh-32px)]">
            <!-- subtle background icons -->
            <div class="absolute inset-0 pointer-events-none">
              <img
                v-for="(bg, idx) in bgIconsRight"
                :key="idx"
                :src="bg.src"
                alt=""
                class="absolute object-contain opacity-[0.08] blur-[0.3px]"
                :style="bg.style"
              />
            </div>
            <div class="flex flex-col items-center text-center mb-4 lg:hidden">
              <div class="flex items-center gap-2 mb-4">
                <!-- Bigger logo (mobile/tablet) but clamped to avoid scroll -->
                <img
                  :src="logoUrl"
                  alt="TradeXion"
                  class="w-auto object-contain h-[clamp(110px,18vh,180px)]"
                />
              </div>
              <h1 class="text-2xl font-bold text-white">{{ t('auth.createAccount') }}</h1>
              <p class="text-white/70 mt-1">{{ t('auth.joinUs') }}</p>
            </div>

            <div v-if="error" class="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm backdrop-blur-sm">
              {{ error }}
            </div>

            <div v-if="success" class="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-300 text-sm backdrop-blur-sm">
              <div>{{ success }}</div>
              <div v-if="success.includes('code is:')" class="mt-2 text-center">
                <div class="text-3xl font-bold tracking-widest text-white">{{ displayedOTP }}</div>
              </div>
            </div>

            <form v-if="!showVerification" @submit.prevent="handleRegister" class="space-y-4">
              <div>
                <label class="block text-sm text-white/80 mb-2 font-medium">{{ t('auth.email') }}</label>
                <input
                  v-model="email"
                  type="email"
                  required
                  autocomplete="email"
                  class="w-full px-4 py-3 glass-input rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label class="block text-sm text-white/80 mb-2 font-medium">{{ t('auth.password') }}</label>
                <input
                  v-model="password"
                  type="password"
                  required
                  minlength="6"
                  autocomplete="new-password"
                  class="w-full px-4 py-3 glass-input rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                  placeholder="••••••••"
                />
                <p class="text-xs text-white/50 mt-1">{{ t('auth.minimumChars') }}</p>
              </div>

              <!-- Cloudflare Turnstile CAPTCHA -->
              <div class="flex justify-center">
                <div ref="turnstileWidget" id="turnstile-widget-register"></div>
              </div>

              <button
                type="submit"
                :disabled="loading || !turnstileToken"
                class="w-full py-3 glass-button-no-hover rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {{ loading ? t('auth.registering') : t('auth.createAccountButton') }}
              </button>
            </form>

            <form v-else @submit.prevent="handleVerify" class="space-y-4">
              <div class="text-center mb-4">
                <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p class="text-white/80 mb-2">{{ t('auth.sentCodeTo') }}</p>
                <p class="text-white font-semibold">{{ email }}</p>
              </div>

              <div>
                <label class="block text-sm text-white/80 mb-2 font-medium text-center">{{ t('auth.verificationCode') }}</label>
                <input
                  v-model="code"
                  type="text"
                  required
                  maxlength="6"
                  class="w-full px-4 py-4 glass-input rounded-lg text-white text-center text-3xl tracking-[0.5em] font-bold focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                  placeholder="000000"
                  autocomplete="one-time-code"
                />
                <p class="text-xs text-white/50 mt-2 text-center">{{ t('auth.enterCode') }}</p>
              </div>

              <button
                type="submit"
                :disabled="loading"
                class="w-full py-3 glass-button-no-hover rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {{ loading ? t('auth.verifying') : t('auth.verifyEmail') }}
              </button>

              <button
                type="button"
                @click="showVerification = false"
                class="w-full py-3 glass-button-no-hover rounded-lg font-medium text-white transition-all"
              >
                {{ t('auth.back') }}
              </button>
            </form>

            <div class="mt-5">
              <div class="relative mb-4">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-white/15"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-4 bg-transparent text-white/60">{{ t('auth.orContinueWith') }}</span>
                </div>
              </div>

              <button
                @click="loginWithGoogle"
                class="w-full py-3 glass-button-no-hover rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {{ t('auth.continueWithGoogle') }}
              </button>
            </div>

            <div class="mt-5 text-center text-sm text-white/70">
              {{ t('auth.alreadyHaveAccount') }}
              <router-link to="/login" class="text-white font-semibold transition-colors ml-1">{{ t('auth.signInLink') }}</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/auth';
import { getApiUrl } from '../utils/config.js';

const { t } = useI18n();

const router = useRouter();
const authStore = useAuthStore();

const TURNSTILE_SITE_KEY = '0x4AAAAAACNscU1_JGFhgUPj';
const turnstileWidget = ref(null);
const turnstileToken = ref('');
let turnstileWidgetId = null;

const logoUrl = new URL('../assets/logo/Logo+SideText.png', import.meta.url).href;
const year = new Date().getFullYear();

// Background icons (NO banners, NO ERC/TRC)
const bgIcons = [
  { src: new URL('../assets/coins/ETH.png', import.meta.url).href, style: 'top: -18px; left: -10px; width: 120px; transform: rotate(-12deg);' },
  { src: new URL('../assets/coins/BTC.png', import.meta.url).href, style: 'top: 20%; right: -26px; width: 140px; transform: rotate(18deg);' },
  { src: new URL('../assets/coins/BNB.png', import.meta.url).href, style: 'bottom: -30px; left: 16%; width: 150px; transform: rotate(-8deg);' },
  { src: new URL('../assets/coins/XRP.png', import.meta.url).href, style: 'bottom: 14%; right: 10%; width: 110px; transform: rotate(10deg);' },
  { src: new URL('../assets/coins/DOT.png', import.meta.url).href, style: 'top: 52%; left: -24px; width: 110px; transform: rotate(22deg);' },
  { src: new URL('../assets/coins/DOGE.png', import.meta.url).href, style: 'top: 8%; left: 55%; width: 90px; transform: rotate(-20deg);' },
  { src: new URL('../assets/coins/ADA.png', import.meta.url).href, style: 'bottom: 8%; left: 60%; width: 95px; transform: rotate(14deg);' },
  { src: new URL('../assets/coins/LTC.png', import.meta.url).href, style: 'top: 32%; left: 30%; width: 80px; transform: rotate(-6deg);' },
];

const bgIconsRight = [
  { src: new URL('../assets/coins/BTC.png', import.meta.url).href, style: 'top: -20px; right: -24px; width: 130px; transform: rotate(20deg);' },
  { src: new URL('../assets/coins/ETH.png', import.meta.url).href, style: 'bottom: -26px; left: -24px; width: 140px; transform: rotate(-18deg);' },
  { src: new URL('../assets/coins/BNB.png', import.meta.url).href, style: 'bottom: 18%; right: -22px; width: 110px; transform: rotate(14deg);' },
  { src: new URL('../assets/coins/XRP.png', import.meta.url).href, style: 'top: 46%; left: -28px; width: 120px; transform: rotate(-10deg);' },
];

const email = ref('');
const password = ref('');
const code = ref('');
const error = ref('');
const success = ref('');
const loading = ref(false);
const showVerification = ref(false);
const displayedOTP = ref('');

const initTurnstile = () => {
  if (window.turnstile && turnstileWidget.value) {
    turnstileWidgetId = window.turnstile.render('#turnstile-widget-register', {
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
  }
};

const resetTurnstile = () => {
  if (turnstileWidgetId && window.turnstile) {
    window.turnstile.reset(turnstileWidgetId);
    turnstileToken.value = '';
  }
};

onMounted(() => {
  // Wait for Turnstile script to load
  if (window.turnstile) {
    initTurnstile();
  } else {
    const checkTurnstile = setInterval(() => {
      if (window.turnstile) {
        initTurnstile();
        clearInterval(checkTurnstile);
      }
    }, 100);
    
    // Cleanup if script doesn't load within 5 seconds
    setTimeout(() => {
      clearInterval(checkTurnstile);
    }, 5000);
  }
});

onUnmounted(() => {
  if (turnstileWidgetId && window.turnstile) {
    window.turnstile.remove(turnstileWidgetId);
  }
});

const handleRegister = async () => {
  if (!turnstileToken.value) {
    error.value = 'Please complete the CAPTCHA verification';
    return;
  }
  
  error.value = '';
  success.value = '';
  loading.value = true;
  
  const result = await authStore.register(email.value, password.value, turnstileToken.value);
  
  if (result.success) {
    // If email is auto-verified, redirect to login
    if (result.emailVerified) {
      success.value = 'Registration successful! Email auto-verified. You can now login.';
      resetTurnstile();
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } 
    // If OTP is provided (development mode), show it
    else if (result.otp) {
      displayedOTP.value = result.otp;
      success.value = `Registration successful! Your verification code is below (Email service not configured):`;
      showVerification.value = true;
      resetTurnstile();
    }
    // Normal flow - check email
    else {
      success.value = 'Registration successful! Please check your email for the verification code.';
      showVerification.value = true;
      resetTurnstile();
    }
  } else {
    error.value = result.error;
    resetTurnstile();
  }
  
  loading.value = false;
};

const handleVerify = async () => {
  error.value = '';
  loading.value = true;
  
  const result = await authStore.verifyEmail(email.value, code.value);
  
  if (result.success) {
    router.push('/login');
  } else {
    error.value = result.error;
  }
  
  loading.value = false;
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
