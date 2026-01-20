<template>
  <Teleport to="body">
    <transition-group name="toast" tag="div" class="fixed top-4 left-1/2 transform -translate-x-1/2 z-[10000] space-y-2 pointer-events-none">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="glass-card rounded-lg shadow-2xl border border-white/10 min-w-[300px] max-w-[90vw] pointer-events-auto animate-slide-down"
        :class="{
          'bg-green-500/10 border-green-500/30': toast.type === 'success',
          'bg-red-500/10 border-red-500/30': toast.type === 'error',
          'bg-yellow-500/10 border-yellow-500/30': toast.type === 'warning',
          'bg-blue-500/10 border-blue-500/30': toast.type === 'info'
        }"
      >
        <div class="flex items-start gap-3 p-4">
          <!-- Icon -->
          <div
            :class="[
              'w-5 h-5 mt-0.5 flex-shrink-0',
              toast.type === 'success' ? 'text-green-400' : '',
              toast.type === 'error' ? 'text-red-400' : '',
              toast.type === 'warning' ? 'text-yellow-400' : '',
              toast.type === 'info' ? 'text-blue-400' : ''
            ]"
          >
            <svg
              v-if="toast.type === 'success'"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg
              v-else-if="toast.type === 'error'"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <svg
              v-else-if="toast.type === 'warning'"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <svg
              v-else
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
          
          <!-- Message -->
          <div class="flex-1">
            <p
              :class="[
                'text-sm font-medium',
                toast.type === 'success' ? 'text-green-400' : '',
                toast.type === 'error' ? 'text-red-400' : '',
                toast.type === 'warning' ? 'text-yellow-400' : '',
                toast.type === 'info' ? 'text-blue-400' : ''
              ]"
            >
              {{ toast.message }}
            </p>
          </div>
          
          <!-- Close button (optional, small X) -->
          <button
            @click="removeToast(toast.id)"
            class="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
          >
            <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </transition-group>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Teleport } from 'vue';

const toasts = ref([]);
let toastIdCounter = 0;

const addToast = (message, type = 'info', duration = 3000) => {
  const id = ++toastIdCounter;
  const toast = {
    id,
    message,
    type,
    duration
  };
  
  toasts.value.push(toast);
  
  // Auto remove after duration
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
  
  return id;
};

const removeToast = (id) => {
  const index = toasts.value.findIndex(t => t.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
};

// Expose methods globally
if (typeof window !== 'undefined') {
  window.__toast = {
    add: addToast,
    remove: removeToast,
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
    info: (msg, duration) => addToast(msg, 'info', duration)
  };
}

defineExpose({
  add: addToast,
  remove: removeToast,
  success: (msg, duration) => addToast(msg, 'success', duration),
  error: (msg, duration) => addToast(msg, 'error', duration),
  warning: (msg, duration) => addToast(msg, 'warning', duration),
  info: (msg, duration) => addToast(msg, 'info', duration)
});
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) translateX(-50%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px) translateX(-50%) scale(0.95);
}

.toast-move {
  transition: transform 0.3s ease;
}

@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-down {
  animation: slide-down 0.3s ease-out;
}
</style>
