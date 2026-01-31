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
          to="/login"
          class="px-4 py-1.5 rounded-full text-sm font-semibold glass-button-no-hover text-white border border-white/20 hover:border-white/30 transition-colors"
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

        <!-- Right: invite code form -->
        <div class="min-w-0">
          <h1 class="text-2xl md:text-3xl font-bold tracking-tight mb-3 text-white">Complete Registration</h1>
          <p class="text-sm text-white/70 mb-6">Please enter your invite code to complete your Google account registration.</p>

          <!-- Error message -->
          <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p class="text-sm text-red-400">{{ error }}</p>
          </div>

          <!-- Main card -->
          <div class="glass-card-no-hover rounded-xl border border-white/12 p-6">
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div>
                <label class="block text-xs text-white/80 font-medium mb-2">Email</label>
                <input
                  :value="email"
                  type="email"
                  readonly
                  class="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-white/5 text-white/80 placeholder-white/40 focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs text-white/80 font-medium mb-2">Invite Code <span class="text-red-400">*</span></label>
                <input
                  v-model.trim="inviteCode"
                  type="text"
                  required
                  autofocus
                  class="w-full px-3 py-2.5 text-sm glass-input rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all uppercase"
                  placeholder="Enter invite code"
                />
                <p class="text-xs text-white/50 mt-1">Invite code is required to complete registration</p>
              </div>

              <button
                type="submit"
                :disabled="loading || !inviteCode.trim()"
                class="w-full py-2.5 text-sm rounded-full font-semibold glass-button-no-hover text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
              >
                {{ loading ? 'Completing Registration...' : 'Complete Registration' }}
              </button>

              <button
                type="button"
                @click="cancelRegistration"
                class="w-full py-2.5 text-sm rounded-full font-semibold border border-white/15 text-white/90 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import AuthMarketPanel from '../components/AuthMarketPanel.vue';
import logoMarkUrl from '../assets/logo/Logo-Only.png';
import api from '../utils/api';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref('');
const inviteCode = ref('');
const loading = ref(false);
const error = ref('');

onMounted(() => {
  // Get email and token from URL parameters
  const emailParam = route.query.email;
  const tokenParam = route.query.token;
  
  if (!emailParam || !tokenParam) {
    error.value = 'Invalid registration link. Please try again.';
    return;
  }
  
  email.value = emailParam;
  // Store token temporarily for the completion request
  sessionStorage.setItem('google_oauth_token', tokenParam);
});

const handleSubmit = async () => {
  if (!inviteCode.value.trim()) {
    error.value = 'Please enter an invite code';
    return;
  }

  error.value = '';
  loading.value = true;

  try {
    const token = sessionStorage.getItem('google_oauth_token');
    if (!token) {
      throw new Error('Session expired. Please try again.');
    }

    const response = await api.post('/auth/google/complete-registration', {
      inviteCode: inviteCode.value.trim().toUpperCase(),
      token: token
    });

    // Clear temporary token
    sessionStorage.removeItem('google_oauth_token');

    // Store tokens
    authStore.accessToken = response.data.accessToken;
    authStore.refreshToken = response.data.refreshToken;
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);

    // Fetch user data
    await authStore.fetchCurrentUser();

    // Redirect to home
    router.push('/');
  } catch (err) {
    console.error('Complete registration error:', err);
    error.value = err.response?.data?.error || 'Failed to complete registration. Please check your invite code.';
  } finally {
    loading.value = false;
  }
};

const cancelRegistration = () => {
  sessionStorage.removeItem('google_oauth_token');
  router.push('/register');
};
</script>
