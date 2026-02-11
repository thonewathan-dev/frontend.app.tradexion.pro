<template>
  <div class="min-h-[100dvh] overflow-hidden text-white flex flex-col">
    <!-- Top bar -->
    <div class="sticky top-0 z-10 bg-[#0f1115] border-b border-white/10 w-full">
      <div class="w-full px-4 h-14 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-2 group transition-colors">
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
        <!-- Desktop left panel -->
        <div class="hidden md:block">
          <AuthMarketPanel />
        </div>

        <!-- Right: Forgot password form -->
        <div class="min-w-0">
          <h1 class="text-2xl md:text-3xl font-bold tracking-tight mb-3 text-white">Forgot Password</h1>
          <p class="text-sm text-white/70 mb-6">Enter your email address and we'll send you a code to reset your password.</p>

          <!-- Card -->
          <div class="glass-card-no-hover rounded-xl border border-white/10 p-4 bg-white/[0.02]">
            <form @submit.prevent="handleRequestReset" class="space-y-2.5">
              <label class="block text-xs text-white/70 font-medium">Email</label>
              <input
                v-model.trim="email"
                type="email"
                autocomplete="email"
                required
                class="w-full px-4 py-3 text-sm rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-binance-yellow/40 transition-all focus:bg-white/10"
                placeholder="Enter your email"
              />

              <!-- Error message for unregistered email -->
              <div v-if="showEmailNotRegistered" class="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p class="text-xs text-red-400 mb-2">This email is not registered.</p>
                <router-link 
                  to="/register" 
                  class="text-xs text-red-300 hover:text-red-200 underline font-semibold"
                >
                  Register an account first â†’
                </router-link>
              </div>

              <!-- Error message for Google-only account -->
              <div v-if="showGoogleOnlyAccount" class="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p class="text-xs text-yellow-400">This account uses Google login. Please use Google to sign in.</p>
              </div>

              <button
                type="submit"
                :disabled="loading || !email || !canGoNext"
                class="w-full py-2.5 text-sm rounded-full font-bold bg-binance-yellow text-binance-black hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-binance-yellow/10"
              >
                {{ loading ? 'Sending...' : 'Send Reset Code' }}
              </button>
            </form>
          </div>

          <div class="mt-4 text-center text-xs text-white/70">
            <router-link to="/login" class="font-bold text-white hover:text-binance-yellow transition-colors">Back to Log In</router-link>
          </div>
        </div>
      </div>
    </div>

    <SiteFooter />
  </div>
</template>

<script setup>
import AuthMarketPanel from '../components/AuthMarketPanel.vue';
import SiteFooter from '../components/SiteFooter.vue';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const logoMarkUrl = new URL('../assets/logo/Logo-Only.png', import.meta.url).href;

const email = ref('');
const loading = ref(false);
const error = ref('');
const showEmailNotRegistered = ref(false);
const showGoogleOnlyAccount = ref(false);

const canGoNext = computed(() => {
  const v = email.value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
});

const handleRequestReset = async () => {
  if (!canGoNext.value) return;
  
  error.value = '';
  showEmailNotRegistered.value = false;
  showGoogleOnlyAccount.value = false;
  loading.value = true;
  
  const result = await authStore.requestPasswordReset(email.value.trim());
  
  if (result.success) {
    if (typeof window !== 'undefined' && window.__toast?.success) {
      window.__toast.success('Password reset code sent! Please check your email.');
    }
    // Navigate to verify code page with email as query param
    router.push({ 
      path: '/reset-password', 
      query: { email: email.value.trim() } 
    });
  } else {
    error.value = result.error;
    
    // Check for specific error types
    if (result.error === 'EMAIL_NOT_REGISTERED' || result.error?.includes('EMAIL_NOT_REGISTERED') || result.message?.includes('not registered')) {
      showEmailNotRegistered.value = true;
      // Don't show toast for this - show the inline message instead
    } else if (result.error === 'NO_PASSWORD_SET' || result.error?.includes('NO_PASSWORD_SET') || result.message?.includes('Google')) {
      showGoogleOnlyAccount.value = true;
      if (typeof window !== 'undefined' && window.__toast?.error) {
        window.__toast.error(result.message || result.error);
      }
    } else {
      // Other errors - show toast
      if (typeof window !== 'undefined' && window.__toast?.error) {
        window.__toast.error(result.message || result.error || 'Failed to send reset code');
      }
    }
  }
  
  loading.value = false;
};
</script>
