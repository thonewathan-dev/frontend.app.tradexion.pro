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
              <h1 class="text-lg font-bold text-white">Transfer</h1>
            </div>
          </div>
        </div>

        <div class="p-4 space-y-4">
          <!-- From Account -->
          <div>
            <label class="block text-xs text-white/70 mb-1.5">From</label>
            <div class="flex gap-2">
              <button
                v-for="option in fromOptions"
                :key="option.value"
                @click="transferFrom = option.value"
                :class="[
                  'flex-1 py-2.5 px-3 rounded-lg text-sm font-medium border transition-colors',
                  transferFrom === option.value
                    ? 'bg-teal-500/20 text-teal-300 border-teal-400/60'
                    : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                ]"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <!-- To Account (auto-set based on From) -->
          <div>
            <label class="block text-xs text-white/70 mb-1.5">To</label>
            <div class="px-4 py-3 glass-input rounded-lg text-white/90">
              {{ transferTo === 'spot' ? 'Spot account' : 'Contract account' }}
            </div>
            <p class="text-xs text-white/50 mt-1.5">Automatically set based on source account</p>
          </div>

          <!-- Currency Selection -->
          <div>
            <label class="block text-xs text-white/70 mb-1.5">Currency</label>
            <button
              @click="showCurrencyPopup = true"
              class="w-full px-4 py-3 glass-input rounded-lg flex items-center justify-between hover:bg-white/10 transition-colors"
            >
              <div class="flex items-center gap-3">
                <img
                  v-if="coinLogo(transferCurrency)"
                  :src="coinLogo(transferCurrency)"
                  :alt="transferCurrency"
                  class="w-6 h-6 object-contain"
                />
                <div
                  v-else
                  class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[11px] text-white/70"
                >
                  {{ transferCurrency }}
                </div>
                <div class="text-left">
                  <div class="text-sm font-medium text-white">{{ transferCurrency }}</div>
                  <div class="text-[11px] text-white/60">
                    Available: {{ formatBalance(getAvailableFor(transferCurrency)) }} {{ transferCurrency }}
                  </div>
                </div>
              </div>
              <svg class="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <!-- Amount Input -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-xs text-white/70">Amount</label>
              <div class="flex items-center gap-2">
                <span class="text-xs text-white/50">
                  Available:
                  <span class="text-white font-medium">
                    {{ formatBalance(availableTransferAmount) }} {{ transferCurrency }}
                  </span>
                </span>
                <button
                  @click="setMaxAmount"
                  class="px-2 py-0.5 text-xs glass-button rounded text-white hover:bg-white/20 transition-colors"
                >
                  Max
                </button>
              </div>
            </div>
            <input
              v-model="transferAmount"
              type="number"
              step="0.00000001"
              class="w-full px-4 py-3 glass-input rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-white placeholder-white/50"
              placeholder="Enter amount"
            />
          </div>

          <!-- Transfer Button -->
          <button
            @click="handleTransfer"
            :disabled="loading"
            class="w-full py-3 glass-button rounded-lg text-sm font-medium text-white hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Processing...' : 'Transfer' }}
          </button>
        </div>

        <!-- Currency Selection Popup -->
        <div
          v-if="showCurrencyPopup"
          class="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
          @click.self="showCurrencyPopup = false"
        >
          <div class="glass-card rounded-t-lg md:rounded-lg w-full max-w-md animate-slide-up max-h-[80vh] overflow-y-auto">
            <div class="sticky top-0 glass-card-no-hover border-b border-white/10 p-3 flex justify-between items-center">
              <h2 class="text-base font-bold text-white">Select Currency</h2>
              <button @click="showCurrencyPopup = false" class="text-white/70 hover:text-white">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="p-3 space-y-2">
              <button
                v-for="c in currencies"
                :key="c"
                @click="selectCurrency(c)"
                :class="[
                  'w-full px-4 py-3 rounded-lg flex items-center justify-between transition-colors',
                  transferCurrency === c
                    ? 'bg-teal-500/20 border border-teal-400/60'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                ]"
              >
                <div class="flex items-center gap-3">
                  <img
                    v-if="coinLogo(c)"
                    :src="coinLogo(c)"
                    :alt="c"
                    class="w-7 h-7 object-contain"
                  />
                  <div
                    v-else
                    class="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/70"
                  >
                    {{ c }}
                  </div>
                  <div class="text-left">
                    <div class="text-sm font-medium text-white">{{ c }}</div>
                    <div class="text-[11px] text-white/60">
                      Available: {{ formatBalance(getAvailableFor(c)) }} {{ c }}
                    </div>
                  </div>
                </div>
                <svg
                  v-if="transferCurrency === c"
                  class="w-5 h-5 text-teal-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAlert } from '../composables/useAlert';
import MobileNav from '../components/MobileNav.vue';
import DesktopNav from '../components/DesktopNav.vue';
import api from '../utils/api';
import { getCoinLogoUrl } from '../utils/coinLogos';

const router = useRouter();
const { showSuccess, showError, showWarning } = useAlert();

const isMobile = computed(() => window.innerWidth < 768);

const wallets = ref([]);
const loading = ref(false);
const transferFrom = ref('spot');
const transferTo = ref('contract');
const transferCurrency = ref('USDT');
const transferAmount = ref('');
const showCurrencyPopup = ref(false);

const fromOptions = [
  { value: 'spot', label: 'Spot account' },
  { value: 'contract', label: 'Contract account' },
];

const currencies = ['USDT', 'BTC', 'ETH'];

// Auto-update "To" account when "From" account changes
watch(transferFrom, (newFrom) => {
  transferTo.value = newFrom === 'spot' ? 'contract' : 'spot';
});

const availableTransferAmount = computed(() => {
  if (!transferFrom.value || !transferCurrency.value) {
    return 0;
  }
  
  const from = transferFrom.value.toLowerCase();
  const currency = transferCurrency.value.toUpperCase();
  const wallet = wallets.value.find(
    w => (w.account_type || 'spot').toLowerCase() === from && (w.currency || '').toUpperCase() === currency
  );
  
  if (!wallet) return 0;
  
  const balance = Math.max(0, parseFloat(wallet.balance || 0));
  const locked = Math.max(0, parseFloat(wallet.locked_balance || 0));
  return Math.max(0, balance - locked);
});

const getAvailableFor = (currency) => {
  if (!transferFrom.value || !currency) return 0;
  const from = transferFrom.value.toLowerCase();
  const cur = currency.toUpperCase();
  const wallet = wallets.value.find(
    (w) => (w.account_type || 'spot').toLowerCase() === from && (w.currency || '').toUpperCase() === cur,
  );
  if (!wallet) return 0;
  const balance = Math.max(0, parseFloat(wallet.balance || 0));
  const locked = Math.max(0, parseFloat(wallet.locked_balance || 0));
  return Math.max(0, balance - locked);
};

const selectCurrency = (currency) => {
  transferCurrency.value = currency;
  showCurrencyPopup.value = false;
  // Clear amount when currency changes
  transferAmount.value = '';
};

const formatBalance = (balance) => {
  const num = Number(balance) || 0;
  // Floor to 8 decimal places so we never exceed the real balance
  const floored = Math.floor(num * 1e8) / 1e8;
  // Show up to 8 decimals, trimming trailing zeros
  return (
    floored
      .toFixed(8)
      .replace(/0+$/, '')
      .replace(/\.$/, '') || '0'
  );
};

const coinLogo = (currency) => {
  return getCoinLogoUrl(currency) || '';
};

const setMaxAmount = () => {
  transferAmount.value = formatBalance(availableTransferAmount.value);
};

const loadWallets = async () => {
  try {
    const response = await api.get('/wallet');
    wallets.value = (response.data.wallets || []).map(w => ({
      ...w,
      account_type: w.account_type || 'spot',
    }));
  } catch (error) {
    console.error('Error loading wallets:', error);
    showError('Failed to load wallets');
  }
};

const handleTransfer = async () => {
  const amountNum = parseFloat(transferAmount.value);
  
  if (!amountNum || amountNum <= 0) {
    showWarning('Please enter a valid amount');
    return;
  }
  
  if (transferFrom.value === transferTo.value) {
    showWarning('Cannot transfer to the same account');
    return;
  }
  
  if (amountNum > availableTransferAmount.value) {
    showError(`Insufficient balance. Available: ${formatBalance(availableTransferAmount.value)} ${transferCurrency.value}`);
    return;
  }
  
  loading.value = true;
  try {
    await api.post('/wallet/transfer', {
      from: transferFrom.value,
      to: transferTo.value,
      currency: transferCurrency.value,
      amount: amountNum,
    });
    
    showSuccess('Transfer successful!');
    transferAmount.value = '';
    await loadWallets();
  } catch (error) {
    console.error('Transfer failed:', error);
    showError(error.response?.data?.error || 'Transfer failed');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadWallets();
});
</script>
