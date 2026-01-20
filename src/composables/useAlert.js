// Toast notification system
let toastComponent = null;

export const setToastComponent = (component) => {
  toastComponent = component;
};

export const useAlert = () => {
  const showToast = (message, type = 'info', duration = 3000) => {
    if (toastComponent) {
      toastComponent[type](message, duration);
    } else if (typeof window !== 'undefined' && window.__toast) {
      window.__toast[type](message, duration);
    } else {
      // Fallback to console if toast not ready
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  };

  const showSuccess = (message, duration = 3000) => {
    showToast(message, 'success', duration);
  };

  const showError = (message, duration = 4000) => {
    showToast(message, 'error', duration);
  };

  const showWarning = (message, duration = 3000) => {
    showToast(message, 'warning', duration);
  };

  const showInfo = (message, duration = 3000) => {
    showToast(message, 'info', duration);
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};
