<template>
  <Teleport v-if="isMounted" to="body">
    <transition name="alert">
      <div
        v-if="isVisible"
        class="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="close"
      >
        <div class="glass-card rounded-lg w-full max-w-sm shadow-2xl border border-gray-200 animate-slide-up">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200">
            <div class="flex items-center gap-3">
              <!-- Icon based on type -->
              <div
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  type === 'success' ? 'bg-green-500/20' : '',
                  type === 'error' ? 'bg-red-500/20' : '',
                  type === 'warning' ? 'bg-yellow-500/20' : '',
                  type === 'info' ? 'bg-blue-500/20' : ''
                ]"
              >
                <svg
                  v-if="type === 'success'"
                  class="w-5 h-5 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <svg
                  v-else-if="type === 'error'"
                  class="w-5 h-5 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <svg
                  v-else-if="type === 'warning'"
                  class="w-5 h-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <svg
                  v-else
                  class="w-5 h-5 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </div>
              <h3
                :class="[
                  'text-lg font-semibold',
                  type === 'success' ? 'text-green-400' : '',
                  type === 'error' ? 'text-red-400' : '',
                  type === 'warning' ? 'text-yellow-400' : '',
                  type === 'info' ? 'text-blue-400' : ''
                ]"
              >
                {{ title }}
              </h3>
            </div>
            <button
              @click="close"
              class="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg class="w-5 h-5 text-gray-900/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Message -->
          <div class="p-4">
            <p class="text-gray-900/90 text-sm leading-relaxed">{{ message }}</p>
          </div>
          
          <!-- Actions -->
          <div class="p-4 pt-0 flex justify-end gap-2">
            <button
              @click="close"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                type === 'success' ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/50' : '',
                type === 'error' ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50' : '',
                type === 'warning' ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/50' : '',
                type === 'info' ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/50' : ''
              ]"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { Teleport } from 'vue';

const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
});

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'info', // success, error, warning, info
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  title: {
    type: String,
    default: 'Alert'
  },
  message: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 0 // 0 = manual close only
  }
});

const emit = defineEmits(['update:visible', 'close']);

const isVisible = ref(props.visible);
let timeoutId = null;

watch(() => props.visible, (newVal) => {
  isVisible.value = newVal;
  if (newVal && props.duration > 0) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      close();
    }, props.duration);
  }
});

const close = () => {
  isVisible.value = false;
  emit('update:visible', false);
  emit('close');
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
};

// Close on Escape key
if (typeof window !== 'undefined') {
  const handleEscape = (e) => {
    if (e.key === 'Escape' && isVisible.value) {
      close();
    }
  };
  watch(isVisible, (visible) => {
    if (visible) {
      window.addEventListener('keydown', handleEscape);
    } else {
      window.removeEventListener('keydown', handleEscape);
    }
  });
}
</script>

<style scoped>
.alert-enter-active,
.alert-leave-active {
  transition: opacity 0.3s ease;
}

.alert-enter-from,
.alert-leave-to {
  opacity: 0;
}

.alert-enter-active .glass-card,
.alert-leave-active .glass-card {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.alert-enter-from .glass-card,
.alert-leave-to .glass-card {
  transform: scale(0.9) translateY(-20px);
  opacity: 0;
}
</style>
