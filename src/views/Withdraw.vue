<template>
  <div class="min-h-screen">
    <MobileNav v-if="isMobile" />
    <div class="md:flex">
      <DesktopNav v-if="!isMobile" />
      <main class="flex-1 pb-16 md:pb-0">
        <!-- Header -->
        <div class="glass-card-no-hover border-b border-white/10 px-4 py-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="$router.back()" class="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 class="text-lg font-bold text-white">{{ t('withdraw.title') }}</h1>
            </div>
            <button @click="showHistory = true" class="text-sm text-white/70 hover:text-white transition-colors">
              {{ t('withdraw.history') }}
            </button>
          </div>
        </div>

        <div class="p-4 space-y-4">
          <!-- Currency Selection -->
          <div>
            <div class="flex items-center justify-between">
              <span class="text-white font-medium text-base">{{ selectedCurrency }}</span>
              <button
                @click="showCurrencySelector = true"
                class="flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors"
              >
                {{ t('withdraw.selectCurrency') }}
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Network Selection -->
          <div v-if="availableNetworks.length > 1">
            <div class="flex gap-2">
              <button
                v-for="network in availableNetworks"
                :key="network"
                @click="selectedNetwork = network"
                :class="[
                  'flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors border',
                  selectedNetwork === network
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                    : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                ]"
              >
                {{ network }}
              </button>
            </div>
          </div>
          <!-- Single network display (for BTC and ETH) -->
          <div v-else-if="availableNetworks.length === 1" class="text-white/70 text-sm">
            {{ t('withdraw.network') }}: <span class="text-white font-medium">{{ availableNetworks[0] }}</span>
          </div>

          <!-- Extractable Quantity -->
          <div>
            <div class="text-white/70 text-sm mb-1">{{ t('withdraw.extractableQuantity') }}</div>
            <div class="flex items-center justify-between">
              <span class="text-white text-lg font-medium">{{ formatBalance(extractableQuantity) }}</span>
              <span class="text-white/70 text-sm">{{ selectedCurrency }}</span>
            </div>
          </div>

          <!-- Withdrawal Address -->
          <div>
            <input
              v-model="withdrawAddress"
              type="text"
              class="w-full px-4 py-3 glass-input rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              :placeholder="t('withdraw.enterAddress')"
            />
            <p class="text-xs text-yellow-400/80 mt-1.5">{{ t('withdraw.addressWarning') }}</p>
          </div>

          <!-- Amount Input -->
          <div>
            <div class="text-white/70 text-sm mb-1">{{ t('withdraw.amount') }}</div>
            <div class="flex items-center gap-2">
              <input
                v-model="withdrawAmount"
                type="number"
                step="0.00000001"
                min="0"
                class="flex-1 px-4 py-3 glass-input rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                :placeholder="'0'"
              />
              <span class="text-white/70 text-sm px-2">{{ selectedCurrency }}</span>
              <div class="w-px h-6 bg-white/20"></div>
              <button
                @click="setMaxAmount"
                class="text-sm text-white/70 hover:text-white transition-colors px-2"
              >
                {{ t('common.all') }}
              </button>
            </div>
          </div>

          <!-- Fee Information -->
          <div class="text-white/70 text-sm">
            {{ t('withdraw.fee') }}: <span class="text-white font-medium">{{ feePercent }}% {{ selectedCurrency }}</span>
          </div>

          <!-- Arrived Amount -->
          <div class="text-white/70 text-sm">
            {{ t('withdraw.arrivedAmount') }}: <span class="text-white font-medium text-base">{{ formatBalance(arrivedAmount) }} {{ selectedCurrency }}</span>
          </div>

          <!-- Withdraw Button -->
          <button
            @click="handleWithdraw"
            :disabled="loading || !canWithdraw"
            :class="[
              'w-full py-4 rounded-lg font-bold text-white text-base transition-all',
              canWithdraw && !loading
                ? 'bg-teal-500 hover:bg-teal-600 active:bg-teal-700'
                : 'bg-white/10 text-white/50 cursor-not-allowed'
            ]"
          >
            {{ loading ? t('common.processing') : t('withdraw.button') }}
          </button>
        </div>
      </main>
    </div>

    <!-- Currency Selector Modal -->
    <div
      v-if="showCurrencySelector"
      class="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
      @click.self="showCurrencySelector = false"
    >
      <div class="glass-card rounded-t-lg md:rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto animate-slide-up">
        <div class="sticky top-0 glass-card-no-hover border-b border-white/10 p-4 flex justify-between items-center">
          <h2 class="text-lg font-bold text-white">{{ t('withdraw.selectCurrency') }}</h2>
          <button @click="showCurrencySelector = false" class="text-white/70 hover:text-white">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-4">
          <div
            v-for="currency in availableCurrencies"
            :key="currency"
            @click="selectCurrency(currency)"
            class="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
          >
            <span class="text-white font-medium">{{ currency }}</span>
            <svg
              v-if="selectedCurrency === currency"
              class="w-5 h-5 text-teal-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- History Modal -->
    <div
      v-if="showHistory"
      class="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
      @click.self="showHistory = false"
    >
      <div class="glass-card rounded-t-lg md:rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto animate-slide-up">
        <div class="sticky top-0 glass-card-no-hover border-b border-white/10 p-4 flex justify-between items-center">
          <h2 class="text-lg font-bold text-white">{{ t('withdraw.history') }}</h2>
          <button @click="showHistory = false" class="text-white/70 hover:text-white">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-4">
          <div v-if="withdrawHistory.length === 0" class="text-center py-12">
            <p class="text-white/60">{{ t('withdraw.noHistory') }}</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="(item, index) in withdrawHistory"
              :key="index"
              class="glass-card rounded-lg p-3"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-white font-medium">{{ item.currency }}</span>
                <span :class="[
                  'text-sm font-medium',
                  item.status === 'completed' ? 'text-green-400' : item.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                ]">
                  {{ t(`withdraw.status.${item.status}`) }}
                </span>
              </div>
              <div class="text-white/70 text-xs mb-1">{{ t('withdraw.amount') }}: {{ formatBalance(item.amount) }} {{ item.currency }}</div>
              <div class="text-white/70 text-xs mb-1">{{ t('withdraw.address') }}: {{ item.address }}</div>
              <div class="text-white/70 text-xs">{{ new Date(item.created_at).toLocaleString() }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/auth';
import { useAlert } from '../composables/useAlert';
import MobileNav from '../components/MobileNav.vue';
import DesktopNav from '../components/DesktopNav.vue';
import api from '../utils/api';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const { showSuccess, showError, showWarning } = useAlert();

const isMobile = computed(() => window.innerWidth < 768);

const selectedCurrency = ref('USDT');
const selectedNetwork = ref('ERC20');
const withdrawAddress = ref('');
const withdrawAmount = ref('');
const showCurrencySelector = ref(false);
const showHistory = ref(false);
const loading = ref(false);
const extractableQuantity = ref(0);
const withdrawHistory = ref([]);

const availableCurrencies = ['USDT', 'BTC', 'ETH'];
const feePercent = 2;

const availableNetworks = computed(() => {
  if (selectedCurrency.value === 'USDT') {
    return ['ERC20', 'TRC20'];
  } else if (selectedCurrency.value === 'BTC') {
    return ['BTC'];
  } else if (selectedCurrency.value === 'ETH') {
    return ['ERC20'];
  }
  return [];
});

const arrivedAmount = computed(() => {
  const amount = parseFloat(withdrawAmount.value) || 0;
  const fee = amount * (feePercent / 100);
  return Math.max(0, amount - fee);
});

const canWithdraw = computed(() => {
  const amount = parseFloat(withdrawAmount.value) || 0;
  return (
    withdrawAddress.value.trim().length > 0 &&
    amount > 0 &&
    amount <= extractableQuantity.value &&
    withdrawAddress.value.trim().indexOf(' ') === -1
  );
});

const formatBalance = (value) => {
  const num = parseFloat(value) || 0;
  if (num === 0) return '0.00000000';
  if (num < 0.00001) return num.toFixed(8);
  if (num < 1) return num.toFixed(6);
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 });
};

const selectCurrency = (currency) => {
  selectedCurrency.value = currency;
  showCurrencySelector.value = false;
  // Reset network based on currency
  if (currency === 'USDT') {
    selectedNetwork.value = 'ERC20';
  } else if (currency === 'BTC') {
    selectedNetwork.value = 'BTC';
  } else if (currency === 'ETH') {
    selectedNetwork.value = 'ERC20';
  }
  loadExtractableQuantity();
};

const setMaxAmount = () => {
  withdrawAmount.value = extractableQuantity.value.toString();
};

const loadExtractableQuantity = async () => {
  try {
    const response = await api.get('/wallet/balance', {
      params: { account_type: 'spot' }
    });
    const usdtBalance = response.data.balances?.find(b => b.currency === selectedCurrency.value);
    extractableQuantity.value = usdtBalance?.available || 0;
  } catch (error) {
    console.error('Error loading extractable quantity:', error);
    extractableQuantity.value = 0;
  }
};

const loadWithdrawHistory = async () => {
  try {
    const response = await api.get('/wallet/withdrawals');
    withdrawHistory.value = response.data.withdrawals || [];
  } catch (error) {
    console.error('Error loading withdraw history:', error);
    withdrawHistory.value = [];
  }
};

const handleWithdraw = async () => {
  if (!canWithdraw.value) {
    showError(t('withdraw.invalidInput'));
    return;
  }

  const amount = parseFloat(withdrawAmount.value);
  if (amount > extractableQuantity.value) {
    showError(t('withdraw.insufficientBalance'));
    return;
  }

  if (withdrawAddress.value.trim().indexOf(' ') !== -1) {
    showWarning(t('withdraw.addressWarning'));
    return;
  }

  loading.value = true;
  try {
    await api.post('/wallet/withdraw', {
      currency: selectedCurrency.value,
      amount: amount,
      address: withdrawAddress.value.trim(),
      network: selectedNetwork.value,
    });
    
    showSuccess(t('withdraw.success'));
    withdrawAddress.value = '';
    withdrawAmount.value = '';
    await loadExtractableQuantity();
    await loadWithdrawHistory();
  } catch (error) {
    console.error('Withdraw error:', error);
    showError(error.response?.data?.error || t('withdraw.error'));
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await loadExtractableQuantity();
  await loadWithdrawHistory();
});
</script>
