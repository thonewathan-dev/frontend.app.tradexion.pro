import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import i18n from './i18n';
import './style.css';

// Global error handler to catch Vue errors and prevent blank pages
const handleError = (err, instance, info) => {
  console.error('Vue Error:', err, info);
  // If it's a ref error from old cached code, force cache clear and reload
  if (err?.message?.includes('refs') || err?.message?.includes('null') || err?.message?.includes('Cannot read properties')) {
    const RELOAD_ATTEMPT_KEY = 'app_reload_attempt';
    const MAX_RELOAD_ATTEMPTS = 1;
    const reloadAttempts = parseInt(sessionStorage.getItem(RELOAD_ATTEMPT_KEY) || '0');
    
    // Don't reload if we've already tried
    if (reloadAttempts >= MAX_RELOAD_ATTEMPTS) {
      console.error('Max reload attempts reached, showing error page');
      document.body.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; flex-direction: column; padding: 20px; text-align: center; font-family: system-ui, sans-serif; background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%);">
          <h1 style="color: #f97316; margin-bottom: 16px; font-size: 32px; font-weight: bold;">Application Error</h1>
          <p style="color: #e5e7eb; margin-bottom: 24px; font-size: 18px;">Please clear your browser cache and reload the page.</p>
          <button id="hardRefreshBtn" onclick="
            (function() {
              // Clear all caches
              if ('caches' in window) {
                caches.keys().then(names => {
                  names.forEach(name => caches.delete(name).catch(() => {}));
                });
              }
              // Clear service workers
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(registrations => {
                  registrations.forEach(reg => reg.unregister());
                });
              }
              // Clear storage
              sessionStorage.clear();
              const authTokens = {
                accessToken: localStorage.getItem('accessToken'),
                refreshToken: localStorage.getItem('refreshToken'),
              };
              localStorage.clear();
              Object.entries(authTokens).forEach(([key, value]) => {
                if (value) localStorage.setItem(key, value);
              });
              // Hard reload with cache bypass
              window.location.href = window.location.origin + window.location.pathname + '?v=' + Date.now() + '&_hard=1';
            })();
          " style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 500; margin-bottom: 12px;">
            Clear Cache & Reload
          </button>
          <button onclick="sessionStorage.removeItem('app_reload_attempt'); location.href = location.pathname;" style="padding: 12px 24px; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">
            Try Again (Simple Reload)
          </button>
        </div>
      `;
      return false;
    }
    
    console.error('Critical: Ref error detected - clearing all caches and reloading...');
    
    // Increment reload counter
    sessionStorage.setItem(RELOAD_ATTEMPT_KEY, (reloadAttempts + 1).toString());
    
    // Clear all possible caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name).catch(() => {});
        });
      });
    }
    
    // Clear service workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
      });
    }
    
    // Clear localStorage (except auth)
    const authTokens = {
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken'),
    };
    localStorage.clear();
    Object.entries(authTokens).forEach(([key, value]) => {
      if (value) localStorage.setItem(key, value);
    });
    
    // Force hard reload with cache bypass - use replace for more aggressive cache clearing
    setTimeout(() => {
      const url = window.location.href.split('?')[0] + '?v=' + Date.now() + '&_nocache=1&_t=' + performance.now();
      window.location.replace(url); // Use replace to prevent back button issues
    }, 100);
    
    return false; // Prevent Vue from logging again
  }
  // For other errors, let Vue handle them normally
};

const app = createApp(App);
const pinia = createPinia();

// Add error handler
app.config.errorHandler = handleError;

app.use(pinia);
app.use(router);
app.use(i18n);

// Wrap mount in try-catch for extra safety
try {
  app.mount('#app');
} catch (error) {
  console.error('Failed to mount app:', error);
  // Show user-friendly error message
  document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; flex-direction: column; padding: 20px; text-align: center; font-family: system-ui, sans-serif;">
      <h1 style="color: #ef4444; margin-bottom: 16px;">Application Error</h1>
      <p style="color: #6b7280; margin-bottom: 24px;">Please clear your browser cache and reload the page.</p>
      <button onclick="location.reload(true)" style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
        Reload Page
      </button>
    </div>
  `;
}
