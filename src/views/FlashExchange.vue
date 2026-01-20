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

        <div class="p-4">
          <!-- Exchange Form -->
          <div class="glass-card rounded-xl p-4 space-y-4">
            <!-- From Section -->
            <div>
              <label class="block text-xs text-white/60 mb-2">{{ t('flashExchange.from') }}</label>
              <div class="flex items-center justify-between pb-3 border-b border-white/10">
                <div class="flex items-center gap-3">
                  <span class="text-white font-semibold text-lg">{{ fromCurrency }}</span>
                  <button
                    @click="showFromCurrencySelector = true"
                    class="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <svg class="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-white/70 text-sm">{{ formatBalance(fromBalance) }}</span>
                  <button
                    @click="showFromBalanceSelector = true"
                    class="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <svg class="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Exchange Arrow -->
            <div class="flex justify-center py-2">
              <button
                @click="swapCurrencies"
                class="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <svg class="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
            </div>

            <!-- To Section -->
            <div>
              <label class="block text-xs text-white/60 mb-2">{{ t('flashExchange.to') }}</label>
              <div class="flex items-center justify-between pb-3 border-b border-white/10">
                <div class="flex items-center gap-3">
                  <span class="text-white font-semibold text-lg">{{ toCurrency }}</span>
                  <button
                    @click="showToCurrencySelector = true"
                    class="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <svg class="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Exchange Quantity -->
            <div>
              <label class="block text-xs text-white/60 mb-2">{{ t('flashExchange.exchangeQuantity') }}</label>
              <div class="flex items-center gap-2 mb-2">
                <input
                  v-model="exchangeQuantity"
                  type="number"
                  step="0.00000001"
                  class="flex-1 px-4 py-3 glass-input rounded-lg focus:outline-none text-white"
                  placeholder="0.00"
                />
                <div class="flex items-center gap-1 border-l border-white/20 pl-2">
                  <button
                    @click="setQuantity('currency')"
                    :class="[
                      'px-3 py-1 rounded text-sm transition-colors',
                      quantityMode === 'currency' 
                        ? 'bg-white/20 text-white' 
                        : 'text-white/60 hover:text-white'
                    ]"
                  >
                    {{ fromCurrency }}
                  </button>
                  <span class="text-white/40">|</span>
                  <button
                    @click="setQuantity('all')"
                    :class="[
                      'px-3 py-1 rounded text-sm transition-colors',
                      quantityMode === 'all' 
                        ? 'bg-white/20 text-white' 
                        : 'text-white/60 hover:text-white'
                    ]"
                  >
                    {{ t('flashExchange.all') }}
                  </button>
                </div>
              </div>
              <div class="text-white/60 text-sm mt-1">
                {{ toCurrency }}: {{ formatBalance(estimatedAmount) }}
              </div>
            </div>

            <!-- Exchange Button -->
            <button
              @click="handleExchange"
              :disabled="loading || !exchangeQuantity || parseFloat(exchangeQuantity) <= 0"
              class="w-full py-4 bg-blue-500/30 hover:bg-blue-500/40 border border-blue-500/50 rounded-lg font-bold text-white text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? t('common.processing') : t('flashExchange.exchange') }}
            </button>
          </div>
        </div>
      </main>
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
            class="w-full flex items-center justify-between p-4 border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors"
          >
            <span class="text-white font-medium">{{ currency }}</span>
            <svg
              v-if="fromCurrency === currency"
              class="w-5 h-5 text-blue-400"
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
            class="w-full flex items-center justify-between p-4 border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors"
          >
            <span class="text-white font-medium">{{ currency }}</span>
            <svg
              v-if="toCurrency === currency"
              class="w-5 h-5 text-blue-400"
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
                <div class="text-white font-medium">{{ exchange.fromCurrency }} → {{ exchange.toCurrency }}</div>
                <div class="text-white/60 text-sm">{{ formatDate(exchange.created_at) }}</div>
              </div>
              <span class="px-2 py-1 rounded text-xs bg-green-500/20 text-green-300">
                Completed
              </span>
            </div>
            <div class="text-white/70 text-sm">
              {{ formatBalance(exchange.amount) }} {{ exchange.fromCurrency }} = {{ formatBalance(exchange.receivedAmount) }} {{ exchange.toCurrency }}
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
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import MobileNav from '../components/MobileNav.vue';
import DesktopNav from '../components/DesktopNav.vue';
import api from '../utils/api';
import { getAllCoins } from '../utils/coinLogos';

const { t } = useI18n();

const isMobile = computed(() => window.innerWidth < 768);

const fromCurrency = ref('NEO');
const toCurrency = ref('SNT');
const exchangeQuantity = ref('');
const quantityMode = ref('currency'); // 'currency' or 'all'
const loading = ref(false);
const showFromCurrencySelector = ref(false);
const showToCurrencySelector = ref(false);
const showFromBalanceSelector = ref(false);
const showHistory = ref(false);
const wallets = ref([]);
const exchangeHistory = ref([]);

const availableCurrencies = computed(() => {
  return getAllCoins();
});

const fromBalance = computed(() => {
  const wallet = wallets.value.find(w => w.currency === fromCurrency.value);
  return wallet ? wallet.balance : 0;
});

const estimatedAmount = computed(() => {
  if (!exchangeQuantity.value || parseFloat(exchangeQuantity.value) <= 0) {
    return 0;
  }
  // Simple 1:1 conversion for now (in real app, this would use exchange rates)
  return parseFloat(exchangeQuantity.value);
});

const formatBalance = (balance) => {
  const num = parseFloat(balance);
  if (num >= 1) return num.toFixed(2);
  if (num >= 0.01) return num.toFixed(4);
  return num.toFixed(8);
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
    exchangeQuantity.value = formatBalance(fromBalance.value);
  }
};

const loadWallets = async () => {
  try {
    const response = await api.get('/wallet');
    wallets.value = response.data.wallets || [];
  } catch (error) {
    console.error('Error loading wallets:', error);
  }
};

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

const handleExchange = async () => {
  if (!exchangeQuantity.value || parseFloat(exchangeQuantity.value) <= 0) {
    alert('Please enter a valid exchange quantity');
    return;
  }

  if (parseFloat(exchangeQuantity.value) > fromBalance.value) {
    alert('Insufficient balance');
    return;
  }

  loading.value = true;
  try {
    // This endpoint would need to be created in the backend
    await api.post('/exchange', {
      fromCurrency: fromCurrency.value,
      toCurrency: toCurrency.value,
      amount: parseFloat(exchangeQuantity.value),
    });
    
    alert('Exchange completed successfully!');
    exchangeQuantity.value = '';
    loadWallets();
    loadExchangeHistory();
  } catch (error) {
    alert(error.response?.data?.error || 'Exchange failed');
  }
  loading.value = false;
};

onMounted(() => {
  loadWallets();
  loadExchangeHistory();
});
</script>