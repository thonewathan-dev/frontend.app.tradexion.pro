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
                <div class="flex justify-between text-[10px] text-white/40 mb-1 px-1">
                  <span>Unit Price</span>
                  <span>Number</span>
                </div>
                <div class="space-y-0 max-h-32 md:max-h-48 overflow-y-auto">
                  <div
                    v-for="(ask, index) in orderBook.asks.slice(0, 6).reverse()"
                    :key="`ask-${index}`"
                    class="relative flex justify-between items-center text-xs cursor-pointer hover:bg-white/5 py-0.5 px-1"
                    @click="selectOrderBookPrice(ask.price, 'sell')"
                  >
                    <!-- Volume bar background - right aligned -->
                    <div 
                      class="absolute right-0 top-0 bottom-0 bg-red-500/10 transition-all"
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
                    <!-- Volume bar background - right aligned -->
                    <div 
                      class="absolute right-0 top-0 bottom-0 bg-blue-500/10 transition-all"
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
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import MobileNav from '../components/MobileNav.vue';
import DesktopNav from '../components/DesktopNav.vue';
import CustomSelect from '../components/CustomSelect.vue';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import api from '../utils/api';
import { BINANCE_AVAILABLE_COINS } from '../utils/binanceCoins';
import { getCoinLogoUrl } from '../utils/coinLogos';
import axios from 'axios';

const BINANCE_HTTP_API = 'https://api.binance.com/api/v3';
const BINANCE_WS_BASE = 'wss://stream.binance.com:9443';

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
const allTickersMap = ref({}); // Map of symbol -> ticker data
let lastDepthUpdate = 0;
let lastTickerUpdate = 0;
const coinList = computed(() => {
  return BINANCE_AVAILABLE_COINS.map(coin => {
    const symbol = `${coin}USDT`;
    const tickerData = allTickersMap.value[symbol];
    return {
      symbol: `${coin}/USDT`,
      price: tickerData?.price || 0,
      change: tickerData?.change || 0,
    };
  }).sort((a, b) => a.symbol.localeCompare(b.symbol));
});

// Interval ref for proper cleanup (prevent memory leaks)
const marketDataInterval = ref(null);

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



const formatQuantity = (qty) => {
  if (!qty) return '0.0000';
  return parseFloat(qty).toFixed(4);
};

const formatPrice = (price) => {
  if (price === null || price === undefined) return '0.0000';
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return '0.0000';
  if (numPrice >= 0.01) return numPrice.toFixed(4); // Force 4 decimals for standard prices
  return numPrice.toFixed(8); // More for very small prices
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
  // Reconnect WebSocket for the new depth stream
  connectWebSocket();
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
    // Primarily use WebSocket ticker data for the list
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
  const visibleRows = type === 'bid' 
    ? orderBook.value.bids.slice(0, 6)
    : orderBook.value.asks.slice(0, 6);
    
  if (!visibleRows.length) return 0;
  
  const allQuantities = visibleRows.map(row => parseFloat(row.quantity));
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
    if (response.data && response.data.price) {
      ticker.value = {
        ...response.data,
        price: Number(response.data.price) || 0,
        priceChangePercent: Number(response.data.priceChangePercent) || 0,
        priceChange: Number(response.data.priceChange) || 0,
        volume: Number(response.data.volume) || 0,
        highPrice: Number(response.data.highPrice) || 0,
        lowPrice: Number(response.data.lowPrice) || 0,
      };
      if (transactionMode.value === 'market' && !orderPrice.value) {
        orderPrice.value = formatPrice(ticker.value.price);
      }
    } else {
      // Fallback: fetch directly from Binance
      try {
        const binanceResponse = await axios.get(`${BINANCE_HTTP_API}/ticker/24hr`, {
          params: { symbol: symbol.toUpperCase() }
        });
        const data = binanceResponse.data;
        ticker.value = {
          price: Number(data.lastPrice) || 0,
          priceChangePercent: Number(data.priceChangePercent) || 0,
          priceChange: Number(data.priceChange) || 0,
          volume: Number(data.volume) || 0,
          highPrice: Number(data.highPrice) || 0,
          lowPrice: Number(data.lowPrice) || 0,
        };
    if (transactionMode.value === 'market' && !orderPrice.value) {
      orderPrice.value = formatPrice(ticker.value.price);
        }
      } catch (binanceError) {
        console.error('Binance fallback failed:', binanceError);
      }
    }
  } catch (error) {
    console.error('Error loading ticker:', error);
    // Try Binance fallback on error
    try {
      const binanceResponse = await axios.get(`${BINANCE_HTTP_API}/ticker/24hr`, {
        params: { symbol: symbol.toUpperCase() }
      });
      const data = binanceResponse.data;
      ticker.value = {
        price: Number(data.lastPrice) || 0,
        priceChangePercent: Number(data.priceChangePercent) || 0,
        priceChange: Number(data.priceChange) || 0,
        volume: Number(data.volume) || 0,
        highPrice: Number(data.highPrice) || 0,
        lowPrice: Number(data.lowPrice) || 0,
      };
      if (transactionMode.value === 'market' && !orderPrice.value) {
        orderPrice.value = formatPrice(ticker.value.price);
      }
    } catch (binanceError) {
      console.error('Binance fallback failed:', binanceError);
    }
  }
};

const loadOrderBook = async (symbol) => {
  try {
    const response = await api.get(`/market/orderbook/${symbol}`, { params: { limit: 12 } });
    if (response.data && (response.data.bids?.length > 0 || response.data.asks?.length > 0)) {
    orderBook.value = response.data;
    } else {
      // Fallback: fetch directly from Binance
      try {
        const binanceResponse = await axios.get(`${BINANCE_HTTP_API}/depth`, {
          params: { symbol: symbol.toUpperCase(), limit: 12 }
        });
        orderBook.value = {
          bids: (binanceResponse.data.bids || []).map(([price, quantity]) => ({
            price: Number(price) || 0,
            quantity: Number(quantity) || 0,
          })),
          asks: (binanceResponse.data.asks || []).map(([price, quantity]) => ({
            price: Number(price) || 0,
            quantity: Number(quantity) || 0,
          })),
          timestamp: Date.now(),
        };
      } catch (binanceError) {
        console.error('Binance orderbook fallback failed:', binanceError);
      }
    }
  } catch (error) {
    console.error('Error loading order book:', error);
    // Try Binance fallback on error
    try {
      const binanceResponse = await axios.get(`${BINANCE_HTTP_API}/depth`, {
        params: { symbol: symbol.toUpperCase(), limit: 12 }
      });
      orderBook.value = {
        bids: (binanceResponse.data.bids || []).map(([price, quantity]) => ({
          price: Number(price) || 0,
          quantity: Number(quantity) || 0,
        })),
        asks: (binanceResponse.data.asks || []).map(([price, quantity]) => ({
          price: Number(price) || 0,
          quantity: Number(quantity) || 0,
        })),
        timestamp: Date.now(),
      };
    } catch (binanceError) {
      console.error('Binance orderbook fallback failed:', binanceError);
    }
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

// WebSocket for real-time ticker updates
let tickerWs = null;
let wsReconnectTimer = null;
let wsBackoffMs = 1000;
const MAX_BACKOFF_MS = 30000;

const processTickerUpdate = (tickerData) => {
  if (!tickerData?.s) return;
  const symbol = tickerData.s;
  
  // Update the global map for the coin list (can be frequent)
  allTickersMap.value[symbol] = {
    price: Number(tickerData.c),
    change: Number(tickerData.P),
  };

  const currentSymbol = selectedSymbol.value.replace('/', '');
  if (symbol !== currentSymbol) return;
  
  const now = Date.now();
  if (ticker.value && (now - lastTickerUpdate >= 500)) {
    lastTickerUpdate = now;
    ticker.value.price = Number(tickerData.c) || ticker.value.price;
    ticker.value.priceChangePercent = Number(tickerData.P) || ticker.value.priceChangePercent;
    ticker.value.priceChange = Number(tickerData.p) || ticker.value.priceChange;
    ticker.value.volume = Number(tickerData.v) || ticker.value.volume;
    ticker.value.highPrice = Number(tickerData.h) || ticker.value.highPrice;
    ticker.value.lowPrice = Number(tickerData.l) || ticker.value.lowPrice;
    
    if (transactionMode.value === 'market' && !orderPrice.value) {
      orderPrice.value = formatPrice(ticker.value.price);
    }
  }
};

const connectWebSocket = () => {
  try {
    if (tickerWs) {
      tickerWs.onopen = null;
      tickerWs.onmessage = null;
      tickerWs.onerror = null;
      tickerWs.onclose = null;
      tickerWs.close();
      tickerWs = null;
    }
  } catch (e) {
    console.warn('[Spot WS] Cleanup error:', e);
  }
  
  try {
    const currentSymbol = selectedSymbol.value.replace('/', '').toLowerCase();
    // Correct URL format for combined streams: /stream?streams=stream1/stream2
    // depth20 is a valid Binance level (12 was not)
    const wsUrl = `${BINANCE_WS_BASE}/stream?streams=!ticker@arr/${currentSymbol}@depth20@100ms`;
    tickerWs = new WebSocket(wsUrl);
    
    tickerWs.onopen = () => {
      console.log('[Spot WS] Connected to:', wsUrl);
      wsBackoffMs = 1000;
    };
    
    tickerWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle combined stream format
        if (data.stream === '!ticker@arr') {
            data.data.forEach(processTickerUpdate);
        } else if (data.stream?.endsWith('@depth20@100ms')) {
            const now = Date.now();
            if (now - lastDepthUpdate >= 500) {
                lastDepthUpdate = now;
                const depthData = data.data;
                orderBook.value = {
                    bids: (depthData.bids || []).map(([price, quantity]) => ({
                        price: Number(price) || 0,
                        quantity: Number(quantity) || 0,
                    })),
                    asks: (depthData.asks || []).map(([price, quantity]) => ({
                        price: Number(price) || 0,
                        quantity: Number(quantity) || 0,
                    })),
                    timestamp: now,
                };
            }
        } else if (Array.isArray(data)) {
            // Fallback for single stream format
            data.forEach(processTickerUpdate);
        }
      } catch (e) {
        console.error('[Spot WS] Parse error:', e);
      }
    };
    
    tickerWs.onerror = (e) => {
      console.error('[Spot WS] Error:', e);
    };
    
    tickerWs.onclose = (e) => {
      console.warn('[Spot WS] Closed:', e.code);
      tickerWs = null;
      scheduleReconnect();
    };
  } catch (e) {
    console.error('[Spot WS] Setup error:', e);
    scheduleReconnect();
  }
};

const scheduleReconnect = () => {
  if (wsReconnectTimer) return;
  wsReconnectTimer = setTimeout(() => {
    wsReconnectTimer = null;
    connectWebSocket();
  }, wsBackoffMs);
  wsBackoffMs = Math.min(wsBackoffMs * 2, MAX_BACKOFF_MS);
};

onMounted(() => {
  loadMarketData();
  loadCoinList();
  connectWebSocket();
  
  // ancillary data refresh interval
  let isRefreshing = false;
  let walletTick = 0;
  marketDataInterval.value = setInterval(async () => {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        // Orderbook and Ticker are now handled via WebSocket!
        
        // Wallets do NOT need frequent polling (causes 429). Refresh every ~15s.
        walletTick = (walletTick + 1) % 3;
        if (walletTick === 0) {
          await loadWallets();
        }
      } catch (error) {
        console.error('Error refreshing ancillary data:', error);
      } finally {
        isRefreshing = false;
      }
    }
  }, 5000);
});

// Cleanup WebSocket and intervals on unmount
onUnmounted(() => {
  if (wsReconnectTimer) {
    clearTimeout(wsReconnectTimer);
    wsReconnectTimer = null;
  }
  
  if (marketDataInterval.value) {
    clearInterval(marketDataInterval.value);
    marketDataInterval.value = null;
  }
  
  try {
    if (tickerWs) {
      tickerWs.onopen = null;
      tickerWs.onmessage = null;
      tickerWs.onerror = null;
      tickerWs.onclose = null;
      tickerWs.close();
      tickerWs = null;
    }
  } catch {
    // Ignore cleanup errors
  }
});
</script>