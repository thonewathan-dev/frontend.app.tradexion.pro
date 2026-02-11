<template>
  <div class="min-h-screen">
    <MobileNav v-if="isMobile" />
    <div class="md:flex">
      <DesktopNav v-if="!isMobile" />

      <main class="flex-1 pb-16 md:pb-0">
        <!-- Header (same style as flash exchange) -->
        <div class="bg-[#181A20] border-b border-gray-800 px-4 py-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="$router.back()" class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <svg class="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 class="text-lg font-bold text-gray-900">Modify the password</h1>
            </div>
          </div>
        </div>

        <div class="px-4 pt-4 space-y-5">
          <!-- Info -->
          <p class="text-xs text-gray-900/70">
            For your account security, please enter your current password and then your new password twice.
          </p>

          <!-- Form -->
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <div>
              <label class="block text-xs text-gray-900/70 mb-1">Current password</label>
              <input
                v-model="oldPassword"
                type="password"
                autocomplete="current-password"
                class="w-full px-4 py-3 glass-input rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-gray-900 placeholder-white/50"
                placeholder="Enter your current password"
              />
            </div>

            <div>
              <label class="block text-xs text-gray-900/70 mb-1">New password</label>
              <input
                v-model="newPassword"
                type="password"
                autocomplete="new-password"
                class="w-full px-4 py-3 glass-input rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-gray-900 placeholder-white/50"
                placeholder="Enter a new password"
              />
              <p class="mt-1 text-[11px] text-gray-900/50">At least 8 characters.</p>
            </div>

            <div>
              <label class="block text-xs text-gray-900/70 mb-1">Confirm new password</label>
              <input
                v-model="confirmPassword"
                type="password"
                autocomplete="new-password"
                class="w-full px-4 py-3 glass-input rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-gray-900 placeholder-white/50"
                placeholder="Re-enter the new password"
              />
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-3 rounded-lg text-sm font-bold bg-binance-yellow text-binance-black hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-binance-yellow/10"
            >
              {{ loading ? 'Changing password...' : 'Change password' }}
            </button>
          </form>

          <!-- Forgot password -->
          <div class="pt-2 border-t border-gray-200 mt-2">
            <router-link
              to="/forgot-password"
              class="text-xs text-teal-300 hover:text-teal-200 underline underline-offset-2 inline-block"
            >
              Forgot password?
            </router-link>
            <p class="mt-1 text-[11px] text-gray-900/50">
              If you've forgotten your password, click above to reset it via email.
            </p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import DesktopNav from '../components/DesktopNav.vue';
import MobileNav from '../components/MobileNav.vue';
import api from '../utils/api';
import { useAuthStore } from '../stores/auth';
import { useAlert } from '../composables/useAlert';

const router = useRouter();
const authStore = useAuthStore();
const isMobile = computed(() => window.innerWidth < 768);
const { showSuccess, showError, showWarning, showInfo } = useAlert();

const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const loading = ref(false);

const handleSubmit = async () => {
  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
    showWarning('Please fill in all fields.');
    return;
  }

  if (newPassword.value.length < 8) {
    showWarning('New password must be at least 8 characters.');
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    showWarning('New passwords do not match.');
    return;
  }

  loading.value = true;
  try {
    await api.post('/auth/change-password', {
      oldPassword: oldPassword.value,
      newPassword: newPassword.value,
    });

    showSuccess('Password changed successfully. Please log in again.');
    oldPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';

    // Log out locally so user re-authenticates with new password
    authStore.logout();
  } catch (error) {
    console.error('Change password failed:', error);
    const msg = error.response?.data?.error || 'Failed to change password';
    showError(msg);
  } finally {
    loading.value = false;
  }
};

</script>

