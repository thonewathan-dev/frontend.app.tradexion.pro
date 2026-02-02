// Console Branding & Silence
(function () {
  const originalLog = console.log;
  const branding = `
   ████████╗██████╗  █████╗ ██████╗ ███████╗██╗  ██╗██╗ ██████╗ ███╗   ██╗
   ╚══██╔══╝██╔══██╗██╔══██╗██╔══██╗██╔════╝╚██╗██╔╝██║██╔═══██╗████╗  ██║
      ██║   ██████╔╝███████║██║  ██║█████╗   ╚███╔╝ ██║██║   ██║██╔██╗ ██║
      ██║   ██╔══██╗██╔══██║██║  ██║██╔══╝   ██╔██╗ ██║██║   ██║██║╚██╗██║
      ██║   ██║  ██║██║  ██║██████╔╝███████╗██╔╝ ██╗██║╚██████╔╝██║ ╚████║
      ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝
  `;
  const adText = 'Welcome to TradeXion - The World\'s Most Advanced Trading Platform.';
  const details = 'Join our global community and trade with the lowest fees and highest security.\nVisit us: https://www.tradexion.pro';

  originalLog(`%c${branding}`, 'color: #60a5fa; font-weight: bold;');
  originalLog(`%c${adText}`, 'color: #ffffff; font-size: 16px; font-weight: bold; background: #2563eb; padding: 4px 10px; border-radius: 4px;');
  originalLog(`%c${details}`, 'color: #94a3b8; font-size: 12px; font-style: italic;');

  // Silence all logs
  console.log = () => { };
  console.info = () => { };
  console.debug = () => { };
  console.warn = () => { };
  console.error = () => { };

  // Extra layer for some browser noise
  window.console.log = console.log;
  window.console.warn = console.warn;
  window.console.error = console.error;
})();

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import i18n from './i18n';
import './style.css';
import { registerServiceWorker } from './utils/pwa.js';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(i18n);

app.mount('#app');

// Register Service Worker for PWA
if (import.meta.env.PROD) {
  registerServiceWorker().catch(console.error);
}
