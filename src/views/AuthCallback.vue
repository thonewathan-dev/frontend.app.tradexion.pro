<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p class="text-gray-400">Completing authentication...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const refresh = urlParams.get('refresh');
  
  if (token && refresh) {
    authStore.accessToken = token;
    authStore.refreshToken = refresh;
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refresh);
    
    authStore.fetchCurrentUser().then(() => {
      router.push('/');
    });
  } else {
    router.push('/login?error=oauth_failed');
  }
});
</script>
