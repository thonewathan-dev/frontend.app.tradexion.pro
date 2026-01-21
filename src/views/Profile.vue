<template>
  <div class="min-h-screen bg-dark">
    <MobileNav v-if="isMobile" />
    <div class="md:flex">
      <DesktopNav v-if="!isMobile" />
      <main class="flex-1 pb-16 md:pb-0">
        <div class="p-4 md:p-8">
          <h1 class="text-2xl md:text-3xl font-bold mb-6">Profile</h1>
          
          <div class="bg-dark-surface rounded-lg border border-dark-border p-6">
            <div v-if="user" class="space-y-4">
              <!-- Credited Score - 70% reduced size -->
              <div class="w-[30%]">
                <label class="block text-sm text-gray-400 mb-2">Credited Score</label>
                <div class="px-3 py-1.5 bg-dark border border-dark-border rounded-lg text-lg font-bold text-primary">
                  {{ parseFloat(user.credited_score || 0).toFixed(2) }}
                </div>
              </div>
              
              <div>
                <label class="block text-sm text-gray-400 mb-2">Email</label>
                <div class="px-4 py-2 bg-dark border border-dark-border rounded-lg">
                  {{ user.email || 'N/A' }}
                </div>
              </div>
              <div>
                <label class="block text-sm text-gray-400 mb-2">Phone</label>
                <div class="px-4 py-2 bg-dark border border-dark-border rounded-lg">
                  {{ user.phone || 'N/A' }}
                </div>
              </div>
              <div>
                <label class="block text-sm text-gray-400 mb-2">Email Verified</label>
                <div class="px-4 py-2 bg-dark border border-dark-border rounded-lg">
                  <span :class="user.email_verified ? 'text-green-400' : 'text-red-400'">
                    {{ user.email_verified ? 'Yes' : 'No' }}
                  </span>
                </div>
              </div>
              <div>
                <label class="block text-sm text-gray-400 mb-2">Member Since</label>
                <div class="px-4 py-2 bg-dark border border-dark-border rounded-lg">
                  {{ formatDate(user.created_at) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onActivated, onUnmounted, watch, ref } from 'vue';
import { useRoute } from 'vue-router';
import MobileNav from '../components/MobileNav.vue';
import DesktopNav from '../components/DesktopNav.vue';
import { useAuthStore } from '../stores/auth';

const isMobile = computed(() => window.innerWidth < 768);
const authStore = useAuthStore();
const route = useRoute();

// Local ref to force reactivity updates
const localUser = ref(null);

// Make user reactive to authStore changes
const user = computed(() => {
  // Sync with authStore.user and localUser
  const storeUser = authStore.user;
  if (storeUser) {
    localUser.value = { ...storeUser };
    return localUser.value;
  }
  return storeUser;
});

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

// Periodic refresh interval (declare before use)
let refreshInterval = null;

const refreshUser = async () => {
  try {
    await authStore.fetchCurrentUser();
    // Force update localUser to trigger reactivity
    if (authStore.user) {
      localUser.value = { ...authStore.user };
    }
  } catch (error) {
    console.error('Error refreshing user:', error);
  }
};

// Refresh on mount
onMounted(async () => {
  await refreshUser();
  
  // Start periodic refresh every 3 seconds to catch admin updates
  refreshInterval = setInterval(async () => {
    if (route.path === '/profile') {
      await refreshUser();
    }
  }, 3000);
});

// Refresh when page is activated (using keep-alive)
onActivated(async () => {
  await refreshUser();
});

// Refresh when navigating to profile page
watch(() => route.path, async (newPath) => {
  if (newPath === '/profile') {
    await refreshUser();
  }
});

// Watch authStore.user deeply for credited_score changes
watch(() => authStore.user?.credited_score, (newScore, oldScore) => {
  if (newScore !== oldScore && newScore !== undefined && localUser.value) {
    localUser.value.credited_score = newScore;
    console.log('[Profile] Credited score updated:', oldScore, '->', newScore);
  }
}, { deep: true, immediate: true });

// Cleanup interval on unmount
onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
});
</script>
