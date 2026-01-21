import { onMounted, onUnmounted } from 'vue';

/**
 * Composable to show/hide Tawk.to chat widget
 * Script is loaded in index.html, we just control visibility
 */
export function useTawk() {
  const showTawk = () => {
    // Wait for Tawk.to to be ready
    if (window.Tawk_API && window.Tawk_API.showWidget) {
      window.Tawk_API.showWidget();
      console.log('[Tawk.to] Widget shown');
    } else {
      // Wait for Tawk.to to load
      const checkTawk = setInterval(() => {
        if (window.Tawk_API && window.Tawk_API.showWidget) {
          clearInterval(checkTawk);
          window.Tawk_API.showWidget();
          console.log('[Tawk.to] Widget shown');
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkTawk);
      }, 5000);
    }
  };

  const hideTawk = () => {
    if (window.Tawk_API && window.Tawk_API.hideWidget) {
      window.Tawk_API.hideWidget();
      console.log('[Tawk.to] Widget hidden');
    }
  };

  onMounted(() => {
    showTawk();
  });

  onUnmounted(() => {
    // Don't hide on unmount - keep it visible when navigating
    // hideTawk();
  });

  return {
    showTawk,
    hideTawk,
  };
}
