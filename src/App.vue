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
        <span class="text-xs text-binance-yellow tracking-wide">Loading...</span>
      </div>
    </div>

    <Toast ref="toastRef" />
    <pwa-install 
      id="pwa-install"
      name="TrustXGlobal"
      iconpath="/icon-512.png"
      manifestpath="/manifest.json"
      install-description="Install TrustXGlobal to your home screen for lightning-fast trading and real-time alerts."
      description="Professional cryptocurrency trading platform with spot and contract trading. High security and low fees."
      manual-apple="true" 
      manual-chrome="true">
    </pwa-install>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { setToastComponent } from './composables/useAlert';
import Toast from './components/Toast.vue';
import { isRouteLoading } from './router';
import { useSettingsStore } from './stores/settings';

const toastRef = ref(null);
const settingsStore = useSettingsStore();

onMounted(async () => {
  settingsStore.fetchSettings();
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

<style>
pwa-install {
  --modal-background-color: #1e2329;
  --primary-text-color: #ffffff;
  --secondary-text-color: #94a3b8;
  --install-button-color: #FCD535;
  --install-button-text-color: #0b1020;
  --font-family: 'Inter', sans-serif;
}
</style>
