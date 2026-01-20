<template>
  <div class="min-h-screen">
    <MobileNav v-if="isMobile" />
    <div class="md:flex">
      <DesktopNav v-if="!isMobile" />
      <main class="flex-1 pb-16 md:pb-0">
        <!-- Header -->
        <div class="px-3 py-2 border-b border-white/10">
          <!-- Top: Spot title -->
          <div class="mb-2">
            <h1 class="text-base font-bold text-white">{{ $t('spot.title') }}</h1>
          </div>
          
          <!-- Bottom: Settings icon, Trading pair, Chart icon -->
          <div class="flex items-center gap-3 py-2">
            <button
              @click="showSymbolSelector = true"
              class="p-1.5 hover:opacity-80 transition-opacity"
            >
              <svg class="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <span class="flex-1 text-center text-white font-semibold text-base">{{ selectedSymbol }}</span>
            <button
              @click="$router.push({ path: '/kline', query: { symbol: selectedSymbol } })"
              class="p-1.5 hover:opacity-80 transition-opacity"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <!-- Left green candlestick -->
                <rect x="2" y="14" width="4" height="6" fill="#10B981" />
                <line x1="4" y1="12" x2="4" y2="14" stroke="#10B981" stroke-width="1.5" stroke-linecap="round" />
                <line x1="4" y1="20" x2="4" y2="22" stroke="#10B981" stroke-width="1.5" stroke-linecap="round" />
                
                <!-- Middle red candlestick -->
                <rect x="9" y="10" width="4" height="10" fill="#EF4444" />
                <line x1="11" y1="8" x2="11" y2="10" stroke="#EF4444" stroke-width="1.5" stroke-linecap="round" />
                <line x1="11" y1="20" x2="11" y2="22" stroke="#EF4444" stroke-width="1.5" stroke-linecap="round" />
                
                <!-- Right green candlestick -->
                <rect x="16" y="14" width="4" height="6" fill="#10B981" />
                <line x1="18" y1="12" x2="18" y2="14" stroke="#10B981" stroke-width="1.5" stroke-linecap="round" />
                <line x1="18" y1="20" x2="18" y2="22" stroke="#10B981" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </button>
          </div>
          
        </div>

        <div class="p-2 md:p-4">
          <!-- Loading Skeleton -->
          <div v-if="isLoading" class="flex flex-row gap-2 md:gap-3 items-stretch">
            <!-- Left Skeleton -->
            <div class="flex-1 min-w-0 max-w-[50%] flex flex-col gap-3">
              <SkeletonLoader type="button" />
              <SkeletonLoader type="input" />
              <SkeletonLoader type="input" />
              <SkeletonLoader type="input" />
              <SkeletonLoader type="button" />
            </div>
            <!-- Right Skeleton -->
            <div class="flex-1 min-w-0 max-w-[50%] flex flex-col gap-3">
              <SkeletonLoader type="button" />
              <SkeletonLoader type="order-book" :rows="6" />
              <div class="h-px bg-white/10 my-1"></div>
              <SkeletonLoader type="order-book" :rows="6" />
            </div>
          </div>
          
          <!-- Actual Content -->
          <div v-else class="flex flex-row gap-2 md:gap-3 items-stretch">
            <!-- Left: Trading Panel -->
            <div class="flex-1 min-w-0 max-w-[50%] flex flex-col h-full">
              <!-- Buy/Sell Tabs and Price on same line -->
              <div class="flex gap-2 mb-3 items-center">
                <button
                  @click="orderSide = 'buy'"
                  :class="[
                    'flex-1 py-2 rounded-lg font-medium transition-colors',
                    orderSide === 'buy'
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  ]"
                >
                  {{ $t('spot.buy') }}
                </button>
                <button
                  @click="orderSide = 'sell'"
                  :class="[
                    'flex-1 py-2 rounded-lg font-medium transition-colors',
                    orderSide === 'sell'
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  ]"
                >
                  {{ $t('spot.sell') }}
                </button>
              </div>

              <!-- Transaction Mode -->
              <div class="mb-2">
                <label class="block text-xs text-white/70 mb-1">Transaction mode</label>
                <CustomSelect
                  v-model="transactionMode"
                  :options="[
                    { value: 'market', label: 'Market' },
                    { value: 'limit', label: 'Limit' }
                  ]"
                />
              </div>

              <!-- Price Input -->
              <div class="mb-2">
                <label class="block text-xs text-white/70 mb-1">{{ $t('spot.price') }}</label>
                <div class="flex items-center gap-1.5">
                  <input
                    v-model="orderPrice"
                    type="number"
                    step="0.00000001"
                    class="flex-1 min-w-0 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50 text-sm text-white"
                    placeholder="Market optimal price"
                  />
                  <span class="text-white/70 text-xs whitespace-nowrap flex-shrink-0">USDT</span>
                </div>
                <p class="text-xs text-white/60 mt-0.5">Market optimal price</p>
              </div>

              <!-- Number Input -->
              <div class="mb-2">
                <label class="block text-xs text-white/70 mb-1">{{ $t('spot.quantity') }}</label>
                <div class="flex items-center gap-1 mb-1">
                  <input
                    v-model="orderQuantity"
                    type="number"
                    step="0.00000001"
                    class="flex-1 min-w-0 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50 text-sm text-white"
                    placeholder="0"
                  />
                  <div class="flex items-center gap-0.5 border-l border-white/20 pl-1.5 flex-shrink-0">
                    <button
                      @click="setQuantity('currency')"
                      :class="[
                        'px-1.5 py-0.5 rounded text-xs transition-colors whitespace-nowrap',
                        quantityMode === 'currency' 
                          ? 'bg-white/20 text-white' 
                          : 'text-white/60 hover:text-white'
                      ]"
                    >
                      {{ selectedSymbol.split('/')[0] }}
                    </button>
                    <span class="text-white/40">|</span>
                    <button
                      @click="setQuantity('all')"
                      :class="[
                        'px-1.5 py-0.5 rounded text-xs transition-colors whitespace-nowrap',
                        quantityMode === 'all' 
                          ? 'bg-white/20 text-white' 
                          : 'text-white/60 hover:text-white'
                      ]"
                    >
                      all
                    </button>
                  </div>
                </div>
                <!-- Slider -->
                <div class="mb-1">
                  <input
                    v-model="quantityPercent"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    class="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    @input="updateQuantityFromSlider"
                  />
                </div>
                <div class="flex justify-end mb-1">
                  <button
                    @click="setQuantity('all')"
                    class="px-2 py-0.5 text-xs text-white/70 hover:text-white transition-colors"
                  >
                    Max
                  </button>
                </div>
              </div>

              <!-- Usable and Volume -->
              <div class="mb-3 space-y-0.5">
                <div class="flex justify-between text-xs">
                  <span class="text-white/70">Usable</span>
                  <span class="text-white truncate ml-2">{{ formatBalance(usableBalance) }} USDT</span>
                </div>
                <div class="flex justify-between text-xs">
                  <span class="text-white/70">Volume</span>
                  <span class="text-white truncate ml-2">{{ formatBalance(orderVolume) }} USDT</span>
                </div>
              </div>

              <!-- Buy/Sell Button -->
              <button
                @click="handlePlaceOrder"
                :disabled="loading || !orderQuantity || parseFloat(orderQuantity) <= 0"
                :class="[
                  'w-full py-2.5 rounded-lg font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm',
                  orderSide === 'buy'
                    ? 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
                    : 'bg-red-500 hover:bg-red-600 active:bg-red-700'
                ]"
              >
                {{ loading ? $t('common.loading') : `${orderSide === 'buy' ? $t('spot.buy') : $t('spot.sell')} ${selectedSymbol.split('/')[0]}` }}
              </button>
            </div>

            <!-- Right: Order Book -->
            <div class="flex-1 min-w-0 max-w-[50%] flex flex-col h-full">
              <!-- Price aligned with Buy/Sell tabs -->
              <div class="flex gap-2 mb-3 items-center">
                <div class="flex-1"></div>
                <div class="flex-1 text-center">
                  <div class="text-sm md:text-base font-bold text-blue-400 truncate">{{ formatPrice(ticker?.price || 0) }} USDT</div>
                </div>
                <div class="flex-1"></div>
              </div>
              
              <!-- Sell Orders (Asks) -->
              <div class="mb-2">
                <div class="flex justify-between text-xs text-white/60 mb-1">
                  <span>{{ $t('spot.price') }}</span>
                  <span>{{ $t('spot.quantity') }}</span>
                </div>
                <div class="space-y-0 max-h-32 md:max-h-48 overflow-y-auto">
                  <div
                    v-for="(ask, index) in orderBook.asks.slice(0, 6).reverse()"
                    :key="`ask-${index}`"
                    class="relative flex justify-between items-center text-xs cursor-pointer hover:bg-white/5 py-0.5 px-1"
                    @click="selectOrderBookPrice(ask.price, 'sell')"
                  >
                    <!-- Volume bar background -->
                    <div 
                      class="absolute left-0 top-0 bottom-0 bg-red-500/10 transition-all"
                      :style="{ width: `${getVolumePercent(ask.quantity, 'ask')}%` }"
                    ></div>
                    <span class="relative z-10 text-red-400 font-medium text-xs truncate">{{ formatPrice(ask.price) }}</span>
                    <span class="relative z-10 text-white/70 text-xs truncate">{{ formatQuantity(ask.quantity) }}</span>
                  </div>
                </div>
              </div>

              <!-- Current Price Separator -->
              <div class="border-t border-b border-white/10 py-1.5 my-1 text-center">
                <div class="text-xs font-bold text-blue-400 truncate">{{ formatPrice(ticker?.price || 0) }} USDT</div>
              </div>

              <!-- Buy Orders (Bids) -->
              <div>
                <div class="space-y-0 max-h-32 md:max-h-48 overflow-y-auto">
                  <div
                    v-for="(bid, index) in orderBook.bids.slice(0, 6)"
                    :key="`bid-${index}`"
                    class="relative flex justify-between items-center text-xs cursor-pointer hover:bg-white/5 py-0.5 px-1"
                    @click="selectOrderBookPrice(bid.price, 'buy')"
                  >
                    <!-- Volume bar background -->
                    <div 
                      class="absolute left-0 top-0 bottom-0 bg-blue-500/10 transition-all"
                      :style="{ width: `${getVolumePercent(bid.quantity, 'bid')}%` }"
                    ></div>
                    <span class="relative z-10 text-blue-400 font-medium text-xs truncate">{{ formatPrice(bid.price) }}</span>
                    <span class="relative z-10 text-white/70 text-xs truncate">{{ formatQuantity(bid.quantity) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Entrusts Section -->
          <div class="mt-3">
            <div class="flex border-b border-white/10 mb-4">
              <button
                @click="activeTab = 'current'"
                :class="[
                  'px-4 py-2 text-sm font-medium transition-all relative',
                  activeTab === 'current'
                    ? 'text-blue-400'
                    : 'text-white/60'
                ]"
              >
                {{ $t('spot.current') }}
                <span
                  v-if="activeTab === 'current'"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"
                ></span>
              </button>
              <button
                @click="activeTab = 'history'"
                :class="[
                  'px-4 py-2 text-sm font-medium transition-all relative',
                  activeTab === 'history'
                    ? 'text-blue-400'
                    : 'text-white/60'
                ]"
              >
                {{ $t('spot.history') }}
                <span
                  v-if="activeTab === 'history'"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"
                ></span>
              </button>
            </div>
            <div class="text-center py-12">
              <svg class="w-16 h-16 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p class="text-white/60">No data</p>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Coin Selector Modal -->
    <div
      v-if="showSymbolSelector"
      class="fixed inset-0 z-50 flex items-end md:items-center md:justify-center"
      @click.self="showSymbolSelector = false"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showSymbolSelector = false"></div>
      
      <!-- Modal Content -->
      <div
        class="relative glass-card w-full md:w-96 md:max-w-md rounded-b-2xl md:rounded-b-2xl shadow-2xl max-h-[80vh] flex flex-col animate-slide-up"
      >
        <!-- Header -->
        <div class="sticky top-0 glass-card-no-hover border-b border-white/10 px-4 py-4 z-10">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-white">USDT</h2>
            <button
              @click="showSymbolSelector = false"
              class="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <svg class="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Coin List -->
        <div class="flex-1 overflow-y-auto">
          <div
            v-for="coin in coinList"
            :key="coin.symbol"
            @click="selectSymbol(coin.symbol)"
            class="flex items-center justify-between px-4 py-3 hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer border-b border-white/10"
          >
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <img
                :src="getCoinLogo(coin.symbol)"
                :alt="coin.symbol"
                class="w-8 h-8 rounded-full flex-shrink-0"
                @error="handleImageError"
              />
              <span class="text-white font-medium">{{ coin.symbol.split('/')[0] }}</span>
            </div>
            <div class="flex items-center gap-4 flex-shrink-0">
              <span
                :class="[
                  'text-sm font-medium',
                  coin.change >= 0 ? 'text-green-400' : 'text-red-400'
                ]"
              >
                {{ coin.change >= 0 ? '+' : '' }}{{ coin.change.toFixed(2) }}%
              </span>
              <span class="text-white font-medium text-sm min-w-[80px] text-right">
                {{ formatPrice(coin.price) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import MobileNav from '../components/MobileNav.vue';
import DesktopNav from '../components/DesktopNav.vue';
import CustomSelect from '../components/CustomSelect.vue';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import api from '../utils/api';
import { BINANCE_AVAILABLE_COINS } from '../utils/binanceCoins';
import { getCoinLogoUrl } from '../utils/coinLogos';

const { t } = useI18n();

const route = useRoute();
const isMobile = computed(() => window.innerWidth < 768);

const availableSymbols = BINANCE_AVAILABLE_COINS.map(coin => `${coin}/USDT`);

// Get symbol from query or default
const getInitialSymbol = () => {
  if (route.query.symbol) {
    let symbol = route.query.symbol.trim();
    if (symbol.includes('/')) {
      if (availableSymbols.includes(symbol)) {
        return symbol;
      }
    } else {
      symbol = symbol.replace(/USDT$/, '/USDT');
      if (availableSymbols.includes(symbol)) {
        return symbol;
      }
    }
  }
  return availableSymbols[0] || 'BTC/USDT';
};

const selectedSymbol = ref(getInitialSymbol());
const orderSide = ref('buy');
const transactionMode = ref('market');
const orderPrice = ref('');
const orderQuantity = ref('');
const quantityMode = ref('currency');
const quantityPercent = ref(0);
const loading = ref(false);
const showSymbolSelector = ref(false);
const activeTab = ref('current');
const ticker = ref(null);
const orderBook = ref({ bids: [], asks: [] });
const wallets = ref([]);
const isLoading = ref(true);
const coinList = ref([]);

const usableBalance = computed(() => {
  try {
    if (orderSide.value === 'buy') {
      // Only use USDT from spot account
      const usdtWallet = wallets.value.find(
        w => w.currency === 'USDT' && (w.account_type === 'spot' || !w.account_type)
      );
      if (!usdtWallet) return 0;
      const balance = parseFloat(usdtWallet.balance) || 0;
      const locked = parseFloat(usdtWallet.locked_balance) || 0;
      const available = Math.max(0, balance - locked);
      return isNaN(available) ? 0 : available;
    } else {
      // For sell orders, use base currency from spot account
      const baseCurrency = selectedSymbol.value.split('/')[0];
      if (!baseCurrency) return 0;
      const wallet = wallets.value.find(
        w => w.currency === baseCurrency && (w.account_type === 'spot' || !w.account_type)
      );
      if (!wallet) return 0;
      const balance = parseFloat(wallet.balance) || 0;
      const locked = parseFloat(wallet.locked_balance) || 0;
      const available = Math.max(0, balance - locked);
      return isNaN(available) ? 0 : available;
    }
  } catch (error) {
    console.error('Error calculating usable balance:', error);
    return 0;
  }
});

const orderVolume = computed(() => {
  if (!orderQuantity.value || !orderPrice.value) return 0;
  if (orderSide.value === 'buy') {
    return parseFloat(orderQuantity.value) * parseFloat(orderPrice.value || ticker.value?.price || 0);
  } else {
    return parseFloat(orderQuantity.value) * parseFloat(orderPrice.value || ticker.value?.price || 0);
  }
});

const formatPrice = (price) => {
  const num = Number(price);
  if (!Number.isFinite(num) || num === 0) return '0.00';
  if (num >= 1) return num.toFixed(2);
  if (num >= 0.01) return num.toFixed(4);
  return num.toFixed(8);
};

const formatQuantity = (qty) => {
  if (!qty) return '0.0000';
  return parseFloat(qty).toFixed(4);
};

const formatBalance = (balance) => {
  if (balance === null || balance === undefined || isNaN(balance)) return '0.00';
  const num = parseFloat(balance);
  if (isNaN(num)) return '0.00';
  if (num >= 1) return num.toFixed(2);
  if (num >= 0.01) return num.toFixed(4);
  return num.toFixed(8);
};

const selectSymbol = (symbol) => {
  selectedSymbol.value = symbol;
  showSymbolSelector.value = false;
  loadMarketData();
};

const getCoinLogo = (symbol) => {
  const baseCurrency = symbol.split('/')[0];
  return getCoinLogoUrl(baseCurrency) || `https://via.placeholder.com/32?text=${baseCurrency}`;
};

const handleImageError = (event) => {
  const symbol = event.target.alt.split('/')[0];
  event.target.src = `https://via.placeholder.com/32?text=${symbol}`;
};

const loadCoinList = async () => {
  try {
    const promises = BINANCE_AVAILABLE_COINS.map(async (coin) => {
      try {
        const symbol = `${coin}USDT`;
        const response = await api.get(`/market/ticker/${symbol}/24h`);
        if (response.data && response.data.price) {
          return {
            symbol: `${coin}/USDT`,
            price: response.data.price,
            change: response.data.priceChangePercent || 0,
          };
        }
        return null;
      } catch (error) {
        console.debug(`Failed to fetch ${coin}:`, error.message);
        return null;
      }
    });
    
    const results = await Promise.all(promises);
    coinList.value = results.filter(Boolean).sort((a, b) => {
      // Sort by symbol name
      return a.symbol.localeCompare(b.symbol);
    });
  } catch (error) {
    console.error('Error loading coin list:', error);
  }
};

const setQuantity = (mode) => {
  quantityMode.value = mode;
  if (mode === 'all') {
    if (orderSide.value === 'buy') {
      // Calculate max quantity based on available USDT
      const maxQty = usableBalance.value / parseFloat(orderPrice.value || ticker.value?.price || 1);
      orderQuantity.value = formatBalance(maxQty);
    } else {
      orderQuantity.value = formatBalance(usableBalance.value);
    }
    quantityPercent.value = 100;
  }
};

const updateQuantityFromSlider = () => {
  const percent = quantityPercent.value / 100;
  if (orderSide.value === 'buy') {
    const maxQty = usableBalance.value / parseFloat(orderPrice.value || ticker.value?.price || 1);
    orderQuantity.value = formatBalance(maxQty * percent);
  } else {
    orderQuantity.value = formatBalance(usableBalance.value * percent);
  }
};

const selectOrderBookPrice = (price, side) => {
  orderPrice.value = formatPrice(price);
  if (side !== orderSide.value) {
    orderSide.value = side;
  }
};

const getVolumePercent = (quantity, type) => {
  if (!orderBook.value.bids.length || !orderBook.value.asks.length) return 0;
  
  const allQuantities = type === 'bid' 
    ? orderBook.value.bids.map(b => parseFloat(b.quantity))
    : orderBook.value.asks.map(a => parseFloat(a.quantity));
  
  const maxQuantity = Math.max(...allQuantities);
  if (maxQuantity === 0) return 0;
  
  return (parseFloat(quantity) / maxQuantity) * 100;
};

const loadMarketData = async () => {
  isLoading.value = true;
  const symbol = selectedSymbol.value.replace('/', '');
  try {
    await Promise.all([
      loadTicker(symbol),
      loadOrderBook(symbol),
      loadWallets(),
    ]);
  } finally {
    isLoading.value = false;
  }
};

const loadTicker = async (symbol) => {
  try {
    const response = await api.get(`/market/ticker/${symbol}/24h`);
    ticker.value = response.data;
    if (transactionMode.value === 'market' && !orderPrice.value) {
      orderPrice.value = formatPrice(ticker.value.price);
    }
  } catch (error) {
    console.error('Error loading ticker:', error);
  }
};

const loadOrderBook = async (symbol) => {
  try {
    const response = await api.get(`/market/orderbook/${symbol}`, { params: { limit: 12 } });
    orderBook.value = response.data;
  } catch (error) {
    console.error('Error loading order book:', error);
  }
};

const loadWallets = async () => {
  try {
    // Load only spot account wallets for spot trading
    const response = await api.get('/wallet', { params: { account_type: 'spot' } });
    wallets.value = (response.data.wallets || []).map(w => ({
      ...w,
      account_type: w.account_type || 'spot' // Ensure account_type is set
    }));
  } catch (error) {
    console.error('Error loading wallets:', error);
    // IMPORTANT: don't wipe wallets on transient errors (429 etc)
    // Keep last known wallets and let next success refresh.
  }
};

const handlePlaceOrder = async () => {
  if (!orderQuantity.value || parseFloat(orderQuantity.value) <= 0) {
    alert('Please enter a valid quantity');
    return;
  }

  if (transactionMode.value === 'limit' && (!orderPrice.value || parseFloat(orderPrice.value) <= 0)) {
    alert('Please enter a valid price');
    return;
  }

  loading.value = true;
  try {
    await api.post('/orders', {
      symbol: selectedSymbol.value,
      side: orderSide.value,
      type: transactionMode.value,
      quantity: parseFloat(orderQuantity.value),
      price: transactionMode.value === 'limit' ? parseFloat(orderPrice.value) : ticker.value?.price,
    });
    
    alert(`Order placed successfully!`);
    orderQuantity.value = '';
    orderPrice.value = '';
    quantityPercent.value = 0;
    loadWallets();
    loadMarketData();
  } catch (error) {
    alert(error.response?.data?.error || 'Failed to place order');
  }
  loading.value = false;
};

// Watch for symbol changes from route
watch(() => route.query.symbol, (newSymbol) => {
  if (newSymbol) {
    let symbol = newSymbol.trim();
    if (symbol.includes('/')) {
      if (availableSymbols.includes(symbol)) {
        selectedSymbol.value = symbol;
        loadMarketData();
      }
    } else {
      symbol = symbol.replace(/USDT$/, '/USDT');
      if (availableSymbols.includes(symbol)) {
        selectedSymbol.value = symbol;
        loadMarketData();
      }
    }
  }
}, { immediate: true });

// Watch for market mode to update price
watch(transactionMode, (mode) => {
  if (mode === 'market' && ticker.value?.price) {
    orderPrice.value = formatPrice(ticker.value.price);
  }
});

// Watch for order side changes to update quantity mode
watch(orderSide, () => {
  orderQuantity.value = '';
  quantityPercent.value = 0;
  loadWallets();
});

const refreshMarketData = async () => {
  const symbol = selectedSymbol.value.replace('/', '');
  await Promise.all([
    loadTicker(symbol),
    loadOrderBook(symbol),
  ]);
};

onMounted(() => {
  loadMarketData();
  loadCoinList();
  // Refresh data every 5 seconds (without showing loading)
  // Real-time updates every 2 seconds - throttled to prevent browser overload
  let isRefreshing = false;
  let walletTick = 0;
  setInterval(async () => {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        await refreshMarketData();
        // Wallets do NOT need 2s polling (causes 429). Refresh every ~10s.
        walletTick = (walletTick + 1) % 5;
        if (walletTick === 0) {
          await loadWallets();
        }
      } catch (error) {
        console.error('Error refreshing market data:', error);
      } finally {
        isRefreshing = false;
      }
    }
  }, 2000);
});
</script>