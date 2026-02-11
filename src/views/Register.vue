<template>
  <div class="min-h-[100dvh] overflow-hidden text-white flex flex-col">
    <!-- Top bar (same as Login) -->
    <div class="sticky top-0 z-10 bg-[#181A20] border-b border-gray-800">
      <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-2 group">
          <img :src="logoMarkUrl" alt="TrustXGlobal" class="w-7 h-7 object-contain" />
          <span class="font-semibold tracking-tight text-white group-hover:text-binance-yellow transition-colors">TrustXGlobal</span>
        </router-link>
        <router-link
          to="/login"
          class="px-4 py-1.5 rounded-full text-sm font-bold bg-binance-yellow text-binance-black hover:bg-opacity-90 transition-all shadow-lg shadow-binance-yellow/10"
        >
          Log In
        </router-link>
      </div>
    </div>

    <div class="flex-1 max-w-5xl mx-auto w-full px-4 pt-6 pb-8 md:pt-10 md:pb-10 md:flex md:items-center">
      <div class="grid md:grid-cols-2 gap-6 md:gap-10 items-start w-full">
        <!-- Desktop left panel (market preview like the reference) -->
        <div class="hidden md:block">
          <AuthMarketPanel />
        </div>

        <!-- Right: register form -->
        <div class="min-w-0">
          <h1 class="text-2xl md:text-3xl font-bold tracking-tight mb-3">Create Account</h1>

      <!-- Title removed tabs -->
      <div class="mb-4">
        <h2 class="text-sm font-bold text-white border-b-2 border-binance-yellow pb-2 w-fit">Create Account</h2>
      </div>

      <!-- Alerts shown via top Toast -->

      <!-- Main card -->
      <div class="glass-card-no-hover rounded-xl border border-white/10 p-4 bg-white/[0.02]">
        <!-- Verification screen (kept, just restyled) -->
        <form v-if="showVerification" @submit.prevent="handleVerify" class="space-y-3">
          <div class="text-center mb-2">
             <p class="text-gray-600 text-sm mb-1">{{ t('auth.sentCodeTo') }}</p>
            <p class="text-gray-900 text-sm font-semibold">{{ email }}</p>
          </div>

          <div>
             <label class="block text-xs text-gray-600 mb-2 font-medium text-center">{{ t('auth.verificationCode') }}</label>
            <input
              v-model="code"
              type="text"
              required
              maxlength="6"
               class="w-full px-4 py-4 rounded-lg border border-white/10 bg-white/5 text-white text-center text-2xl tracking-[0.4em] font-bold focus:outline-none focus:ring-2 focus:ring-binance-yellow/40 transition-all focus:bg-white/10"
               placeholder="000000"
              autocomplete="one-time-code"
            />
             <p class="text-xs text-gray-500 mt-1.5 text-center">{{ t('auth.enterCode') }}</p>
          </div>

           <button
             type="submit"
             :disabled="loading"
             class="w-full py-2.5 text-sm rounded-full font-bold bg-binance-yellow text-binance-black hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-binance-yellow/10"
           >
             {{ loading ? t('auth.verifying') : t('auth.verifyEmail') }}
           </button>

          <button
            type="button"
            @click="handleResendCode"
            :disabled="loading || resendingCode"
             class="w-full py-2.5 text-sm rounded-full font-semibold border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ resendingCode ? 'Sending...' : 'Resend Code' }}
          </button>

          <button
            type="button"
            @click="showVerification = false"
             class="w-full py-2.5 text-sm rounded-full font-semibold border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {{ t('auth.back') }}
          </button>
        </form>

        <!-- EMAIL ONLY MODE -->
        <div v-else>
          <form @submit.prevent="onPrimaryAction" class="space-y-2.5">
            <!-- Email registration steps content... -->
            <!-- Step 1: email only -->
            <div v-if="step === 'identifier'" class="space-y-2.5">
              <label class="block text-xs text-white/70 font-medium">Email</label>
              <input
                v-model.trim="email"
                type="email"
                required
                autocomplete="email"
                class="w-full px-4 py-3 text-sm rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-binance-yellow/40 transition-all focus:bg-white/10"
                placeholder="Enter email address"
              />

               <button
                 type="submit"
                 :disabled="loading || !canGoNext"
                 class="w-full py-2.5 text-sm rounded-full font-bold bg-binance-yellow text-binance-black hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-binance-yellow/10"
               >
                 Next
               </button>
            </div>

            <!-- Step 2: invite code + password + captcha -->
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
                <div class="flex-1 text-center text-xs font-semibold text-white truncate px-2">Create Account</div>
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

              <label class="block text-xs text-white/70 font-medium">Invite Code <span class="text-red-400">*</span></label>
              <input
                v-model.trim="inviteCode"
                type="text"
                required
                class="w-full px-4 py-3 text-sm rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-binance-yellow/40 transition-all focus:bg-white/10"
                placeholder="Enter invite code"
              />
              <p class="text-xs text-white/60">Invite code is required to register</p>

               <label class="block text-xs text-white/70 font-medium">Password</label>
               <input
                v-model="password"
                type="password"
                required
                minlength="6"
                autocomplete="new-password"
                 class="w-full px-4 py-3 text-sm rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-binance-yellow/40 transition-all focus:bg-white/10"
                 placeholder="Password"
              />
               <p class="text-xs text-white/70">{{ t('auth.minimumChars') }}</p>


              <!-- Submit Button (captcha removed from here) -->
               <button
                 type="submit"
                 :disabled="loading || !password || !inviteCode.trim() || !acceptTerms"
                 class="w-full py-2.5 text-sm rounded-full font-bold bg-binance-yellow text-binance-black hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-binance-yellow/10"
               >
                 {{ loading ? t('auth.registering') : 'Create Account' }}
               </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Divider -->
       <div class="my-3 flex items-center gap-3">
         <div class="h-px flex-1 bg-gray-700"></div>
         <div class="text-xs text-white/40">Or</div>
         <div class="h-px flex-1 bg-gray-700"></div>
       </div>

      <!-- Terms and Privacy Checkbox (before Google login) -->
      <div class="flex items-start gap-2.5 mb-3">
        <button
          type="button"
          @click="acceptTerms = !acceptTerms"
           class="relative flex-shrink-0 w-5 h-5 rounded border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-binance-yellow/20"
           :class="acceptTerms ? 'bg-binance-yellow border-binance-yellow' : 'bg-gray-50 border-gray-300 hover:border-gray-400'"
         >
          <transition
            enter-active-class="transition-all duration-200"
            enter-from-class="opacity-0 scale-75"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-150"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-75"
          >
            <svg
              v-if="acceptTerms"
                class="absolute inset-0 w-full h-full text-binance-black"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </transition>
        </button>
        <label
          @click="acceptTerms = !acceptTerms"
           class="text-xs text-white/70 leading-relaxed cursor-pointer flex-1"
        >
          I agree to the 
           <router-link to="/terms-of-service" class="font-bold text-white underline hover:text-binance-yellow transition-colors">Terms of Service</router-link>
           and 
           <router-link to="/privacy-policy" class="font-bold text-white underline hover:text-binance-yellow transition-colors">Privacy Policy</router-link>
        </label>
      </div>

      <!-- Google button -->
       <button
         type="button"
         @click="loginWithGoogle"
         :disabled="!acceptTerms"
         class="w-full py-2.5 text-sm rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-2 font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
        Already have an account?
         <router-link to="/login" class="font-bold text-white hover:text-binance-yellow transition-colors ml-1">Log In</router-link>
       </div>
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
          <div id="turnstile-widget-register"></div>
        </div>
      </div>
    </div>

    <SiteFooter />
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
const phone = ref('');
const inviteCode = ref('');
const inviteOpen = ref(false);
const code = ref('');
const error = ref('');
const success = ref('');
const loading = ref(false);
const showVerification = ref(false);
const displayedOTP = ref('');
const registerMode = ref('email');
const step = ref('identifier'); // 'identifier' | 'password'
const acceptTerms = ref(false);
const resendingCode = ref(false);
const showCaptchaModal = ref(false);

const canGoNext = computed(() => {
  const v = email.value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
});

const initTurnstile = () => {
  if (!window.turnstile) return;
  if (turnstileWidgetId) return;
  
  nextTick(() => {
    const el = document.getElementById('turnstile-widget-register');
    if (!el) return;

    turnstileWidgetId = window.turnstile.render('#turnstile-widget-register', {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token) => {
        turnstileToken.value = token;
        finishRegister();
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
  const qEmail = typeof route.query?.email === 'string' ? route.query.email : '';
  if (qEmail) {
    email.value = qEmail;
  }
});

onUnmounted(() => {
  removeTurnstile();
});

const setMode = (mode) => {
  registerMode.value = mode;
  error.value = '';
  success.value = '';
  loading.value = false;
  showVerification.value = false;
  password.value = '';
  step.value = 'identifier';
  removeTurnstile();
};

const backToIdentifier = () => {
  step.value = 'identifier';
  password.value = '';
  error.value = '';
  showCaptchaModal.value = false; // Add this
  removeTurnstile();
};

const onPrimaryAction = async () => {
  if (step.value === 'identifier') {
    error.value = '';
    if (!canGoNext.value) return;
    step.value = 'password';
    return;
  }

  // Handle Register click
  openCaptchaModal();
};

const openCaptchaModal = async () => {
  if (!password.value || !inviteCode.value.trim() || !acceptTerms.value) return;
  
  showCaptchaModal.value = true;
  await nextTick();
  setTimeout(initTurnstile, 100);
};

const closeCaptchaModal = () => {
  showCaptchaModal.value = false;
  resetTurnstile();
  removeTurnstile();
};


const finishRegister = async () => {
  if (!turnstileToken.value) return;

  error.value = '';
  success.value = '';
  loading.value = true;
  
  const result = await authStore.register(email.value.trim(), password.value, turnstileToken.value, inviteCode.value.trim());
  
  if (result.success) {
    closeCaptchaModal();
    // If email is auto-verified, redirect to login
    if (result.emailVerified) {
      if (typeof window !== 'undefined' && window.__toast?.success) {
        window.__toast.success('Registration successful!');
      }
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } 
    // If OTP is provided (development mode), show it
    else if (result.otp) {
      displayedOTP.value = result.otp;
      if (typeof window !== 'undefined' && window.__toast?.success) {
        window.__toast.success('Registration successful! Please verify your email.');
      }
      showVerification.value = true;
    }
    // Normal flow - check email
    else {
      if (typeof window !== 'undefined' && window.__toast?.success) {
        window.__toast.success('Registration successful! Please check your email for the verification code.');
      }
      showVerification.value = true;
    }
  } else {
    loading.value = false; // crucial fix
    error.value = result.error;
    if (typeof window !== 'undefined' && window.__toast?.error) {
      window.__toast.error(result.error || 'Registration failed');
    }
    resetTurnstile();
  }
  
  loading.value = false;
};

const handleVerify = async () => {
  error.value = '';
  loading.value = true;
  
  const result = await authStore.verifyEmail(email.value, code.value);
  
  if (result.success) {
    if (typeof window !== 'undefined' && window.__toast?.success) {
      window.__toast.success('Email verified. Welcome!');
    }
    router.push('/');
  } else {
    error.value = result.error;
    if (typeof window !== 'undefined' && window.__toast?.error) {
      window.__toast.error(result.error || 'Verification failed');
    }
  }
  
  loading.value = false;
};

const handleResendCode = async () => {
  resendingCode.value = true;
  error.value = '';
  
  const result = await authStore.resendVerificationCode(email.value.trim());
  
  if (result.success) {
    if (typeof window !== 'undefined' && window.__toast?.success) {
      window.__toast.success('Verification code sent! Please check your email.');
    }
    code.value = ''; // Clear the code input
  } else {
    error.value = result.error;
    if (typeof window !== 'undefined' && window.__toast?.error) {
      window.__toast.error(result.error || 'Failed to resend code');
    }
  }
  
  resendingCode.value = false;
};



const loginWithGoogle = () => {
  if (!acceptTerms.value) {
    if (typeof window !== 'undefined' && window.__toast?.error) {
      window.__toast.error('Please accept the Terms of Service and Privacy Policy to continue');
    }
    return;
  }
  
  // For registration, invite code will be collected after OAuth
  // Get API URL from config utility
  const apiUrl = getApiUrl();
  
  // Construct OAuth URL - API URL already includes /api
  const oauthUrl = apiUrl.endsWith('/api') 
    ? `${apiUrl}/auth/google`
    : `${apiUrl}/api/auth/google`;
  
  window.location.href = oauthUrl;
};
</script>
