<template>
  <div class="min-h-[100dvh] overflow-hidden text-gray-900 flex flex-col">
    <!-- Top bar -->
    <div class="sticky top-0 z-10 glass-card-no-hover border-b border-gray-200">
      <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <img :src="logoMarkUrl" alt="TrustXGlobal" class="w-7 h-7 object-contain" />
          <span class="font-semibold tracking-tight text-gray-900">TrustXGlobal</span>
        </div>
        <router-link
          to="/login"
          class="px-4 py-1.5 rounded-full text-sm font-semibold glass-button-no-hover text-gray-900 border border-gray-300 hover:border-white/30 transition-colors"
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

        <!-- Right: Reset password form -->
        <div class="min-w-0">
          <h1 class="text-2xl md:text-3xl font-bold tracking-tight mb-3 text-gray-900">Reset Password</h1>

          <!-- Card -->
          <div class="glass-card-no-hover rounded-xl border border-white/12 p-3">
            <!-- Step 1: Verify Code -->
            <form v-if="step === 'code'" @submit.prevent="handleVerifyCode" class="space-y-2.5">
              <div class="text-center mb-2">
                <p class="text-gray-900/80 text-sm mb-1">Code sent to</p>
                <p class="text-gray-900 text-sm font-semibold">{{ email }}</p>
              </div>

              <label class="block text-xs text-gray-900/80 font-medium text-center">Verification Code</label>
              <input
                v-model.trim="code"
                type="text"
                required
                maxlength="6"
                class="w-full px-3 py-3 glass-input rounded-lg text-gray-900 text-center text-2xl tracking-[0.4em] font-bold focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                placeholder="000000"
                autocomplete="one-time-code"
              />
              <p class="text-xs text-gray-900/50 mt-1.5 text-center">Enter the 6-digit code sent to your email</p>

              <button
                type="submit"
                :disabled="loading || !code || code.length !== 6"
                class="w-full py-2.5 text-sm rounded-full font-semibold glass-button-no-hover text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
              >
                {{ loading ? 'Verifying...' : 'Verify Code' }}
              </button>

              <button
                type="button"
                @click="handleResendCode"
                :disabled="loading || resendingCode"
                class="w-full py-2.5 text-sm rounded-full font-semibold border border-white/15 text-gray-900/90 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ resendingCode ? 'Sending...' : 'Resend Code' }}
              </button>
            </form>

            <!-- Step 2: New Password -->
            <form v-else @submit.prevent="handleResetPassword" class="space-y-2.5">
              <div class="flex items-center gap-2 mb-1.5">
                <button
                  type="button"
                  class="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  @click="step = 'code'"
                  aria-label="Back"
                >
                  <svg class="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
                <div class="flex-1 text-center text-xs font-semibold text-gray-900 truncate px-2">New Password</div>
                <div class="w-7"></div>
              </div>

              <label class="block text-xs text-gray-900/80 font-medium">New Password</label>
              <input
                v-model="newPassword"
                type="password"
                required
                minlength="8"
                autocomplete="new-password"
                class="w-full px-3 py-2.5 text-sm glass-input rounded-lg text-gray-900 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                placeholder="Enter new password"
              />
              <p class="text-xs text-gray-900/50">Password must be at least 8 characters long</p>

              <label class="block text-xs text-gray-900/80 font-medium">Confirm New Password</label>
              <input
                v-model="confirmPassword"
                type="password"
                required
                minlength="8"
                autocomplete="new-password"
                class="w-full px-3 py-2.5 text-sm glass-input rounded-lg text-gray-900 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                placeholder="Confirm new password"
              />
              <p v-if="confirmPassword && newPassword !== confirmPassword" class="text-xs text-red-400">Passwords do not match</p>

              <button
                type="submit"
                :disabled="loading || !newPassword || !confirmPassword || newPassword.length < 8 || newPassword !== confirmPassword"
                class="w-full py-2.5 text-sm rounded-full font-semibold glass-button-no-hover text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
              >
                {{ loading ? 'Resetting...' : 'Reset Password' }}
              </button>
            </form>
          </div>

          <div class="mt-4 text-center text-xs text-gray-900/70">
            <router-link to="/login" class="font-semibold text-gray-900 hover:text-gray-900/80">Back to Log In</router-link>
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
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const logoMarkUrl = new URL('../assets/logo/Logo-Only.png', import.meta.url).href;

const email = ref('');
const code = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const step = ref('code'); // 'code' or 'password'
const loading = ref(false);
const resendingCode = ref(false);
const error = ref('');

onMounted(() => {
  // Get email from query params
  const emailParam = route.query.email;
  if (emailParam && typeof emailParam === 'string') {
    email.value = emailParam;
  } else {
    // If no email, redirect to forgot password
    router.push('/forgot-password');
  }
});

const handleVerifyCode = async () => {
  if (!code.value || code.value.length !== 6) {
    return;
  }
  
  error.value = '';
  loading.value = true;
  
  const result = await authStore.verifyPasswordResetCode(email.value.trim(), code.value);
  
  if (result.success) {
    // Code is valid, proceed to password step
    step.value = 'password';
  } else {
    // Code is invalid, show error
    error.value = result.error;
    if (typeof window !== 'undefined' && window.__toast?.error) {
      window.__toast.error(result.error || 'Invalid or expired code');
    }
    code.value = ''; // Clear the code input
  }
  
  loading.value = false;
};

const handleResendCode = async () => {
  if (!email.value) return;
  
  resendingCode.value = true;
  error.value = '';
  
  const result = await authStore.requestPasswordReset(email.value.trim());
  
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

const handleResetPassword = async () => {
  if (!code.value || code.value.length !== 6 || !newPassword.value || newPassword.value.length < 8) {
    return;
  }
  
  if (newPassword.value !== confirmPassword.value) {
    if (typeof window !== 'undefined' && window.__toast?.error) {
      window.__toast.error('Passwords do not match');
    }
    return;
  }
  
  error.value = '';
  loading.value = true;
  
  const result = await authStore.resetPassword(email.value.trim(), code.value, newPassword.value);
  
  if (result.success) {
    if (typeof window !== 'undefined' && window.__toast?.success) {
      window.__toast.success('Password reset successfully! Please log in with your new password.');
    }
    // Redirect to login with email pre-filled
    router.push({ 
      path: '/login', 
      query: { email: email.value.trim() } 
    });
  } else {
    error.value = result.error;
    if (typeof window !== 'undefined' && window.__toast?.error) {
      window.__toast.error(result.error || 'Failed to reset password');
    }
    // If code is invalid, go back to code step
    if (result.error && (result.error.includes('Invalid') || result.error.includes('expired') || result.error.includes('code'))) {
      step.value = 'code';
      code.value = '';
    }
  }
  
  loading.value = false;
};
</script>
