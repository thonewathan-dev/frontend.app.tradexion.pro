<template>
  <div class="min-h-screen">
    <MobileNav v-if="isMobile" />
    <div class="md:flex">
      <DesktopNav v-if="!isMobile" />
      <main class="flex-1 pb-16 md:pb-0">
        <!-- Header -->
        <div class="px-3 py-2 border-b border-gray-200 bg-[#fafafa]">
          <!-- Top: Spot title -->
          <div class="mb-2">
            <h1 class="text-base font-bold text-gray-900">{{ $t('spot.title') }}</h1>
          </div>
          
          <!-- Bottom: Settings icon, Trading pair, Chart icon -->
          <div class="flex items-center gap-3 py-2">
            <button
              @click="showSymbolSelector = true"
              class="p-1.5 hover:opacity-80 transition-opacity"
            >
              <svg class="w-5 h-5 text-gray-900/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <span class="flex-1 text-center text-gray-900 font-semibold text-base">{{ selectedSymbol }}</span>
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
              <div class="h-px bg-gray-100 my-1"></div>
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
                      : 'bg-gray-50 text-gray-900/60 hover:bg-gray-100'
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
                      : 'bg-gray-50 text-gray-900/60 hover:bg-gray-100'
                  ]"
                >
                  {{ $t('spot.sell') }}
                </button>
              </div>

              <!-- Transaction Mode -->
              <div class="mb-2">
                <label class="block text-xs text-gray-900/70 mb-1">Transaction mode</label>
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
                <label class="block text-xs text-gray-900/70 mb-1">{{ $t('spot.price') }}</label>
                <div class="flex items-center gap-1.5">
                  <input
                    v-model="orderPrice"
                    type="number"
                    step="0.00000001"
                    class="flex-1 min-w-0 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500/50 text-sm text-gray-900"
                    placeholder="Market optimal price"
                  />
                  <span class="text-gray-900/70 text-xs whitespace-nowrap flex-shrink-0">USDT</span>
                </div>
                <p class="text-xs text-gray-900/60 mt-0.5">Market optimal price</p>
              </div>

              <!-- Number Input -->
              <div class="mb-2">
                <label class="block text-xs text-gray-900/70 mb-1">{{ $t('spot.quantity') }}</label>
                <div class="flex items-center gap-1 mb-1">
                  <input
                    v-model="orderQuantity"
                    type="number"
                    step="0.00000001"
                    class="flex-1 min-w-0 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500/50 text-sm text-gray-900"
                    placeholder="0"
                  />
                  <div class="flex items-center gap-0.5 border-l border-gray-300 pl-1.5 flex-shrink-0">
                    <button
                      @click="setQuantity('currency')"
                      :class="[
                        'px-1.5 py-0.5 rounded text-xs transition-colors whitespace-nowrap',
                        quantityMode === 'currency' 
                          ? 'bg-gray-200 text-gray-900' 
                          : 'text-gray-900/60 hover:text-gray-900'
                      ]"
                    >
                      {{ selectedSymbol.split('/')[0] }}
                    </button>
                    <span class="text-gray-900/40">|</span>
                    <button
                      @click="setQuantity('all')"
                      :class="[
                        'px-1.5 py-0.5 rounded text-xs transition-colors whitespace-nowrap',
                        quantityMode === 'all' 
                          ? 'bg-gray-200 text-gray-900' 
                          : 'text-gray-900/60 hover:text-gray-900'
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
                    class="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                    @input="updateQuantityFromSlider"
                  />
                </div>
                <div class="flex justify-end mb-1">
                  <button
                    @click="setQuantity('all')"
                    class="px-2 py-0.5 text-xs text-gray-900/70 hover:text-gray-900 transition-colors"
                  >
                    Max
                  </button>
                </div>
              </div>

              <!-- Usable and Volume -->
              <div class="mb-3 space-y-0.5">
                <div class="flex justify-between text-xs">
                  <span class="text-gray-900/70">Usable</span>
                  <span class="text-gray-900 truncate ml-2">{{ formatBalance(usableBalance) }} USDT</span>
                </div>
                <div class="flex justify-between text-xs">
                  <span class="text-gray-900/70">Volume</span>
                  <span class="text-gray-900 truncate ml-2">{{ formatBalance(orderVolume) }} USDT</span>
                </div>
              </div>

              <!-- Buy/Sell Button -->
              <button
                @click="handlePlaceOrder"
                :disabled="loading || !orderQuantity || parseFloat(orderQuantity) <= 0"
                :class="[
                  'w-full py-2.5 rounded-lg font-bold text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm',
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
                <div class="flex justify-between text-[10px] text-gray-900/40 mb-1 px-1">
                  <span>Unit Price</span>
                  <span>Number</span>
                </div>
                <div class="space-y-0 max-h-32 md:max-h-48 overflow-y-auto">
                  <div
                    v-for="(ask, index) in orderBook.asks.slice(0, 6).reverse()"
                    :key="`ask-${index}`"
                    class="relative flex justify-between items-center text-xs cursor-pointer hover:bg-gray-50 py-0.5 px-1"
                    @click="selectOrderBookPrice(ask.price, 'sell')"
                  >
                    <!-- Volume bar background - right aligned -->
                    <div 
                      class="absolute right-0 top-0 bottom-0 bg-red-500/10 transition-all"
                      :style="{ width: `${getVolumePercent(ask.quantity, 'ask')}%` }"
                    ></div>
                    <span class="relative z-10 text-red-400 font-medium text-xs truncate">{{ formatPrice(ask.price) }}</span>
                    <span class="relative z-10 text-gray-900/70 text-xs truncate">{{ formatQuantity(ask.quantity) }}</span>
                  </div>
                </div>
              </div>

              <!-- Current Price Separator -->
              <div class="border-t border-b border-gray-200 py-1.5 my-1 text-center">
                <div class="text-xs font-bold text-blue-400 truncate">{{ formatPrice(ticker?.price || 0) }} USDT</div>
              </div>

              <!-- Buy Orders (Bids) -->
              <div>
                <div class="space-y-0 max-h-32 md:max-h-48 overflow-y-auto">
                  <div
                    v-for="(bid, index) in orderBook.bids.slice(0, 6)"
                    :key="`bid-${index}`"
                    class="relative flex justify-between items-center text-xs cursor-pointer hover:bg-gray-50 py-0.5 px-1"
                    @click="selectOrderBookPrice(bid.price, 'buy')"
                  >
                    <!-- Volume bar background - right aligned -->
                    <div 
                      class="absolute right-0 top-0 bottom-0 bg-blue-500/10 transition-all"
                      :style="{ width: `${getVolumePercent(bid.quantity, 'bid')}%` }"
                    ></div>
                    <span class="relative z-10 text-blue-400 font-medium text-xs truncate">{{ formatPrice(bid.price) }}</span>
                    <span class="relative z-10 text-gray-900/70 text-xs truncate">{{ formatQuantity(bid.quantity) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Entrusts Section -->
          <div class="mt-3">
            <div class="flex border-b border-gray-200 mb-4">
              <button
                @click="activeTab = 'current'"
                :class="[
                  'px-4 py-2 text-sm font-medium transition-all relative',
                  activeTab === 'current'
                    ? 'text-blue-400'
                    : 'text-gray-900/60'
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
                    : 'text-gray-900/60'
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
              <svg class="w-16 h-16 text-gray-900/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p class="text-gray-900/60">No data</p>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Coin Selector Modal -->
    <Transition name="modal-fade">
      <div
        v-if="showSymbolSelector"
        class="fixed inset-0 z-50 flex items-end md:items-center md:justify-center"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" @click="showSymbolSelector = false"></div>
        
        <!-- Modal Content -->
        <div
          class="relative bg-[#1e2329] w-full md:w-96 md:max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col modal-content-anim"
        >
        <!-- Header -->
        <div class="sticky top-0 bg-[#1e2329] border-b border-gray-200 z-10">
          <div class="flex items-center justify-between px-4 py-4">
            <h2 class="text-lg font-bold text-gray-900">Market</h2>
            <button
              @click="showSymbolSelector = false"
              class="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg class="w-5 h-5 text-gray-900/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Category Tabs with Sliding Indicator -->
          <div class="px-3 pb-3">
            <div class="bg-gray-50 p-1 rounded-xl flex relative h-10 overflow-hidden isolate">
              <!-- Sliding Background Indicator -->
              <div 
                class="absolute inset-y-1 transition-all duration-300 ease-out bg-blue-500 rounded-lg shadow-lg shadow-blue-500/30 -z-10"
                :style="{
                  width: 'calc(25% - 4px)',
                  left: activeCategory === 'hot' ? '4px' : 
                        activeCategory === 'crypto' ? '25.6%' : 
                        activeCategory === 'metals' ? '49.8%' : '74.2%'
                }"
              ></div>
              
              <button
                v-for="cat in ['hot', 'crypto', 'metals', 'forex']"
                :key="cat"
                @click="activeCategory = cat"
                class="flex-1 text-[11px] font-bold uppercase transition-colors duration-300 z-10"
                :class="activeCategory === cat ? 'text-gray-900' : 'text-gray-900/40 hover:text-gray-900/60'"
              >
                {{ cat }}
              </button>
            </div>
          </div>
        </div>

        <!-- Coin List -->
        <div class="h-[70vh] overflow-y-auto custom-scrollbar pb-10">
          <div
            v-for="coin in coinList"
            :key="coin.originalSymbol"
            @click="selectSymbol(coin)"
            class="flex items-center justify-between px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer border-b border-gray-200"
          >
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="relative w-10 h-10 flex-shrink-0">
                <!-- Quote Currency (Bottom Left) - UNDER -->
                <img
                  :src="getQuoteLogo(coin.symbol)"
                  class="w-7 h-7 rounded-full absolute bottom-0 left-0 z-0 border border-gray-300 opacity-95 brightness-110"
                />
                <!-- Base Currency (Top Right) - ON TOP -->
                <img
                  :src="getCoinLogo(coin.symbol)"
                  :alt="coin.symbol"
                  class="w-7 h-7 rounded-full absolute top-0 right-0 z-10 border border-white/30 shadow-xl brightness-110"
                  @error="handleImageError"
                />
              </div>
              <span class="text-gray-900 font-medium">{{ coin.symbol }}</span>
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
              <span class="text-gray-900 font-medium text-sm min-w-[80px] text-right">
                {{ formatPrice(coin.price) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import MobileNav from '../components/MobileNav.vue';
import DesktopNav from '../components/DesktopNav.vue';
import CustomSelect from '../components/CustomSelect.vue';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import api from '../utils/api';
import { BINANCE_AVAILABLE_COINS } from '../utils/binanceCoins';
import { getCoinLogoUrl } from '../utils/coinLogos';
import axios from 'axios';
import { io } from 'socket.io-client';

const BINANCE_HTTP_API = 'https://api.binance.com/api/v3';
const BINANCE_WS_BASE = 'wss://stream.binance.com:9443';

const { t } = useI18n();

const route = useRoute();
const router = useRouter();
const isMobile = computed(() => window.innerWidth < 768);

const availableSymbols = BINANCE_AVAILABLE_COINS.map(coin => `${coin}/USDT`);

// Get symbol from query or default
const getInitialSymbol = () => {
  const querySymbol = route.query.symbol;
  if (querySymbol) {
    let s = querySymbol.trim().toUpperCase();
    
    // 1. Exact match (already has slash)
    if (s.includes('/')) return s;
    
    // 2. Crypto (BTCUSDT -> BTC/USDT)
    if (s.endsWith('USDT')) return s.replace(/USDT$/, '/USDT');
    
    // 3. Forex/Metals (GBPUSD -> GBP/USD, XAUUSD -> XAU/USD)
    if (s.length === 6) {
      return `${s.slice(0, 3)}/${s.slice(3)}`;
    }
    
    // 4. Fallback for other formats
    return s;
  }
  return 'BTC/USDT';
};

const selectedSymbol = ref(getInitialSymbol());
const orderSide = ref('buy');
const transactionMode = ref('market');
const orderPrice = ref('');
const orderQuantity = ref('');
const quantityMode = ref('currency');
const quantityPercent = ref(0);
const loading = ref(false);
const activeCategory = ref('hot');
const cryptoList = ref([
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 
  'LTCUSDT', 'ETCUSDT', 'BCHUSDT', 'DOTUSDT', 'NEOUSDT', 'IOTAUSDT', 'LUNAUSDT'
]);
const metalsList = ref(['XAUUSDT', 'XAGUSDT', 'XPTUSDT', 'XPDUSDT']);
const forexList = ref([
  'AUDUSD', 'BRLUSD', 'CADUSD', 'CHFUSD', 'CNYUSD', 'CZKUSD', 'DKKUSD',
  'EURUSD', 'GBPUSD', 'HKDUSD', 'HUFUSD', 'IDRUSD', 'ILSUSD', 'INRUSD', 'ISKUSD',
  'JPYUSD', 'KRWUSD', 'MXNUSD', 'MYRUSD', 'NOKUSD', 'NZDUSD', 'PHPUSD', 'PLNUSD',
  'RONUSD', 'SEKUSD', 'SGDUSD', 'THBUSD', 'TRYUSD', 'USDUSD', 'ZARUSD'
]);

const showSymbolSelector = ref(false);
const activeTab = ref('current');
const ticker = ref(null);
const orderBook = ref({ bids: [], asks: [] });
const wallets = ref([]);
const isLoading = ref(true);
const GOLD_API_KEY = '152ca358-8a3f-474d-9e7e-bb9af2057a3c';

const fetchGoldPrice = async (symbol) => {
  const clean = symbol.replace('/', '').toUpperCase();
  // Only for supported metals
  const metalCode = ['XAU', 'XAG', 'XPT', 'XPD'].find(m => clean.startsWith(m));
  if (!metalCode) return null;
  
  try {
    const res = await axios.get(`https://app.goldapi.net/api/price/${metalCode}/USD`, {
      headers: { 
        'x-api-key': GOLD_API_KEY,
        'Content-Type': 'application/json' 
      }
    });
    
    if (res.data && res.data.price) {
      return {
        price: res.data.price,
        bid: res.data.bid,
        ask: res.data.ask,
        low: res.data.low_price,
        high: res.data.high_price,
        change: res.data.ch || 0,
        changePercent: res.data.chp || 0
      };
    }
  } catch (err) {
    console.warn('GoldAPI fetch failed:', err);
  }
  return null;
};

const allTickersMap = ref({}); // Map of symbol -> ticker data
let lastDepthUpdate = 0;
let lastTickerUpdate = 0;
const coinList = computed(() => {
  let targetList = [];
  
  if (activeCategory.value === 'hot') {
    targetList = ['BTCUSDT', 'ETHUSDT', 'XRPUSDT', 'XAUUSDT', 'XAGUSDT', 'GBPUSD', 'EURUSD'];
  } else if (activeCategory.value === 'crypto') {
    targetList = cryptoList.value;
  } else if (activeCategory.value === 'metals') {
    targetList = metalsList.value;
  } else if (activeCategory.value === 'forex') {
    targetList = forexList.value;
  }
  
  return targetList.map(k => {
    // Better mapping lookup: Try Exact -> Try USDT appended -> Try without T
    let tickerData = allTickersMap.value[k];
    if (!tickerData && !k.endsWith('T')) {
        tickerData = allTickersMap.value[`${k}T`]; // AUDUSD -> AUDUSDT
    }
    
    // Formatting logic similar to Home page
    let displaySymbol = k;
    if (k.includes('USDT')) {
      if (['XAUUSDT', 'XAGUSDT', 'XPTUSDT', 'XPDUSDT'].includes(k)) {
        displaySymbol = k.replace('USDT', '/USD');
      } else {
        displaySymbol = k.replace('USDT', '/USDT');
      }
    } else if (k.length === 6) {
      displaySymbol = `${k.slice(0, 3)}/${k.slice(3)}`;
    }
    
    return {
      symbol: displaySymbol,
      originalSymbol: k,
      price: tickerData?.price || 0,
      change: tickerData?.change || 0,
    };
  });
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
  // For Forex pairs (typically around 1.0), use 5 decimals for precision
  if (numPrice >= 0.1 && numPrice <= 10) return numPrice.toFixed(5);
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

const selectSymbol = (data) => {
  // data can be a symbol string or an object with originalSymbol
  const symbol = typeof data === 'object' ? data.symbol : data;
  const originalSymbol = typeof data === 'object' ? data.originalSymbol : symbol.replace('/', '');
  
  selectedSymbol.value = symbol;
  showSymbolSelector.value = false;
  loadMarketData();
  connectWebSocket();
};

const getCoinLogo = (symbol) => {
  const base = symbol.split('/')[0];
  return getCoinLogoUrl(base);
};

const getQuoteLogo = (symbol) => {
  const quote = symbol.split('/')[1] || 'USD';
  return getCoinLogoUrl(quote);
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
  
  // Clear old data to prevent stale values
  ticker.value = null;
  orderBook.value = { bids: [], asks: [] };
  
  try {
    await Promise.all([
      loadTicker(symbol),
      loadOrderBook(symbol),
      loadWallets(),
    ]);

    // Mock data fallback if ticker is still empty
    // Trigger for ALL Forex/Metals (ending in /USD) or if specific known mock logic is needed
    if (!ticker.value && (symbol.includes('/USD') || !symbol.includes('USDT'))) {
        generateMockTicker(symbol);
    }
  } finally {
    isLoading.value = false;
  }
};

const mockUpdateInterval = ref(null);

const startMockUpdates = (symbol) => {
  if (mockUpdateInterval.value) clearInterval(mockUpdateInterval.value);
  
  let tickCount = 0;
  mockUpdateInterval.value = setInterval(async () => {
    if (!ticker.value) return;
    tickCount++;
    
    // 0. Update Real Metal Price every 10s
    if (tickCount % 10 === 0 && ['XAU', 'XAG', 'XPT', 'XPD'].some(m => symbol.includes(m))) {
        const goldData = await fetchGoldPrice(symbol);
        if (goldData) {
            ticker.value.price = goldData.price;
            ticker.value.highPrice = goldData.high;
            ticker.value.lowPrice = goldData.low;
            ticker.value.priceChangePercent = goldData.changePercent;
        }
    }
    
    // 0.5 Self-heal: Check if global map has better data (Binance fallback)
    const cleanSymbol = symbol.replace('/', '');
    let globalData = allTickersMap.value[cleanSymbol];
    if (!globalData && !cleanSymbol.endsWith('T')) {
        globalData = allTickersMap.value[`${cleanSymbol}T`];
    }
    
    const globalPrice = globalData?.price;
    
    if (globalPrice && Math.abs(globalPrice - ticker.value.price) / ticker.value.price > 0.1) {
        // Price discrepancy > 10%, assume we started with bad default (1.0) and global map now has info
         ticker.value.price = globalPrice;
         // Also update high/low to be reasonable around this new price
         ticker.value.highPrice = globalPrice * 1.02;
         ticker.value.lowPrice = globalPrice * 0.98;
    }

    // Safety Sanity Check for Standard Forex (avoid 4976 glitch)
    // Most forex pairs are < 200 (JPY ~150). If > 200 and NOT gold/silver/crypto/metals, reset.
    if (ticker.value.price > 200 && 
        ['EUR', 'GBP', 'AUD', 'CAD', 'CHF', 'NZD', 'USD'].some(c => symbol.includes(c)) &&
        !['BTC', 'ETH', 'BNB', 'XAU', 'XAG', 'XPT', 'XPD', 'PAX'].some(c => symbol.includes(c)) 
    ) {
         // Corrupt price detected, force reset to 1.0
         ticker.value.price = 1.0;
         ticker.value.highPrice = 1.02;
         ticker.value.lowPrice = 0.98;
    }
    
    // 1. Jitter Price
    const currentPrice = parseFloat(ticker.value.price);
    const volatility = currentPrice * 0.0001; // Small movement
    const change = (Math.random() - 0.5) * volatility;
    const newPrice = currentPrice + change;
    
    ticker.value = {
      ...ticker.value,
      price: newPrice,
      priceChange: (ticker.value.priceChange || 0) + change,
      // Update high/low if needed
      highPrice: Math.max(ticker.value.highPrice, newPrice),
      lowPrice: Math.min(ticker.value.lowPrice, newPrice)
    };
    
    // 2. Update Order Book based on new Price
    generateMockOrderBook(symbol, newPrice);
    
    // 3. Update Input Price if in market mode
    if (transactionMode.value === 'market' && (!orderPrice.value || Math.random() > 0.7)) {
       orderPrice.value = formatPrice(newPrice);
    }
    
  }, 1000); // 1-second updates
};

const generateMockTicker = (symbol) => {
    // Stop any existing mock updates first
    if (mockUpdateInterval.value) clearInterval(mockUpdateInterval.value);

    let price = 1.0;
    const cleanSymbol = symbol.replace('/', '');
    
    // 1. Try to get price from global ticker map (Popup data) first
    if (allTickersMap.value[cleanSymbol]?.price) {
        price = allTickersMap.value[cleanSymbol].price;
    } 
    // 2. Fallback to hardcoded reasonable defaults
    else {
        if (symbol.includes('BTC')) price = 65000;
        else if (symbol.includes('ETH')) price = 3500;
        else if (symbol.includes('XAU')) price = 2300;
        else if (symbol.includes('XAG')) price = 30;
        else if (symbol.includes('XPT')) price = 980;
        else if (symbol.includes('XPD')) price = 1050;
        else if (symbol.includes('GBP')) price = 1.27;
        else if (symbol.includes('EUR')) price = 1.09;
        else if (symbol.includes('JPY')) price = 150;
        else if (symbol.includes('AUD')) price = 0.65;
        else if (symbol.includes('CAD')) price = 0.73;
        else if (symbol.includes('CHF')) price = 1.10;
    }
    
    // Set initial state
    ticker.value = {
        price: price,
        priceChangePercent: 0.05,
        priceChange: price * 0.0005,
        volume: 100000,
        highPrice: price * 1.01,
        lowPrice: price * 0.99
    };
    
    if (transactionMode.value === 'market' && !orderPrice.value) {
       orderPrice.value = formatPrice(ticker.value.price);
    }
    
    // Start continuous updates
    startMockUpdates(symbol);
};

// Clean up on unmount
onUnmounted(() => {
  if (mockUpdateInterval.value) clearInterval(mockUpdateInterval.value);
  if (tickerWs) tickerWs.close();
  if (marketSocket) marketSocket.disconnect();
});

const loadTicker = async (symbol) => {
  const clean = symbol.toUpperCase().replace('/', '');
  
  // 1. Metals: Use instant defaults, fetch real data in background (non-blocking)
  if (['XAU', 'XAG', 'XPT', 'XPD'].some(m => clean.startsWith(m))) {
      // Set instant default values
      const defaults = { XAU: 2350, XAG: 30, XPT: 980, XPD: 1050 };
      const metalCode = ['XAU', 'XAG', 'XPT', 'XPD'].find(m => clean.startsWith(m));
      const defaultPrice = defaults[metalCode] || 2300;
      
      ticker.value = {
        price: defaultPrice,
        priceChangePercent: 0.05,
        priceChange: 0,
        volume: 100000,
        highPrice: defaultPrice * 1.01,
        lowPrice: defaultPrice * 0.99,
      };
      if (transactionMode.value === 'market' && !orderPrice.value) {
          orderPrice.value = formatPrice(ticker.value.price);
      }
      
      // Background fetch - don't await, let it update when ready
      fetchGoldPrice(symbol).then(goldData => {
        if (goldData && ticker.value) {
          ticker.value.price = goldData.price;
          ticker.value.highPrice = goldData.high || goldData.price * 1.01;
          ticker.value.lowPrice = goldData.low || goldData.price * 0.99;
          ticker.value.priceChangePercent = goldData.changePercent || 0;
        }
      }).catch(() => {});
      
      return; // Return immediately with defaults
  }

  // 2. Crypto/Forex: Try backend first with timeout
  try {
    const response = await Promise.race([
      api.get(`/market/ticker/${symbol}/24h`),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
    ]);
    
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
      return;
    }
  } catch (error) { }

  // 3. Binance fallback with timeout
  try {
     let binanceSymbol = clean;
     if (binanceSymbol.length === 6 && !binanceSymbol.endsWith('T') && 
        !['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE'].some(c => binanceSymbol.startsWith(c))) {
          binanceSymbol += 'T';
     }

     const binanceResponse = await Promise.race([
       axios.get(`${BINANCE_HTTP_API}/ticker/24hr`, { params: { symbol: binanceSymbol } }),
       new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
     ]);
     
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
  } catch (binanceError) { }
};

const loadOrderBook = async (symbol) => {
  const clean = symbol.toUpperCase().replace('/', '');
  
  // 1. Metals Optimization: Skip backend/binance real orderbook for now (GoldAPI doesn't give depth)
  if (['XAU', 'XAG', 'XPT', 'XPD'].some(m => clean.startsWith(m))) {
      generateMockOrderBook(symbol, ticker.value?.price || 2300);
      return;
  }
  
  // 2. Forex Optimization: Skip Binance (most Forex pairs don't exist), use mock
  const isForex = clean.endsWith('USD') && clean.length === 6 && 
                  !['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE'].some(c => clean.startsWith(c));
  if (isForex) {
      generateMockOrderBook(symbol, ticker.value?.price || 1.0);
      return;
  }

  try {
    const response = await api.get(`/market/orderbook/${symbol}`, { params: { limit: 12 } });
    if (response.data && (response.data.bids?.length > 0 || response.data.asks?.length > 0)) {
       orderBook.value = response.data;
    } else {
       throw new Error('Backend depth empty');
    }
  } catch (error) {
    // Fail silently on backend error to avoid console spam, try Binance
    
    // Binance Fallback
    try {
       let binanceSymbol = clean;
       // Forex fix: EURUSD -> EURUSDT
       if (binanceSymbol.length === 6 && !binanceSymbol.endsWith('T') && 
           !['BTC', 'ETH', 'BNB', 'SOL', 'XRP'].some(c => binanceSymbol.startsWith(c))) {
             binanceSymbol += 'T';
       }
       
       const binanceResponse = await axios.get(`${BINANCE_HTTP_API}/depth`, {
        params: { symbol: binanceSymbol, limit: 12 }
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
      // console.warn('Binance depth fallback failed');
    }
  }
  
  // Final Mock Fallback for Forex/Metals or missing data
  if ((!orderBook.value.bids.length || !orderBook.value.asks.length)) {
      if (ticker.value?.price) {
          generateMockOrderBook(symbol, ticker.value.price);
      }
  }
};

const generateMockOrderBook = (symbol, basePrice) => {
    const bids = [];
    const asks = [];
    const spread = basePrice * 0.0002; // 0.02% spread
    
    // Generate 15 levels
    for(let i=0; i<15; i++) {
        const bidPrice = basePrice - spread - (i * spread);
        const askPrice = basePrice + spread + (i * spread);
        
        bids.push({
            price: bidPrice,
            quantity: Math.random() * (basePrice > 1000 ? 0.5 : 1000)
        });
        
        asks.push({
            price: askPrice,
            quantity: Math.random() * (basePrice > 1000 ? 0.5 : 1000)
        });
    }
    
    orderBook.value = { bids, asks, timestamp: Date.now() };
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
// Watch for symbol changes from route
watch(() => route.query.symbol, (newSymbol) => {
  if (newSymbol) {
    let s = newSymbol.trim().toUpperCase();
    
    // 1. Exact match (already has slash)
    if (s.includes('/')) {
       selectedSymbol.value = s;
       loadMarketData();
       return;
    }
    
    // 2. Crypto (BTCUSDT -> BTC/USDT)
    if (s.endsWith('USDT')) {
      selectedSymbol.value = s.replace(/USDT$/, '/USDT');
      loadMarketData();
      return;
    }
    
    // 3. Forex/Metals (GBPUSD -> GBP/USD)
    if (s.length === 6) {
      selectedSymbol.value = `${s.slice(0, 3)}/${s.slice(3)}`;
      loadMarketData();
      return;
    }
    
    // 4. Default fallback
    selectedSymbol.value = s;
    loadMarketData();
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



// WebSocket for real-time updates
let tickerWs = null;
let marketSocket = null;
let wsReconnectTimer = null;
let wsBackoffMs = 1000;
const MAX_BACKOFF_MS = 30000;

// Update URL when symbol changes
watch(selectedSymbol, (newSymbol) => {
  if (newSymbol) {
    const query = { ...route.query, symbol: newSymbol.replace('/', '') };
    router.replace({ query });
  }
});

const processTickerUpdate = (tickerData) => {
  // Handle both array and single object data
  const updates = Array.isArray(tickerData) ? tickerData : [tickerData];
  
  updates.forEach(item => {
    if (!item?.s) return;
    const symbol = item.s;
    
    // Normalize symbol for the map (remove slash if present)
    const mapSymbol = symbol.replace('/', '');
    
    // Update the global map for the coin list
    allTickersMap.value[mapSymbol] = {
      price: Number(item.c),
      change: Number(item.P),
    };

    // Check if this update matches appropriate selected symbol
    const currentSymbolClean = selectedSymbol.value.replace('/', '');
    // Match exact OR match with T suffix (GBPUSD vs GBPUSDT)
    const isMatch = mapSymbol === currentSymbolClean || mapSymbol === `${currentSymbolClean}T`;
    
    if (!isMatch) return;
    
    const now = Date.now();
    // For the active ticker, we update more frequently or immediately
    if (ticker.value) {
      ticker.value.price = Number(item.c) || ticker.value.price;
      ticker.value.priceChangePercent = Number(item.P) || ticker.value.priceChangePercent;
      ticker.value.priceChange = Number(item.p || 0) || ticker.value.priceChange;
      ticker.value.volume = Number(item.v) || ticker.value.volume;
      ticker.value.highPrice = Number(item.h || item.c) || ticker.value.highPrice;
      ticker.value.lowPrice = Number(item.l || item.c) || ticker.value.lowPrice;
      lastTickerUpdate = now;

      if (transactionMode.value === 'market' && (!orderPrice.value || lastTickerUpdate % 5 === 0)) {
        orderPrice.value = formatPrice(ticker.value.price);
      }
      
      // Force mock orderbook update for Crypto/Forex/Metals if needed
      // Simple logic: if it ends in /USD (Forex/Metals), always regenerate to ensure liveliness
      if (selectedSymbol.value.endsWith('/USD') || !selectedSymbol.value.includes('USDT')) {
          generateMockOrderBook(selectedSymbol.value, ticker.value.price);
      }
    }
  });
};

const connectWebSocket = () => {
  // 1. Standard Binance WebSockets
  try {
    if (tickerWs) {
      tickerWs.close();
      tickerWs = null;
    }
    const currentSymbol = selectedSymbol.value.replace('/', '').toLowerCase();
    const wsUrl = `${BINANCE_WS_BASE}/stream?streams=!ticker@arr/${currentSymbol}@depth20@100ms`;
    tickerWs = new WebSocket(wsUrl);
    
    tickerWs.onopen = () => {
      wsBackoffMs = 1000;
    };
    
    tickerWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.stream === '!ticker@arr') {
            data.data.forEach(processTickerUpdate);
        } else if (data.stream?.endsWith('@depth20@100ms')) {
            const now = Date.now();
            if (now - lastDepthUpdate >= 500) {
                lastDepthUpdate = now;
                const depthData = data.data;
                orderBook.value = {
                    bids: (depthData.bids || []).map(([p, q]) => ({ price: Number(p), quantity: Number(q) })),
                    asks: (depthData.asks || []).map(([p, q]) => ({ price: Number(p), quantity: Number(q) })),
                    timestamp: now,
                };
            }
        }
      } catch (e) {}
    };
    
    tickerWs.onclose = () => {
      tickerWs = null;
      scheduleReconnect();
    };
  } catch (e) {
    scheduleReconnect();
  }

  // 2. Custom Backend Market Socket (Metals)
  if (marketSocket) {
      marketSocket.disconnect();
      marketSocket = null;
  }

  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const baseUrl = backendUrl.replace('/api', '');

  marketSocket = io(`${baseUrl}/market`, {
      transports: ['websocket', 'polling'],
      secure: true,
  });

  marketSocket.on('ticker', (data) => {
      processTickerUpdate(data);
  });
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
  // Fire all requests in parallel to speed up initial load
  Promise.all([
    loadMarketData(),
    loadCoinList()
  ]).catch(err => console.error('[Spot] Parallel load error:', err));
  
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
      tickerWs.close();
      tickerWs = null;
    }
    if (marketSocket) {
      marketSocket.disconnect();
      marketSocket = null;
    }
  } catch {
    // Ignore cleanup errors
  }
});
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-content-anim {
  animation: modal-slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-fade-leave-active .modal-content-anim {
  animation: modal-slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1) reverse;
}

@keyframes modal-slide-in {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

/* For desktop centered modal */
@media (min-width: 768px) {
  @keyframes modal-slide-in {
    from {
      transform: scale(0.95) translateY(20px);
      opacity: 0;
    }
    to {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }
  
  .modal-fade-enter-active .modal-content-anim,
  .modal-fade-leave-active .modal-content-anim {
    transition: all 0.3s ease;
    animation: none;
  }
  
  .modal-fade-enter-from .modal-content-anim,
  .modal-fade-leave-to .modal-content-anim {
    transform: scale(0.95) translateY(20px);
    opacity: 0;
  }
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
