<template>
  <div class="min-h-screen">
    <MobileNav v-if="isMobile" />
    <div class="md:flex">
      <DesktopNav v-if="!isMobile" />
      <main class="flex-1 pb-16 md:pb-0">
        <!-- Header -->
        <div class="glass-card-no-hover border-b border-white/10 px-4 py-3">
          <div class="flex items-center justify-between">
            <h1 class="text-xl font-bold text-white">{{ t('staking.title') }}</h1>
            <button
              @click="showRecords = true"
              class="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          </div>
        </div>

        <div class="p-4">
          <!-- Staking Options -->
          <div class="space-y-4">
            <div
              v-for="option in stakingOptions"
              :key="option.days"
              class="glass-card rounded-xl p-6"
            >
              <!-- Title -->
              <div class="text-white font-semibold text-lg mb-4">
                {{ t('staking.lockUpToEarn') }} {{ option.days }}{{ t('staking.day') }}
              </div>
              
              <!-- Number of Deposits -->
              <div class="mb-3">
                <div class="text-white/70 text-sm mb-1">{{ t('staking.numberOfDeposits') }}</div>
                <div class="text-white font-medium">{{ formatAmount(option.minDeposit) }} USDT</div>
              </div>
              
              <!-- Total Revenue -->
              <div class="mb-4">
                <div class="text-white/70 text-sm mb-1">{{ t('staking.totalRevenue') }}:</div>
                <div class="text-white font-medium">{{ formatAmount(option.totalRevenue) }} USDT</div>
              </div>
              
              <!-- BUY Button -->
              <button
                @click="handleBuy(option)"
                class="w-full py-3 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/50 rounded-lg font-medium text-white transition-all active:scale-[0.98]"
              >
                {{ t('staking.buy') }}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Reminder Modal -->
    <div
      v-if="showReminder"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="closeReminder"
    >
      <div class="glass-card rounded-xl w-full max-w-md p-6 animate-slide-up">
        <h2 class="text-xl font-bold text-white mb-4">{{ t('staking.kindlyReminder') }}</h2>
        <p class="text-white/80 text-sm leading-relaxed mb-6">
          {{ t('staking.reminderText') }}
        </p>
        <button
          @click="closeReminder"
          class="w-full py-3 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/50 rounded-lg font-medium text-white transition-all active:scale-[0.98]"
        >
          {{ t('staking.sure') }}
        </button>
      </div>
    </div>

    <!-- Staking Records Modal -->
    <div
      v-if="showRecords"
      class="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
      @click.self="showRecords = false"
    >
      <div class="glass-card rounded-t-xl md:rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
        <div class="sticky top-0 glass-card-no-hover border-b border-white/10 p-4 flex justify-between items-center">
          <h2 class="text-lg font-bold text-white">{{ t('staking.records') }}</h2>
          <button @click="showRecords = false" class="text-white/70 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-4">
          <div v-if="stakingRecords.length === 0" class="text-center py-8 text-white/60">
            {{ t('staking.noRecords') }}
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="record in stakingRecords"
              :key="record.id"
              class="glass-card-no-hover rounded-lg p-4 border border-white/10"
            >
              <div class="flex justify-between items-start mb-2">
                <div>
                  <div class="text-white font-medium">{{ record.days }} Day Staking</div>
                  <div class="text-white/60 text-sm">{{ formatDate(record.createdAt) }}</div>
                </div>
                <div
                  :class="[
                    'px-2 py-1 rounded text-xs font-medium',
                    record.status === 'active' ? 'bg-green-500/20 text-green-300' :
                    record.status === 'completed' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-gray-500/20 text-gray-300'
                  ]"
                >
                  {{ record.status }}
                </div>
              </div>
              <div class="text-white/80 text-sm">
                {{ t('staking.amountLabel') }}: {{ formatAmount(record.amount) }} USDT
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Buy Modal -->
    <div
      v-if="showBuyModal"
      class="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
      @click.self="showBuyModal = false"
    >
      <div class="glass-card rounded-t-xl md:rounded-xl w-full max-w-md animate-slide-up">
        <div class="sticky top-0 glass-card-no-hover border-b border-white/10 p-4 flex justify-between items-center">
          <h2 class="text-lg font-bold text-white">{{ t('staking.stakeUSDT') }}</h2>
          <button @click="showBuyModal = false" class="text-white/70 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-4 space-y-4">
          <div>
            <div class="text-white/70 text-sm mb-2">{{ t('staking.lockPeriod') }}</div>
            <div class="text-white font-medium">{{ selectedOption?.days }} {{ t('staking.days') }}</div>
          </div>
          <div>
            <div class="text-white/70 text-sm mb-2">{{ t('staking.minDeposit') }}</div>
            <div class="text-white font-medium">{{ formatAmount(selectedOption?.minDeposit || 0) }} USDT</div>
          </div>
          <div>
            <label class="block text-sm text-white/70 mb-2">{{ t('staking.amount') }}</label>
            <input
              v-model="stakeAmount"
              type="number"
              step="0.00000001"
              :min="selectedOption?.minDeposit || 0"
              class="w-full px-4 py-2 glass-input rounded-lg focus:outline-none text-white"
              placeholder="0.00000000"
            />
            <div class="text-xs text-white/50 mt-1">
              {{ t('staking.minimum') }}: {{ formatAmount(selectedOption?.minDeposit || 0) }} USDT
            </div>
          </div>
          <button
            @click="handleConfirmStake"
            :disabled="loading || !isValidAmount"
            class="w-full py-3 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/50 rounded-lg font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {{ loading ? t('common.processing') : t('staking.confirmStake') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import MobileNav from '../components/MobileNav.vue';
import DesktopNav from '../components/DesktopNav.vue';

const { t } = useI18n();

const router = useRouter();
const isMobile = computed(() => window.innerWidth < 768);

// Reminder modal - show on first visit
const showReminder = ref(false);
const hasSeenReminder = localStorage.getItem('hasSeenStakingReminder') === 'true';

// Staking options
const stakingOptions = ref([
  { days: 1, minDeposit: 300, totalRevenue: 0 },
  { days: 3, minDeposit: 1000, totalRevenue: 0 },
  { days: 5, minDeposit: 5000, totalRevenue: 0 },
  { days: 7, minDeposit: 30000, totalRevenue: 0 },
  { days: 15, minDeposit: 50000, totalRevenue: 0 },
  { days: 30, minDeposit: 100000, totalRevenue: 0 },
]);

const showRecords = ref(false);
const showBuyModal = ref(false);
const selectedOption = ref(null);
const stakeAmount = ref('');
const loading = ref(false);
const stakingRecords = ref([]);

const isValidAmount = computed(() => {
  if (!selectedOption.value || !stakeAmount.value) return false;
  const amount = parseFloat(stakeAmount.value);
  return amount >= selectedOption.value.minDeposit && amount > 0;
});

const formatAmount = (amount) => {
  return parseFloat(amount).toFixed(8);
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const closeReminder = () => {
  showReminder.value = false;
  localStorage.setItem('hasSeenStakingReminder', 'true');
};

const handleBuy = (option) => {
  selectedOption.value = option;
  stakeAmount.value = '';
  showBuyModal.value = true;
};

const handleConfirmStake = async () => {
  if (!isValidAmount.value) {
    alert('Please enter a valid amount');
    return;
  }

  loading.value = true;
  try {
    // TODO: Implement actual staking API call
    // await api.post('/staking/stake', {
    //   days: selectedOption.value.days,
    //   amount: parseFloat(stakeAmount.value),
    // });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert('Staking successful!');
    showBuyModal.value = false;
    stakeAmount.value = '';
    // Refresh staking records
    // loadStakingRecords();
  } catch (error) {
    alert(error.response?.data?.error || 'Staking failed');
  } finally {
    loading.value = false;
  }
};

const loadStakingRecords = async () => {
  try {
    // TODO: Implement actual API call
    // const response = await api.get('/staking/records');
    // stakingRecords.value = response.data;
  } catch (error) {
    console.error('Error loading staking records:', error);
  }
};

onMounted(() => {
  // Show reminder if user hasn't seen it
  if (!hasSeenReminder) {
    showReminder.value = true;
  }
  loadStakingRecords();
});
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
