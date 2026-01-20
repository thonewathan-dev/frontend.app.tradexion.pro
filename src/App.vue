<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta?.transition || 'route-fade'" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
  <Toast ref="toastRef" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { setToastComponent } from './composables/useAlert';
import Toast from './components/Toast.vue';

const toastRef = ref(null);

onMounted(() => {
  if (toastRef.value) {
    setToastComponent(toastRef.value);
  }
});
</script>
