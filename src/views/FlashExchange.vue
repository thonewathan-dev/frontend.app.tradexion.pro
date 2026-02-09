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
              <h1 class="text-lg font-bold text-white">{{ t('flashExchange.title') }}</h1>
            </div>
            <button @click="showHistory = true" class="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Account type toggle -->
        <div class="px-4 pt-3 pb-1 flex justify-end">
          <div class="inline-flex rounded-full bg-white/10 p-0.5 text-xs">
            <button
              class="px-3 py-1 rounded-full transition-colors"
              :class="accountType === 'spot' ? 'bg-white text-[#0b1020] font-semibold' : 'text-white/70'"
              @click="setAccountType('spot')"
            >
              Spot
            </button>
            <button
              class="px-3 py-1 rounded-full transition-colors"
              :class="accountType === 'contract' ? 'bg-white text-[#0b1020] font-semibold' : 'text-white/70'"
              @click="setAccountType('contract')"
            >
              Contract
            </button>
          </div>
        </div>

        <div class="p-4 space-y-6">
          <!-- From Section -->
          <div>
            <!-- Row 1: From label | Wallet balance -->
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs text-white/60">{{ t('flashExchange.from') }}</span>
              <span class="text-xs text-white/60">
                <template v-if="walletsLoading">
                  <span class="inline-block h-3 w-24 rounded bg-white/10 animate-pulse"></span>
                </template>
                <template v-else>
                  Wallets {{ formatWalletBalance(fromBalance) }} {{ fromCurrency }}
                </template>
              </span>
            </div>
            <!-- Row 2: Coin selector | Input amount -->
            <div class="flex items-center justify-between gap-4">
              <button
                @click="showFromCurrencySelector = true"
                class="flex items-center gap-2"
              >
                <img :src="coinLogo(fromCurrency)" :alt="fromCurrency" class="w-7 h-7 object-contain flex-shrink-0" />
                <span class="text-white font-semibold text-lg flex items-center gap-1">
                  {{ fromCurrency }}
                  <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              <div class="flex-1 flex items-center gap-2 justify-end">
                <input
                  v-model="fromAmount"
                  type="number"
                  step="0.00000001"
                  @input="activeInput = 'from'"
                  class="w-full max-w-[180px] bg-transparent border-b border-white/20 px-2 py-2 focus:outline-none text-white text-xl font-semibold text-right"
                  placeholder="0.00000000"
                />
                <button
                  @click="setQuantity('all')"
                  class="text-xs font-semibold text-blue-300 hover:text-blue-200 transition-colors"
                >
                  Max
                </button>
              </div>
            </div>
          </div>

          <!-- Swap Button -->
          <div class="flex justify-center py-2">
            <button
              @click="swapCurrencies"
              class="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
            >
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          <!-- To Section -->
          <div>
            <!-- Row 1: To label | (empty right) -->
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs text-white/60">{{ t('flashExchange.to') }}</span>
              <span class="text-xs text-transparent select-none">.</span>
            </div>
            <!-- Row 2: Coin selector | Auto output amount (editable) -->
            <div class="flex items-center justify-between gap-4 mb-2">
              <button
                @click="showToCurrencySelector = true"
                class="flex items-center gap-2"
              >
                <img :src="coinLogo(toCurrency)" :alt="toCurrency" class="w-7 h-7 object-contain flex-shrink-0" />
                <span class="text-white font-semibold text-lg flex items-center gap-1">
                  {{ toCurrency }}
                  <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              <div class="flex-1 flex justify-end">
                <input
                  v-model="toAmount"
                  type="number"
                  step="0.00000001"
                  @input="activeInput = 'to'"
                  class="w-full max-w-[180px] bg-transparent border-b border-white/20 px-2 py-2 focus:outline-none text-white text-xl font-semibold text-right"
                  placeholder="0.00000000"
                />
              </div>
            </div>
            <!-- Row 3: Real-time price line -->
            <div class="flex items-center justify-end gap-2 text-sm text-white/60">
              <svg
                v-if="priceLoading"
                class="w-4 h-4 animate-spin text-white/60"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <span>{{ rateLabel }}</span>
            </div>
          </div>

          <!-- Preview Button -->
          <button
            @click="handleExchange"
            :disabled="loading || !fromAmount || parseFloat(fromAmount) <= 0"
            class="w-full mt-6 py-3 rounded-lg font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed glass-button-no-hover text-white"
          >
            {{ loading ? t('common.processing') : 'Preview' }}
          </button>
        </div>
      </main>
    </div>

    <!-- Preview Modal (Bottom Sheet) -->
    <div
      v-if="showPreview"
      class="fixed inset-0 z-50 flex items-end bg-black/50"
      @click.self="closePreview"
    >
      <div
        class="w-full min-h-[50vh] max-h-[85vh] bg-black/95 rounded-t-2xl px-6 pt-6 pb-8 space-y-6 shadow-lg border-t border-white/10 animate-slide-up"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-semibold text-white">Confirm Order</h2>
          <button
            class="p-1 rounded-full hover:bg-white/10 text-white/70"
            @click="closePreview"
            :disabled="loading"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-6 text-sm text-white/80">
          <div>
            <div class="text-xs text-white/60 mb-1.5">From</div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <img :src="coinLogo(fromCurrency)" :alt="fromCurrency" class="w-7 h-7 object-contain" />
                <span class="font-medium text-base">{{ fromCurrency }}</span>
              </div>
              <span class="font-semibold text-base">{{ fromAmount || '0' }}</span>
            </div>
            <div class="mt-2 text-xs text-white/60">
              {{ rateLabel }}
            </div>
          </div>

          <div class="pt-1">
            <div class="text-xs text-white/60 mb-1.5">To</div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <img :src="coinLogo(toCurrency)" :alt="toCurrency" class="w-7 h-7 object-contain" />
                <span class="font-medium text-base">{{ toCurrency }}</span>
              </div>
              <span class="font-semibold text-base">{{ toAmount || '0' }}</span>
            </div>
          </div>

          <!-- Type & Fee -->
          <div class="pt-2 space-y-2 border-t border-white/10 mt-1 pt-3">
            <div class="flex items-center justify-between text-xs text-white/70">
              <span>Type</span>
              <span class="font-medium text-white">Instant</span>
            </div>
            <div class="flex items-center justify-between text-xs text-white/70">
              <span>Transaction Fees</span>
              <span class="font-medium text-white">0 USDT</span>
            </div>
          </div>
        </div>

        <div class="pt-4">
          <button
            class="w-full py-3.5 rounded-lg glass-button-no-hover text-base font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="confirmExchange"
            :disabled="loading || isUpdatingPrice"
          >
            <span v-if="loading">
              {{ t('common.processing') }}
            </span>
            <span v-else-if="isUpdatingPrice">
              Updating...
            </span>
            <span v-else>
              Confirm ( {{ confirmCountdown }}s )
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- From Currency Selector -->
    <div
      v-if="showFromCurrencySelector"
      class="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
      @click.self="showFromCurrencySelector = false"
    >
      <div class="glass-card rounded-t-xl md:rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto animate-slide-up">
        <div class="sticky top-0 glass-card-no-hover border-b border-white/10 p-4 flex justify-between items-center">
          <h2 class="text-lg font-bold text-white">Select currency</h2>
          <button @click="showFromCurrencySelector = false" class="text-white/70 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-2">
          <button
            v-for="currency in availableCurrencies"
            :key="currency"
            @click="selectFromCurrency(currency)"
            class="w-full flex items-center p-4 border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors"
          >
            <div class="flex items-center gap-3">
              <img :src="coinLogo(currency)" :alt="currency" class="w-6 h-6 object-contain" />
              <div class="flex flex-col gap-0.5">
                <span class="text-white font-medium text-left">{{ currency }}</span>
                <span class="text-[11px] text-white/60 text-left">
                  Wallet: {{ formatWalletBalance(walletBalance(currency)) }} {{ currency }}
                </span>
              </div>
            </div>
            <svg
              v-if="fromCurrency === currency"
              class="w-5 h-5 text-blue-400 ml-auto"
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

    <!-- To Currency Selector -->
    <div
      v-if="showToCurrencySelector"
      class="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
      @click.self="showToCurrencySelector = false"
    >
      <div class="glass-card rounded-t-xl md:rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto animate-slide-up">
        <div class="sticky top-0 glass-card-no-hover border-b border-white/10 p-4 flex justify-between items-center">
          <h2 class="text-lg font-bold text-white">Select currency</h2>
          <button @click="showToCurrencySelector = false" class="text-white/70 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-2">
          <button
            v-for="currency in availableCurrencies.filter(c => c !== fromCurrency)"
            :key="currency"
            @click="selectToCurrency(currency)"
            class="w-full flex items-center p-4 border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors"
          >
            <div class="flex items-center gap-3">
              <img :src="coinLogo(currency)" :alt="currency" class="w-6 h-6 object-contain" />
              <div class="flex flex-col gap-0.5">
                <span class="text-white font-medium text-left">{{ currency }}</span>
                <span class="text-[11px] text-white/60 text-left">
                  Wallet: {{ formatWalletBalance(walletBalance(currency)) }} {{ currency }}
                </span>
              </div>
            </div>
            <svg
              v-if="toCurrency === currency"
              class="w-5 h-5 text-blue-400 ml-auto"
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

    <!-- History Modal -->
    <div
      v-if="showHistory"
      class="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
      @click.self="showHistory = false"
    >
      <div class="glass-card rounded-t-xl md:rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto animate-slide-up">
        <div class="sticky top-0 glass-card-no-hover border-b border-white/10 p-4 flex justify-between items-center">
          <h2 class="text-lg font-bold text-white">{{ t('flashExchange.history') }}</h2>
          <button @click="showHistory = false" class="text-white/70 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-4">
          <div
            v-for="exchange in exchangeHistory"
            :key="exchange.id"
            class="p-4 border-b border-white/10 last:border-b-0"
          >
            <div class="flex justify-between items-start mb-2">
              <div>
                <div class="text-white font-medium">{{ exchange.from_currency || exchange.fromCurrency }} → {{ exchange.to_currency || exchange.toCurrency }}</div>
                <div class="text-white/60 text-sm">{{ formatDate(exchange.created_at) }}</div>
              </div>
              <span class="px-2 py-1 rounded text-xs bg-green-500/20 text-green-300">
                Completed
              </span>
            </div>
            <div class="text-white/70 text-sm">
              {{ formatBalance(exchange.amount_from) }} {{ exchange.from_currency || exchange.fromCurrency }} =
              {{ formatBalance(exchange.amount_to) }} {{ exchange.to_currency || exchange.toCurrency }}
            </div>
          </div>
          <div v-if="exchangeHistory.length === 0" class="text-center text-white/60 py-8">
            {{ t('flashExchange.noHistory') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import MobileNav from '../components/MobileNav.vue';
import DesktopNav from '../components/DesktopNav.vue';
import api from '../utils/api';
import { useAlert } from '../composables/useAlert';
import { getCoinLogoUrl } from '../utils/coinLogos';

const { t } = useI18n();

const isMobile = computed(() => window.innerWidth < 768);

// Allowed currencies
const allowedCurrencies = ['USDT', 'BTC', 'ETH'];

const fromCurrency = ref('USDT');
const toCurrency = ref('BTC');
const fromAmount = ref('');
const toAmount = ref('');
const activeInput = ref('from'); // 'from' or 'to'
const showPreview = ref(false);
const confirmCountdown = ref(8);
const isUpdatingPrice = ref(false);
let confirmTimer = null;
const quantityMode = ref('currency'); // 'currency' or 'all'
const loading = ref(false);
const showFromCurrencySelector = ref(false);
const showToCurrencySelector = ref(false);
const showFromBalanceSelector = ref(false);
const showHistory = ref(false);
const wallets = ref([]);
const walletsLoading = ref(true);
const exchangeHistory = ref([]);

const { showError, showSuccess } = useAlert();

const availableCurrencies = computed(() => allowedCurrencies);

const fromBalance = computed(() => {
  const wallet = wallets.value.find(w => w.currency === fromCurrency.value);
  return wallet ? wallet.balance : 0;
});

const walletBalance = (currency) => {
  const wallet = wallets.value.find(w => w.currency === currency);
  return wallet ? wallet.balance : 0;
};

const coinLogo = (currency) => {
  return getCoinLogoUrl(currency) || '';
};

// Account type: spot or contract
const accountType = ref('spot'); // 'spot' | 'contract'

// Real-time prices (vs USDT)
const prices = ref({
  BTCUSDT: null,
  ETHUSDT: null,
});
const priceLoading = ref(false);
let priceInterval = null;

// Helper: get value of 1 unit of a currency in USDT
const priceInUSDT = (symbol) => {
  if (symbol === 'USDT') return 1;
  if (symbol === 'BTC') return prices.value.BTCUSDT || null;
  if (symbol === 'ETH') return prices.value.ETHUSDT || null;
  return null;
};

const currentRate = computed(() => {
  const fromPrice = priceInUSDT(fromCurrency.value);
  const toPrice = priceInUSDT(toCurrency.value);
  if (!fromPrice || !toPrice) return 0;
  // 1 FROM = (fromPrice / toPrice) TO
  return fromPrice / toPrice;
});

const rateLabel = computed(() => {
  if (!currentRate.value) return '--';
  const base = fromCurrency.value;
  const quote = toCurrency.value;
  const amount = currentRate.value;

  let formatted;
  if (amount >= 1) {
    formatted = amount.toFixed(2);
  } else {
    // For small numbers, always show a full decimal (no scientific notation)
    formatted = amount.toFixed(8);
    // Trim trailing zeros but keep at least one decimal digit
    formatted = formatted.replace(/0+$/, '').replace(/\.$/, '.0');
  }

  return `1 ${base} = ${formatted} ${quote}`;
});

const formatBalance = (balance) => {
  const num = parseFloat(balance);
  if (Number.isNaN(num)) return '0.00';
  if (num >= 1) return num.toFixed(2);
  if (num >= 0.01) return num.toFixed(4);
  return num.toFixed(8);
};

// For wallet display / Max button: show real balance up to 8 decimals without rounding up
const formatWalletBalance = (balance) => {
  const num = Number(balance) || 0;
  const floored = Math.floor(num * 1e8) / 1e8;
  // trim trailing zeros
  return floored.toFixed(8).replace(/0+$/, '').replace(/\.$/, '');
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
};

const selectFromCurrency = (currency) => {
  if (currency === toCurrency.value) {
    // Swap if selecting the same currency
    toCurrency.value = fromCurrency.value;
  }
  fromCurrency.value = currency;
  showFromCurrencySelector.value = false;
  loadWallets();
};

const selectToCurrency = (currency) => {
  if (currency === fromCurrency.value) {
    // Swap if selecting the same currency
    fromCurrency.value = toCurrency.value;
  }
  toCurrency.value = currency;
  showToCurrencySelector.value = false;
};

const swapCurrencies = () => {
  const temp = fromCurrency.value;
  fromCurrency.value = toCurrency.value;
  toCurrency.value = temp;
  loadWallets();
};

const setQuantity = (mode) => {
  quantityMode.value = mode;
  if (mode === 'all') {
    // Use the raw balance (floored to 8 decimals) so we never exceed available balance
    const raw = Number(fromBalance.value) || 0;
    const floored = Math.floor(raw * 1e8) / 1e8;
    fromAmount.value = floored.toString();
    activeInput.value = 'from';
  }
};

// Sync amounts when user types
const syncAmounts = () => {
  if (!currentRate.value) {
    toAmount.value = '';
    return;
  }

  if (activeInput.value === 'from') {
    const val = parseFloat(fromAmount.value);
    if (!val || val <= 0) {
      toAmount.value = '';
      return;
    }
    toAmount.value = (val * currentRate.value).toFixed(8);
  } else if (activeInput.value === 'to') {
    const val = parseFloat(toAmount.value);
    if (!val || val <= 0) {
      fromAmount.value = '';
      return;
    }
    fromAmount.value = (val / currentRate.value).toFixed(8);
  }
};

const loadWallets = async () => {
  try {
    if (!wallets.value.length) {
      walletsLoading.value = true;
    }
    // Load wallets for selected account type
    const response = await api.get('/wallet', {
      params: { account_type: accountType.value },
    });
    wallets.value = response.data.wallets || [];
  } catch (error) {
    console.error('Error loading wallets:', error);
  } finally {
    walletsLoading.value = false;
  }
};

const setAccountType = (type) => {
  if (type === accountType.value) return;
  accountType.value = type;
  // Reset amounts when switching account type
  fromAmount.value = '';
  toAmount.value = '';
  loadWallets();
};

const loadPrices = async () => {
  try {
    priceLoading.value = true;
    const [btcRes, ethRes] = await Promise.all([
      api.get('/market/ticker/BTCUSDT'),
      api.get('/market/ticker/ETHUSDT'),
    ]);
    const parsePrice = (data) => parseFloat(data.price || data.lastPrice || data.close || 0);
    prices.value.BTCUSDT = parsePrice(btcRes.data);
    prices.value.ETHUSDT = parsePrice(ethRes.data);
  } catch (error) {
    console.error('Error loading prices for flash exchange:', error);
  } finally {
    priceLoading.value = false;
  }
};

// Recalculate amounts whenever rate or currencies change
watch([currentRate, fromCurrency, toCurrency, fromAmount, toAmount, activeInput, showPreview, isUpdatingPrice], () => {
  // While preview is open and not in the middle of an update, keep values frozen
  if (showPreview.value && !isUpdatingPrice.value) return;
  syncAmounts();
});

const loadExchangeHistory = async () => {
  try {
    // This endpoint would need to be created in the backend
    const response = await api.get('/exchange/history').catch(() => {
      return { data: { exchanges: [] } };
    });
    exchangeHistory.value = response.data.exchanges || [];
  } catch (error) {
    console.error('Error loading exchange history:', error);
    exchangeHistory.value = [];
  }
};

const handleExchange = () => {
  const amountFrom = parseFloat(fromAmount.value);

  if (!amountFrom || amountFrom <= 0) {
    showError('Please enter a valid exchange quantity');
    return;
  }

  if (amountFrom > fromBalance.value) {
    showError('Insufficient balance');
    return;
  }

  // Open preview and start countdown
  showPreview.value = true;
  confirmCountdown.value = 8;
  isUpdatingPrice.value = false;

  if (confirmTimer) {
    clearInterval(confirmTimer);
    confirmTimer = null;
  }

  confirmTimer = setInterval(async () => {
    if (confirmCountdown.value > 0) {
      confirmCountdown.value -= 1;
      return;
    }

    // When countdown hits 0, briefly show "Updating..." and refresh price
    try {
      isUpdatingPrice.value = true;
      await loadPrices();
      syncAmounts();
    } finally {
      confirmCountdown.value = 8;
      isUpdatingPrice.value = false;
    }
  }, 1000);
};

const closePreview = () => {
  showPreview.value = false;
  if (confirmTimer) {
    clearInterval(confirmTimer);
    confirmTimer = null;
  }
  isUpdatingPrice.value = false;
  confirmCountdown.value = 8;
};

const confirmExchange = async () => {
  const amountFrom = parseFloat(fromAmount.value);
  if (!amountFrom || amountFrom <= 0) {
    showError('Please enter a valid exchange quantity');
    return;
  }

  if (amountFrom > fromBalance.value) {
    showError('Insufficient balance');
    return;
  }

  loading.value = true;
  try {
    await api.post('/exchange', {
      fromCurrency: fromCurrency.value,
      toCurrency: toCurrency.value,
      amount: amountFrom,
      accountType: accountType.value,
    });

    showSuccess('Exchange completed successfully!');
    fromAmount.value = '';
    toAmount.value = '';
    showPreview.value = false;
    if (confirmTimer) {
      clearInterval(confirmTimer);
      confirmTimer = null;
    }
    await Promise.all([loadWallets(), loadExchangeHistory()]);
  } catch (error) {
    showError(error.response?.data?.error || 'Exchange failed');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadWallets();
  loadExchangeHistory();
  loadPrices();
  // Only auto-refresh prices when preview is not open
  priceInterval = setInterval(() => {
    if (!showPreview.value) {
      loadPrices();
    }
  }, 3000);
});

onUnmounted(() => {
  if (priceInterval) {
    clearInterval(priceInterval);
    priceInterval = null;
  }
});
</script>