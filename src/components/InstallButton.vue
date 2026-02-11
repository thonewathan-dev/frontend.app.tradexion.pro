<template>
  <!-- Install Button for Android/Desktop -->
  <div
    v-if="showInstallButton && !isIOSDevice && !isInstalled"
    class="fixed bottom-4 left-4 right-4 z-[9999] md:left-auto md:right-4 md:w-80"
  >
    <div class="glass-card rounded-xl p-4 shadow-2xl border border-gray-200 animate-slide-up">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <img src="/icon-192.png" alt="TrustXGlobal" class="w-12 h-12 rounded-lg" />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-gray-900 font-semibold text-sm mb-1">Install TrustXGlobal</h3>
          <p class="text-gray-900/70 text-xs mb-3">Get the full app experience with offline access</p>
          <div class="flex gap-2">
            <button
              @click="handleInstall"
              class="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-gray-900 rounded-lg font-medium text-sm hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
            >
              Install App
            </button>
            <button
              @click="dismissInstall"
              class="px-4 py-2 bg-gray-100 text-gray-900/70 rounded-lg text-sm hover:bg-gray-200 transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- iOS Add to Home Screen Instructions -->
  <div
    v-if="showIOSInstructions && isIOSDevice && !isInstalled"
    class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    @click.self="dismissIOSInstructions"
  >
    <div class="glass-card rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 animate-slide-up">
      <div class="text-center mb-6">
        <img src="/icon-192.png" alt="TrustXGlobal" class="w-20 h-20 rounded-2xl mx-auto mb-4" />
        <h2 class="text-gray-900 font-bold text-xl mb-2">Add to Home Screen</h2>
        <p class="text-gray-900/70 text-sm">Install TrustXGlobal for the best experience</p>
      </div>
      
      <div class="space-y-4 mb-6">
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <span class="text-blue-400 font-bold text-sm">1</span>
          </div>
          <div class="flex-1">
            <p class="text-gray-900 text-sm">Tap the <span class="font-semibold">Share</span> button</p>
            <p class="text-gray-900/60 text-xs mt-1">Located at the bottom of Safari</p>
          </div>
        </div>
        
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <span class="text-blue-400 font-bold text-sm">2</span>
          </div>
          <div class="flex-1">
            <p class="text-gray-900 text-sm">Select <span class="font-semibold">"Add to Home Screen"</span></p>
            <p class="text-gray-900/60 text-xs mt-1">Scroll down if needed</p>
          </div>
        </div>
        
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <span class="text-blue-400 font-bold text-sm">3</span>
          </div>
          <div class="flex-1">
            <p class="text-gray-900 text-sm">Tap <span class="font-semibold">"Add"</span></p>
            <p class="text-gray-900/60 text-xs mt-1">The app will appear on your home screen</p>
          </div>
        </div>
      </div>
      
      <button
        @click="dismissIOSInstructions"
        class="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-gray-900 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
      >
        Got it!
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { isIOS, isAppInstalled } from '../utils/pwa.js';

const isIOSDevice = ref(false);
const isInstalled = ref(false);
const showInstallButton = ref(false);
const showIOSInstructions = ref(false);
const deferredPrompt = ref(null);
const installDismissed = ref(false);
const iosDismissed = ref(false);

// Check if app is installed
const checkInstallStatus = () => {
  isInstalled.value = isAppInstalled();
  isIOSDevice.value = isIOS();
  
  // Check localStorage for dismissed state
  installDismissed.value = localStorage.getItem('pwa-install-dismissed') === 'true';
  iosDismissed.value = localStorage.getItem('pwa-ios-dismissed') === 'true';
  
  // Show install button for Android/Desktop if not installed and not dismissed
  if (!isInstalled.value && !isIOSDevice.value && !installDismissed.value) {
    showInstallButton.value = true;
  }
  
  // Show iOS instructions if iOS and not dismissed
  if (isInstalled.value === false && isIOSDevice.value && !iosDismissed.value) {
    // Show after a delay to not interrupt initial page load
    setTimeout(() => {
      showIOSInstructions.value = true;
    }, 3000);
  }
};

// Handle install button click (Android/Desktop)
const handleInstall = async () => {
  if (!deferredPrompt.value) {
    console.log('[PWA] Install prompt not available');
    return;
  }
  
  // Show the install prompt
  deferredPrompt.value.prompt();
  
  // Wait for user response
  const { outcome } = await deferredPrompt.value.userChoice;
  console.log('[PWA] User choice:', outcome);
  
  if (outcome === 'accepted') {
    console.log('[PWA] User accepted the install prompt');
  } else {
    console.log('[PWA] User dismissed the install prompt');
  }
  
  // Clear the deferred prompt
  deferredPrompt.value = null;
  showInstallButton.value = false;
};

// Dismiss install button
const dismissInstall = () => {
  showInstallButton.value = false;
  installDismissed.value = true;
  localStorage.setItem('pwa-install-dismissed', 'true');
};

// Dismiss iOS instructions
const dismissIOSInstructions = () => {
  showIOSInstructions.value = false;
  iosDismissed.value = true;
  localStorage.setItem('pwa-ios-dismissed', 'true');
};

// Listen for beforeinstallprompt event (Android/Desktop)
const handleBeforeInstallPrompt = (e) => {
  // Prevent the default browser install prompt
  e.preventDefault();
  // Store the event for later use
  deferredPrompt.value = e;
  // Show our custom install button
  if (!isInstalled.value && !isIOSDevice.value) {
    showInstallButton.value = true;
  }
};

// Listen for app installed event
const handleAppInstalled = () => {
  console.log('[PWA] App was installed');
  isInstalled.value = true;
  showInstallButton.value = false;
  showIOSInstructions.value = false;
  deferredPrompt.value = null;
};

let checkInterval = null;

onMounted(() => {
  checkInstallStatus();
  
  // Listen for beforeinstallprompt (Chrome/Edge)
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  
  // Listen for app installed
  window.addEventListener('appinstalled', handleAppInstalled);
  
  // Recheck install status periodically (in case user installs while on page)
  checkInterval = setInterval(() => {
    const wasInstalled = isInstalled.value;
    checkInstallStatus();
    // If just installed, clear dismissed flags
    if (!wasInstalled && isInstalled.value) {
      localStorage.removeItem('pwa-install-dismissed');
      localStorage.removeItem('pwa-ios-dismissed');
    }
  }, 5000);
});

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.removeEventListener('appinstalled', handleAppInstalled);
  if (checkInterval) {
    clearInterval(checkInterval);
  }
});
</script>

<style scoped>
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
</style>
