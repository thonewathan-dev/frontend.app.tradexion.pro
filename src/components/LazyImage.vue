<template>
  <img
    :src="imageSrc"
    :alt="alt"
    :class="imgClass"
    @load="onLoad"
    @error="onError"
    loading="lazy"
    decoding="async"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { cacheImage } from '../utils/imageCache.js';

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: '',
  },
  imgClass: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3C/svg%3E',
  },
});

const imageSrc = ref(props.placeholder);
const isLoaded = ref(false);

const onLoad = () => {
  isLoaded.value = true;
};

const onError = (event) => {
  // Fallback to placeholder on error
  event.target.src = props.placeholder;
};

onMounted(async () => {
  try {
    // Preload and cache the image
    await cacheImage(props.src);
    imageSrc.value = props.src;
  } catch (error) {
    console.warn('Failed to load image:', props.src, error);
    imageSrc.value = props.placeholder;
  }
});
</script>
