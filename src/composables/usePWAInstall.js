// Shared PWA install prompt state
// This ensures all components can access the same deferredPrompt

let deferredPrompt = null;
let installPromptListeners = [];

const setDeferredPrompt = (prompt) => {
  console.log('[PWA] Setting deferred prompt in shared state');
  deferredPrompt = prompt;
  // Notify all listeners
  installPromptListeners.forEach(listener => listener(prompt));
};

const clearDeferredPrompt = () => {
  console.log('[PWA] Clearing deferred prompt');
  deferredPrompt = null;
  installPromptListeners.forEach(listener => listener(null));
};

export const usePWAInstall = () => {
  const getDeferredPrompt = () => deferredPrompt;
  
  const onPromptAvailable = (callback) => {
    installPromptListeners.push(callback);
    // Immediately call with current value if available
    if (deferredPrompt) {
      console.log('[PWA] Calling callback with existing prompt');
      callback(deferredPrompt);
    }
    // Return cleanup function
    return () => {
      installPromptListeners = installPromptListeners.filter(l => l !== callback);
    };
  };
  
  return {
    getDeferredPrompt,
    setDeferredPrompt,
    clearDeferredPrompt,
    onPromptAvailable
  };
};

// Setup global listener for beforeinstallprompt
// This must be set up as early as possible, before any components mount
if (typeof window !== 'undefined') {
  console.log('[PWA] Setting up global beforeinstallprompt listener');
  
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('[PWA] ✅ beforeinstallprompt event fired globally!');
    e.preventDefault();
    setDeferredPrompt(e);
  }, { capture: true }); // Use capture phase to catch it early
  
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] ✅ App installed event fired globally');
    clearDeferredPrompt();
  });
  
  // Debug: Log if event never fires
  setTimeout(() => {
    if (!deferredPrompt) {
      console.log('[PWA] ⚠️ beforeinstallprompt event has not fired after 5 seconds');
      console.log('[PWA] Possible reasons:');
      console.log('[PWA] - App already installed');
      console.log('[PWA] - Service worker not registered');
      console.log('[PWA] - Manifest issues');
      console.log('[PWA] - User needs to engage with site more');
      console.log('[PWA] - Not served over HTTPS (or localhost)');
    }
  }, 5000);
}
