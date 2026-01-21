import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import i18n from './i18n';
import './style.css';

// Global error handler to catch Vue errors and prevent blank pages
const handleError = (err, instance, info) => {
  console.error('Vue Error:', err, info);
  // If it's a ref error from old cached code, try to recover
  if (err?.message?.includes('refs') || err?.message?.includes('null')) {
    console.warn('Detected ref error - likely from cached JavaScript. Clearing cache may help.');
    // Don't crash the app, just log it
    return;
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
