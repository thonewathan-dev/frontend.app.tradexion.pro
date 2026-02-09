<template>
  <div class="relative" ref="selectContainer">
    <button
      @click="toggleDropdown"
      type="button"
      class="w-full px-4 py-2 glass-input rounded-lg focus:outline-none flex items-center justify-between text-left"
      :class="{ 'ring-2 ring-blue-400/50': isOpen }"
    >
      <span class="text-gray-900">{{ displayValue }}</span>
      <svg
        class="w-5 h-5 text-gray-900/60 transition-transform"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    
    <transition name="dropdown">
      <div
        v-if="isOpen"
        class="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-md border border-gray-300 rounded-lg overflow-hidden shadow-2xl"
      >
        <div class="max-h-60 overflow-y-auto">
          <button
            v-for="option in options"
            :key="option.value"
            @click="selectOption(option)"
            type="button"
            class="w-full px-4 py-3 text-left text-gray-900 transition-colors"
            :class="{
              'bg-blue-500/50 text-blue-200': modelValue === option.value,
              'bg-gray-700/50 hover:bg-gray-700/70': modelValue !== option.value
            }"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const selectContainer = ref(null);

const displayValue = computed(() => {
  const option = props.options.find(opt => opt.value === props.modelValue);
  return option ? option.label : props.modelValue;
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (option) => {
  emit('update:modelValue', option.value);
  isOpen.value = false;
};

const handleClickOutside = (event) => {
  if (selectContainer.value && !selectContainer.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
