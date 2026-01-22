<template>
  <div class="relative min-h-screen">
    <router-view />

    <!-- Global route-change loader -->
    <div
      v-if="isRouteLoading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div class="flex flex-col items-center gap-3">
        <span class="loader"></span>
        <span class="text-xs text-white/80 tracking-wide">Loading...</span>
      </div>
    </div>

    <Toast ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { setToastComponent } from './composables/useAlert';
import Toast from './components/Toast.vue';
import { isRouteLoading } from './router';

const toastRef = ref(null);

onMounted(async () => {
  await nextTick();
  if (toastRef.value) {
    try {
      setToastComponent(toastRef.value);
    } catch (error) {
      console.error('Failed to set toast component:', error);
    }
  }
});
</script>
