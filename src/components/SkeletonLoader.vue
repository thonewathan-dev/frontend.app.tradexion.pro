<template>
  <div class="animate-pulse">
    <!-- Card Skeleton -->
    <div v-if="type === 'card'" class="glass-card rounded-xl p-4">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 bg-white/10 rounded-full"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-white/10 rounded w-3/4"></div>
          <div class="h-3 bg-white/10 rounded w-1/2"></div>
        </div>
      </div>
      <div class="space-y-2">
        <div class="h-3 bg-white/10 rounded"></div>
        <div class="h-3 bg-white/10 rounded w-5/6"></div>
      </div>
    </div>

    <!-- Ticker Card Skeleton -->
    <div v-else-if="type === 'ticker'" class="glass-card rounded-xl p-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-white/10 rounded-full"></div>
          <div class="space-y-1">
            <div class="h-3 bg-white/10 rounded w-12"></div>
            <div class="h-2 bg-white/10 rounded w-16"></div>
          </div>
        </div>
        <div class="text-right space-y-1">
          <div class="h-4 bg-white/10 rounded w-16"></div>
          <div class="h-3 bg-white/10 rounded w-12"></div>
        </div>
      </div>
    </div>

    <!-- Table Row Skeleton -->
    <div v-else-if="type === 'table-row'" class="border-b border-white/10">
      <div class="flex items-center gap-4 p-4">
        <div class="h-4 bg-white/10 rounded flex-1"></div>
        <div class="h-4 bg-white/10 rounded flex-1"></div>
        <div class="h-4 bg-white/10 rounded flex-1"></div>
        <div class="h-4 bg-white/10 rounded w-20"></div>
      </div>
    </div>

    <!-- Order Book Skeleton -->
    <div v-else-if="type === 'order-book'" class="space-y-0.5">
      <div
        v-for="i in rows"
        :key="i"
        class="flex justify-between items-center py-0.5 px-1"
      >
        <div class="h-3 bg-white/10 rounded w-20"></div>
        <div class="h-3 bg-white/10 rounded w-16"></div>
      </div>
    </div>

    <!-- Input Skeleton -->
    <div v-else-if="type === 'input'" class="space-y-2">
      <div class="h-3 bg-white/10 rounded w-20"></div>
      <div class="h-10 bg-white/10 rounded-lg"></div>
    </div>

    <!-- Button Skeleton -->
    <div v-else-if="type === 'button'" class="h-10 bg-white/10 rounded-lg"></div>

    <!-- Default Skeleton -->
    <div v-else class="space-y-2">
      <div class="h-4 bg-white/10 rounded"></div>
      <div class="h-4 bg-white/10 rounded w-5/6"></div>
      <div class="h-4 bg-white/10 rounded w-4/6"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['card', 'ticker', 'table-row', 'order-book', 'input', 'button', 'default'].includes(value)
  },
  rows: {
    type: Number,
    default: 5
  }
});
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>