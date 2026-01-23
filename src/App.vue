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
    <InstallButton />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { setToastComponent } from './composables/useAlert';
import Toast from './components/Toast.vue';
import InstallButton from './components/InstallButton.vue';
import { isRouteLoading } from './router';

const toastRef = ref(null);

onMounted(async () => {
  // Wait for multiple ticks to ensure DOM is fully ready
  await nextTick();
  await nextTick();
  
  if (toastRef.value) {
    try {
      setToastComponent(toastRef.value);
    } catch (error) {
      console.error('Failed to set toast component:', error);
    }
  } else {
    // Retry after a short delay if ref is not ready
    setTimeout(() => {
      if (toastRef.value) {
        try {
    setToastComponent(toastRef.value);
        } catch (error) {
          console.error('Failed to set toast component (retry):', error);
        }
      }
    }, 100);
  }
});
</script>
