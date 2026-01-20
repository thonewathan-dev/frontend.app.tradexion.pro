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
import { ref, onMounted, computed } from 'vue';
import MobileNav from '../components/MobileNav.vue';
import DesktopNav from '../components/DesktopNav.vue';
import { useAuthStore } from '../stores/auth';

const isMobile = computed(() => window.innerWidth < 768);
const authStore = useAuthStore();
const user = ref(null);

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

onMounted(async () => {
  await authStore.fetchCurrentUser();
  user.value = authStore.user;
});
</script>
