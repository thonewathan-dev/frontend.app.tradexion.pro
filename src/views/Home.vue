<template>
  <div class="min-h-screen">
    <MobileNav v-if="isMobile" />
    <div class="md:flex">
      <DesktopNav v-if="!isMobile" />
      <main class="flex-1 pb-16 md:pb-0">
        <!-- Header with Profile and Language Selector -->
        <div class="bg-[#fafafa] border-b border-gray-200 px-4 pt-safe-header pb-3 flex items-center justify-between relative z-50">
          <!-- Profile Icon (Left) -->
          <button
            @click="goToAssets"
            class="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <svg class="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
          
          <!-- Language Selector (Right) -->
          <div class="relative z-[100]" ref="languageSelectorRef">
            <button
              @click.stop="showLanguageMenu = !showLanguageMenu"
              class="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity overflow-hidden"
            >
              <img
                :src="getCurrentFlag()"
                :alt="currentLanguage"
                class="w-full h-full object-cover"
              />
            </button>
            
            <!-- Language Dropdown (Below) -->
            <transition name="fade">
              <div
                v-if="showLanguageMenu"
                @click.stop
                class="absolute right-0 top-full mt-1 bg-[#fafafa] rounded-lg shadow-xl overflow-hidden z-[9999] min-w-[160px] border border-gray-200"
              >
                <div class="py-1">
                  <button
                    v-for="lang in languages"
                    :key="lang.code"
                    @click="changeLanguage(lang.code)"
                    :class="[
                      'w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100 transition-colors',
                      currentLanguage === lang.code ? 'text-blue-600 font-medium' : 'text-gray-700'
                    ]"
                  >
                    <img
                      :src="lang.flag"
                      :alt="lang.name"
                      class="w-5 h-5 rounded-full object-cover flex-shrink-0"
                    />
                    <span>{{ lang.name }}</span>
                    <svg
                      v-if="currentLanguage === lang.code"
                      class="w-4 h-4 text-blue-600 ml-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>
        
        <!-- Banner Carousel -->
        <div class="w-full px-3 md:px-4 py-3 md:py-4">
          <div 
            class="overflow-hidden relative rounded-lg md:rounded-xl cursor-grab active:cursor-grabbing w-full aspect-[96/35]"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @mouseup="handleMouseUp"
            @mouseleave="handleMouseUp"
          >
            <div
              class="flex h-full"
              :style="{ 
                transform: `translateX(-${(currentBannerIndex * 100) + dragOffset}%)`,
                transition: isDragging ? 'none' : 'transform 0.5s ease-in-out'
              }"
            >
              <div
                v-for="(banner, index) in banners"
                :key="index"
                class="w-full h-full flex-shrink-0 px-2 overflow-hidden"
              >
                <img
                  :src="banner"
                  :alt="`Banner ${index + 1}`"
                  class="w-full h-full object-cover pointer-events-none rounded-lg"
                />
              </div>
            </div>
            
            <!-- Pagination Dots -->
            <div class="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-1.5 z-10">
              <button
                v-for="(banner, index) in banners"
                :key="index"
                @click="goToBanner(index)"
                :class="[
                  'rounded-full transition-all duration-300',
                  currentBannerIndex === index 
                    ? 'bg-binance-yellow w-6 h-1' 
                    : 'bg-gray-300 w-1 h-1 hover:bg-gray-400'
                ]"
                :aria-label="`Go to banner ${index + 1}`"
              />
            </div>
          </div>
        </div>
        
        <!-- Running Notice Line -->
        <div class="w-full overflow-hidden relative py-2.5 mb-3">
          <div class="flex items-center gap-3 px-3 md:px-4">
            <!-- Speaker Icon -->
            <div class="flex-shrink-0">
              <svg class="w-4 h-4 text-binance-yellow" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4.617-3.793a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clip-rule="evenodd" />
              </svg>
            </div>
            <!-- Scrolling Text -->
            <div class="flex-1 overflow-hidden relative h-5">
              <div class="absolute inset-0 whitespace-nowrap">
                <span 
                  :key="currentNotice"
                  class="text-gray-900 text-sm font-medium inline-block animate-marquee"
                  :style="{ animation: 'marquee 12s linear infinite' }"
                >
                  {{ currentNotice }}
                </span>
              </div>
            </div>
            <!-- Menu Icon -->
            <div class="flex-shrink-0">
              <button class="p-1 hover:bg-gray-100 rounded transition-colors">
                <svg class="w-4 h-4 text-gray-900/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Top 3 Coins List -->
        <div class="px-3 md:px-4 mb-3">
          <div class="grid grid-cols-3 gap-2 md:gap-3">
            <div
              v-for="(ticker, index) in top3Tickers"
              :key="ticker?.originalSymbol || index"
              class="glass-card rounded-lg p-3 cursor-pointer hover:border-blue-500/50 transition-colors relative overflow-hidden group"
              @click="ticker && selectSymbol(ticker.originalSymbol || ticker.symbol)"
            >
              <!-- Decorative Background Overlay - Inverted for White Theme -->
              <img src="/background shadow.png" alt="" class="absolute top-0 right-0 w-14 h-14 md:w-24 md:h-24 object-contain pointer-events-none group-hover:scale-110 transition-transform duration-700 invert opacity-15" />
              
              <div v-if="ticker" class="flex flex-col items-start text-left relative z-10">
                <div class="relative w-12 h-12 md:w-14 md:h-14 mb-3">
                  <!-- Quote Currency (Bottom Left) - UNDER -->
                  <img
                    :src="getQuoteLogo(ticker.symbol)"
                    class="w-8 h-8 md:w-10 md:h-10 rounded-full absolute bottom-0 left-0 z-0 border border-gray-300 opacity-95 brightness-110"
                  />
                  <!-- Base Currency (Top Right) - ON TOP -->
                  <img
                    :src="getCoinLogo(ticker.symbol)"
                    :alt="ticker.symbol"
                    class="w-8 h-8 md:w-10 md:h-10 rounded-full absolute top-0 right-0 z-10 border border-white/30 shadow-xl brightness-110"
                    @error="handleImageError"
                  />
                </div>
                <div class="text-xs md:text-sm font-semibold text-gray-900 mb-1">{{ ticker.symbol }}</div>
                <!-- Top 3: percentage -->
                <span
                  v-if="!ticker.isPlaceholder"
                  :class="[
                    'text-xs px-2 py-0.5 rounded-full font-medium mb-1',
                    ticker.change >= 0 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/50' 
                      : 'bg-red-500/20 text-red-300 border border-red-500/50'
                  ]"
                >
                  {{ ticker.change >= 0 ? '+' : '' }}{{ ticker.change.toFixed(2) }}%
                </span>
                <div
                  v-else
                  class="h-4 bg-gray-100 rounded-full w-14 mb-1 animate-pulse"
                ></div>
                <!-- Top 3: last price -->
                <div
                  v-if="!ticker.isPlaceholder"
                  class="text-sm md:text-base font-bold text-gray-900 mb-0.5"
                >
                  ${{ formatPrice(ticker.price) }}
                </div>
                <div
                  v-else
                  class="h-4 bg-gray-100 rounded w-16 mb-0.5 animate-pulse"
                ></div>
                <!-- Top 3: volume -->
                <div
                  v-if="!ticker.isPlaceholder"
                  class="text-xs text-gray-900/60"
                >
                  Vol {{ formatVolume(ticker.volume) }}
              </div>
                <div
                  v-else
                  class="h-3 bg-gray-100 rounded w-20 animate-pulse"
                ></div>
              </div>
              <div v-else class="animate-pulse flex flex-col items-start gap-2 relative z-10 w-full">
                  <div class="w-10 h-10 rounded-full bg-gray-100"></div>
                  <div class="h-4 bg-gray-100 rounded w-3/4"></div>
                  <div class="h-6 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Quick Menu Items -->
        <div class="px-3 md:px-4 mb-4">
          <div class="grid grid-cols-4 gap-2 md:gap-3">
            <div
              v-for="(menu, index) in quickMenus"
              :key="index"
              class="flex flex-col items-center text-center cursor-pointer hover:opacity-80 transition-opacity"
              @click="handleQuickMenuClick(menu.name)"
            >
              <img
                :src="menu.icon"
                :alt="menu.name"
                class="w-10 h-10 md:w-12 md:h-12 mb-2 object-contain"
                @error="handleImageError"
              />
              <span class="text-xs md:text-sm font-medium text-gray-900">{{ menu.label }}</span>
            </div>
          </div>
        </div>


        
        <!-- Quick Recharge Section -->
        <div class="px-3 md:px-4 mb-4">
          <div
            @click="$router.push('/deposit')"
            class="glass-card rounded-lg p-4 cursor-pointer hover:border-blue-500/50 transition-colors flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <img
                :src="quickRechargeIcon"
                alt="Quick recharge"
                class="w-12 h-12 md:w-14 md:h-14 object-contain"
                @error="handleImageError"
              />
              <div>
                <div class="text-gray-900 font-semibold text-sm md:text-base mb-1">Quick recharge</div>
                <div class="text-gray-900/60 text-xs md:text-sm">Support Coin BTC/USDT/ETH</div>
              </div>
            </div>
            <svg class="w-5 h-5 md:w-6 md:h-6 text-gray-900/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <!-- Category Switcher (Refined Size & Spacing) -->
        <div class="px-3 md:px-4 mb-2 flex justify-start">
          <div class="glass-card-no-hover rounded-full p-1 flex relative w-[280px]">
            <!-- Sliding Indicator -->
            <div 
              class="absolute top-1 bottom-1 transition-all duration-300 ease-out bg-gray-100 rounded-full"
              :style="{
                width: 'calc(25% - 2px)',
                left: activeCategory === 'hot' ? '1%' : activeCategory === 'crypto' ? '26%' : activeCategory === 'metals' ? '51%' : '76%'
              }"
            ></div>
            
            <button 
              @click="activeCategory = 'hot'"
              class="flex-1 py-1.5 relative z-10 text-[10px] font-bold uppercase transition-colors duration-200"
              :class="activeCategory === 'hot' ? 'text-gray-900' : 'text-gray-900/40'"
            >
              Hot
            </button>
            <button 
              @click="activeCategory = 'crypto'"
              class="flex-1 py-1.5 relative z-10 text-[10px] font-bold uppercase transition-colors duration-200"
              :class="activeCategory === 'crypto' ? 'text-gray-900' : 'text-gray-900/40'"
            >
              Crypto
            </button>
            <button 
              @click="activeCategory = 'metals'"
              class="flex-1 py-1.5 relative z-10 text-[10px] font-bold uppercase transition-colors duration-200"
              :class="activeCategory === 'metals' ? 'text-gray-900' : 'text-gray-900/40'"
            >
              Metals
            </button>
            <button 
              @click="activeCategory = 'forex'"
              class="flex-1 py-1.5 relative z-10 text-[10px] font-bold uppercase transition-colors duration-200"
              :class="activeCategory === 'forex' ? 'text-gray-900' : 'text-gray-900/40'"
            >
              Forex
            </button>
          </div>
        </div>

        <div class="px-3 md:px-8 pt-1 md:pt-4 pb-8">
          <!-- SKELETON LOADER -->
          <div v-if="isInitialLoading">
            <!-- Mobile Skeleton -->
            <div class="flex flex-col gap-2 md:hidden mb-6">
              <div v-for="i in 6" :key="i" class="glass-card rounded-lg p-3 animate-pulse">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2.5 flex-1 min-w-0">
                    <div class="w-11 h-11 rounded-full bg-gray-100 flex-shrink-0"></div>
                    <div class="flex flex-col gap-2">
                       <div class="h-4 bg-gray-100 rounded w-16"></div>
                       <div class="h-3 bg-gray-100 rounded w-20"></div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 flex-shrink-0">
                    <div class="h-5 bg-gray-100 rounded w-20"></div>
                    <div class="h-6 bg-gray-100 rounded-full w-16"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Desktop Skeleton -->
            <div class="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div v-for="i in 8" :key="i" class="glass-card rounded-xl p-4 animate-pulse">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <div class="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0"></div>
                    <div class="h-4 bg-gray-100 rounded w-16"></div>
                  </div>
                  <div class="h-6 bg-gray-100 rounded-full w-16"></div>
                </div>
                <div class="h-8 bg-gray-100 rounded w-32 mb-2"></div>
                <div class="h-3 bg-gray-100 rounded w-24"></div>
              </div>
            </div>
          </div>

          <!-- Market Tickers - Always visible once loaded -->
          <div v-else>
            <!-- Mobile: Compact horizontal cards -->
            <div class="flex flex-col gap-2 md:hidden mb-6">
              <div
                v-for="ticker in tickers"
                :key="ticker.originalSymbol || ticker.symbol"
                class="glass-card rounded-lg p-3 cursor-pointer active:scale-[0.98] transition-transform"
                @click="selectSymbol(ticker.originalSymbol || ticker.symbol)"
              >
                <div class="flex items-center justify-between">
                  <!-- Left: Logo and Name -->
                  <div class="flex items-center gap-2.5 flex-1 min-w-0">
                    <div class="relative w-11 h-11 md:w-12 md:h-12 flex-shrink-0">
                      <!-- Quote Currency (Bottom Left) - UNDER -->
                      <img
                        :src="getQuoteLogo(ticker.symbol)"
                        class="w-7 h-7 md:w-8 md:h-8 rounded-full absolute bottom-0 left-0 z-0 border border-gray-300 opacity-95 brightness-110"
                      />
                      <!-- Base Currency (Top Right) - ON TOP -->
                      <img
                        :src="getCoinLogo(ticker.symbol)"
                        :alt="ticker.symbol"
                        class="w-7 h-7 md:w-8 md:h-8 rounded-full absolute top-0 right-0 z-10 border border-white/30 shadow-lg brightness-110"
                        @error="handleImageError"
                      />
                    </div>
                    <div class="flex flex-col min-w-0">
                      <span class="text-sm font-semibold text-gray-900 truncate">{{ ticker.symbol.split('/')[0] }}</span>
                      <span class="text-xs text-gray-900/60">{{ $t('home.volume') }} {{ formatVolume(ticker.volume) }}</span>
                    </div>
                  </div>
                  
                  <!-- Right: Price and Change -->
                  <div class="flex items-center gap-3 flex-shrink-0">
                    <div class="text-right">
                    <div
                      v-if="!ticker.isPlaceholder"
                      class="text-base font-bold text-gray-900 leading-tight"
                    >
                      ${{ formatPrice(ticker.price) }}
                    </div>
                    <div
                      v-else
                      class="h-4 bg-gray-100 rounded w-16 animate-pulse"
                    ></div>
                    </div>
                    <span
                    v-if="!ticker.isPlaceholder"
                      :class="[
                        'text-xs font-semibold whitespace-nowrap flex items-center gap-0.5',
                        ticker.change >= 0 
                          ? 'text-binance-green' 
                          : 'text-binance-red'
                      ]"
                    >
                      {{ ticker.change >= 0 ? '+' : '' }}{{ ticker.change.toFixed(2) }}%
                    </span>
                    <div
                      v-else
                      class="h-4 bg-gray-100 rounded-full w-14 animate-pulse"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Desktop: Grid layout -->
            <div class="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div
              v-for="ticker in tickers"
              :key="ticker.originalSymbol || ticker.symbol"
              class="glass-card rounded-xl p-4 cursor-pointer"
              @click="selectSymbol(ticker.originalSymbol || ticker.symbol)"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <div class="relative w-12 h-12 flex-shrink-0">
                    <!-- Quote Currency (Bottom Left) - UNDER -->
                    <img
                      :src="getQuoteLogo(ticker.symbol)"
                      class="w-8 h-8 rounded-full absolute bottom-0 left-0 z-0 border border-gray-300 opacity-95 brightness-110"
                    />
                    <!-- Base Currency (Top Right) - ON TOP -->
                    <img
                      :src="getCoinLogo(ticker.symbol)"
                      :alt="ticker.symbol"
                      class="w-8 h-8 rounded-full absolute top-0 right-0 z-10 border border-white/30 shadow-xl brightness-110"
                      @error="handleImageError"
                    />
                  </div>
                  <span class="text-sm font-semibold text-gray-900">{{ ticker.symbol }}</span>
                </div>
                <span
                  v-if="!ticker.isPlaceholder"
                  :class="[
                    'text-xs px-2 py-1 rounded-full font-medium',
                    ticker.change >= 0 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/50' 
                      : 'bg-red-500/20 text-red-300 border border-red-500/50'
                  ]"
                >
                  {{ ticker.change >= 0 ? '+' : '' }}{{ ticker.change.toFixed(2) }}%
                </span>
                <div
                  v-else
                  class="h-4 bg-gray-100 rounded-full w-16 animate-pulse"
                ></div>
              </div>
              <div
                v-if="!ticker.isPlaceholder"
                class="text-2xl font-bold text-gray-900 mb-1"
              >
                ${{ formatPrice(ticker.price) }}
              </div>
              <div
                v-else
                class="h-5 bg-gray-100 rounded w-24 mb-1 animate-pulse"
              ></div>
              <div
                v-if="!ticker.isPlaceholder"
                class="text-xs text-gray-900/60"
              >
                {{ $t('home.volume') }}: {{ formatVolume(ticker.volume) }}
              </div>
              <div
                v-else
                class="h-3 bg-gray-100 rounded w-24 animate-pulse"
              ></div>
            </div>
          </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/auth';
import { useLanguage } from '../composables/useLanguage';
import MobileNav from '../components/MobileNav.vue';
import DesktopNav from '../components/DesktopNav.vue';
import { getCoinLogoUrl } from '../utils/coinLogos';
import api from '../utils/api';

const router = useRouter();
const { t } = useI18n();
const authStore = useAuthStore();
const { languages, currentLanguage, showLanguageMenu, getCurrentFlag, changeLanguage } = useLanguage();
const isMobile = computed(() => window.innerWidth < 768);
const languageSelectorRef = ref(null);

// WebSocket URL
const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws/!ticker@arr';

// Reactive tickerMap - single source of truth, NEVER cleared
const tickerMap = reactive({});

// Track initial load state
const isInitialLoading = ref(true);

const initializeTickerMap = (symbols) => {
  symbols.forEach((symbol) => {
    if (!tickerMap[symbol]) {
      // Default formatting: BTCUSDT -> BTC/USDT, EURUSD -> EUR/USD
      let displaySymbol = symbol;
      if (symbol.includes('USDT')) {
        // Special case for metals display naming handled in 'tickers' computed if needed,
        // but here we just establish the base reactive object.
        displaySymbol = symbol.replace('USDT', '/USDT');
      } else if (symbol.length === 6) {
        displaySymbol = `${symbol.slice(0, 3)}/${symbol.slice(3)}`;
      }
      
      tickerMap[symbol] = reactive({
        symbol: displaySymbol,
        originalSymbol: symbol,
        price: 0,
        change: 0,
        volume: 0,
        isPlaceholder: true
      });
    }
  });
};

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
const SYMBOLS = ref([]);

// Computed tickers - Filtered based on active category with specific display formatting
const tickers = computed(() => {
  if (activeCategory.value === 'hot') {
    const hotKeys = ['BTCUSDT', 'ETHUSDT', 'XRPUSDT', 'XAUUSDT', 'XAGUSDT', 'GBPUSD', 'EURUSD'];
    return hotKeys.map(k => {
      const t = tickerMap[k];
      if (!t) return null;
      // Pair formatting for Hot page
      let displaySymbol = k;
      if (k.includes('USDT')) {
        if (['XAUUSDT', 'XAGUSDT'].includes(k)) {
          displaySymbol = k.replace('USDT', '/USD');
        } else {
          displaySymbol = k.replace('USDT', '/USDT');
        }
      } else if (k.length === 6) {
        displaySymbol = `${k.slice(0, 3)}/${k.slice(3)}`;
      }
      return { ...t, symbol: displaySymbol };
    }).filter(Boolean);
  }
  
  if (activeCategory.value === 'crypto') {
    return cryptoList.value.map(k => {
      const t = tickerMap[k];
      if (!t) return null;
      return { ...t, symbol: k.replace('USDT', '/USDT') };
    }).filter(Boolean);
  }
  
  if (activeCategory.value === 'metals') {
    return metalsList.value.map(k => {
      const t = tickerMap[k];
      if (!t) return null;
      // User specifically wants XAU/USD for metals
      return { ...t, symbol: k.replace('USDT', '/USD') };
    }).filter(Boolean);
  }
  
  if (activeCategory.value === 'forex') {
    return forexList.value.map(k => {
      const t = tickerMap[k];
      if (!t) return null;
      // User wants {CODE}/USD
      return { ...t, symbol: `${k.slice(0, 3)}/${k.slice(3)}` };
    }).filter(Boolean);
  }
  
  return [];
});

// Top 3 tickers for featured section
const top3Tickers = computed(() => {
  const targetSymbols = ['BTCUSDT', 'XAUUSDT', 'EURUSD'];
  return targetSymbols.map(k => {
    const t = tickerMap[k];
    if (!t) return null;
    
    let displaySymbol = k;
    if (k === 'BTCUSDT') {
      displaySymbol = 'BTC/USDT';
    } else if (k === 'XAUUSDT') {
      displaySymbol = 'XAU/USD';
    } else if (k === 'EURUSD') {
      displaySymbol = 'EUR/USD';
    } else if (k.includes('USDT')) {
      displaySymbol = k.replace('USDT', '/USDT');
    }
    
    return { ...t, symbol: displaySymbol };
  });
});

// Quick menu items
const quickMenus = [
  {
    name: 'services',
    label: 'Services',
    icon: new URL('../assets/quick-menus/services.png', import.meta.url).href
  },
  {
    name: 'invite',
    label: 'Invite',
    icon: new URL('../assets/quick-menus/invite.png', import.meta.url).href
  },
  {
    name: 'loan',
    label: 'Loan',
    icon: new URL('../assets/quick-menus/loan.png', import.meta.url).href
  },
  {
    name: 'tuto-center',
    label: 'Tuto-Center',
    icon: new URL('../assets/quick-menus/tuto-center.png', import.meta.url).href
  }
];

const handleQuickMenuClick = (menuName) => {
  console.log('Quick menu clicked:', menuName);
  if (menuName === 'services') {
    router.push('/chat');
  }
  // Add other menu handlers here if needed
};

const quickRechargeIcon = new URL('../assets/quick-menus/quickrecharge.png', import.meta.url).href;

// Banner carousel
const banners = [
  new URL('../assets/banners/01.jpeg', import.meta.url).href,
  new URL('../assets/banners/02.jpeg', import.meta.url).href,
  new URL('../assets/banners/03.jpeg', import.meta.url).href
];
const currentBannerIndex = ref(0);
let bannerInterval = null;

const notices = [
  'App Upgrade and Optimization Announcement',
  'Web Update and Optimization Announcement',
  'The loan function is online',
  'Tips for users to beware of counterfeit websites and apps',
  'Invite friends to win limited gifts',
  'New user registration and authentication, enjoy 5USDT airdrop',
  'Server Upgrade Announcement'
];
const currentNotice = ref(notices[0]);
let noticeInterval = null;

const getRandomNotice = () => {
  const randomIndex = Math.floor(Math.random() * notices.length);
  return notices[randomIndex];
};

const isDragging = ref(false);
const dragStart = ref(0);
const dragOffset = ref(0);
const startX = ref(0);

const handleTouchStart = (e) => {
  isDragging.value = true;
  startX.value = e.touches[0].clientX;
  dragStart.value = currentBannerIndex.value;
  if (bannerInterval) {
    clearInterval(bannerInterval);
  }
};

const handleTouchMove = (e) => {
  if (!isDragging.value) return;
  const currentX = e.touches[0].clientX;
  const diff = startX.value - currentX;
  dragOffset.value = (diff / window.innerWidth) * 100;
};

const handleTouchEnd = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  
  const threshold = 0.3;
  if (Math.abs(dragOffset.value) > threshold * 100) {
    if (dragOffset.value > 0) {
      nextBanner();
    } else {
      prevBanner();
    }
  }
  
  dragOffset.value = 0;
  startAutoSlide();
};

const handleMouseDown = (e) => {
  isDragging.value = true;
  startX.value = e.clientX;
  dragStart.value = currentBannerIndex.value;
  if (bannerInterval) {
    clearInterval(bannerInterval);
  }
};

const handleMouseMove = (e) => {
  if (!isDragging.value) return;
  const currentX = e.clientX;
  const diff = startX.value - currentX;
  dragOffset.value = (diff / window.innerWidth) * 100;
};

const handleMouseUp = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  
  const threshold = 0.3;
  if (Math.abs(dragOffset.value) > threshold * 100) {
    if (dragOffset.value > 0) {
      nextBanner();
    } else {
      prevBanner();
    }
  }
  
  dragOffset.value = 0;
  startAutoSlide();
};

const nextBanner = () => {
  currentBannerIndex.value = (currentBannerIndex.value + 1) % banners.length;
};

const prevBanner = () => {
  currentBannerIndex.value = currentBannerIndex.value === 0 ? banners.length - 1 : currentBannerIndex.value - 1;
};

const goToBanner = (index) => {
  currentBannerIndex.value = index;
  if (bannerInterval) {
    clearInterval(bannerInterval);
  }
  startAutoSlide();
};

const startAutoSlide = () => {
  if (bannerInterval) {
    clearInterval(bannerInterval);
  }
  bannerInterval = setInterval(() => {
    if (!isDragging.value) {
      nextBanner();
    }
  }, 3000);
};

const goToAssets = () => {
  if (authStore.isAuthenticated) {
    router.push('/assets');
  } else {
    router.push('/login');
  }
};

const selectSymbol = (symbol) => {
  router.push({ path: '/kline', query: { symbol } });
};

const formatPrice = (price) => {
  if (price === 0) return '0.00';
  if (price >= 1000) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(4);
  if (price >= 0.0001) return price.toFixed(6);
  return price.toFixed(8);
};

const formatVolume = (volume) => {
  if (volume >= 1e9) return (volume / 1e9).toFixed(2) + 'B';
  if (volume >= 1e6) return (volume / 1e6).toFixed(2) + 'M';
  if (volume >= 1e3) return (volume / 1e3).toFixed(2) + 'K';
  return volume.toFixed(2);
};
let pollMetals = null;

const getCoinLogo = (symbol) => {
  const base = symbol.split('/')[0];
  return getCoinLogoUrl(base);
};

const getQuoteLogo = (symbol) => {
  const quote = symbol.split('/')[1] || 'USD';
  return getCoinLogoUrl(quote);
};

const handleImageError = (event) => {
  const symbol = event.target.alt ? event.target.alt.split('/')[0] : 'Coin';
  event.target.src = `https://ui-avatars.com/api/?name=${symbol}&background=random&color=fff&rounded=true`;
};

// Load initial prices from backend and discover all available symbols
const loadInitialTickers = async () => {
  try {
    const response = await api.get('/market/ticker/24h');
    const data = Array.isArray(response.data) ? response.data : [];

    const allSymbols = data.map(t => t.symbol);
    initializeTickerMap(allSymbols);
    // Ensure our hardcoded list symbols are also initialized if they weren't in the data
    initializeTickerMap([...cryptoList.value, ...metalsList.value, ...forexList.value]);
    
    SYMBOLS.value = allSymbols;

    data.forEach((t) => {
      const ticker = tickerMap[t.symbol];
      if (!ticker) return;

      const price = Number.parseFloat(t.price ?? t.lastPrice);
      const changePercent = Number.parseFloat(
        t.priceChangePercent ?? t.price_change_percent ?? 0,
      );
      const volume = Number.parseFloat(t.volume ?? 0);

      if (!Number.isFinite(price)) return;

      ticker.price = price;
      ticker.change = changePercent;
      ticker.volume = volume;
      ticker.isPlaceholder = false;
    });
  } catch (e) {
    console.error('[Home] Failed to load initial tickers:', e);
  } finally {
    isInitialLoading.value = false;
  }
};

import { io } from 'socket.io-client';

// WebSocket state management
let tickerWs = null;
let marketSocket = null; // Custom backend socket for Metals
let wsReconnectTimer = null;
let wsBackoffMs = 1000;
const MAX_BACKOFF_MS = 30000;

// Process WebSocket updates - MUTATE existing objects to prevent UI flicker
const processTickerUpdate = (tickerData) => {
  if (!tickerData?.s) return;
  
  const symbol = tickerData.s;
  const ticker = tickerMap[symbol];
  if (!ticker) return;
  
  const price = Number.parseFloat(tickerData.c);
  const change = Number.parseFloat(tickerData.P) || 0;
  const volume = Number.parseFloat(tickerData.v) || 0;
  
  if (!Number.isFinite(price)) return;
  
  // Only update if values changed to minimize reactivity triggers
  if (
    ticker.price !== price ||
    ticker.change !== change ||
    ticker.volume !== volume ||
    ticker.isPlaceholder
  ) {
    ticker.price = price;
    ticker.change = change;
    ticker.volume = volume;
    ticker.isPlaceholder = false;
  }
};

// Connect to backend market socket
const connectMarketSocket = () => {
    // Determine backend URL
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    // Remove /api if present to get base URL
    const baseUrl = backendUrl.replace('/api', '');

    marketSocket = io(`${baseUrl}/market`, {
        transports: ['websocket', 'polling'],
        secure: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });

    marketSocket.on('connect', () => {
        console.log('[MarketWS] Connected to backend market stream');
    });

    marketSocket.on('ticker', (data) => {
        if (Array.isArray(data)) {
            data.forEach(update => {
                const symbol = update.s;
                if (!symbol) return;
                
                const ticker = tickerMap[symbol];
                if (ticker) {
                    ticker.price = parseFloat(update.c);
                    ticker.change = parseFloat(update.P);
                    ticker.volume = parseFloat(update.v);
                    ticker.isPlaceholder = false;
                }
            });
        }
    });

    marketSocket.on('connect_error', (err) => {
        console.warn('[MarketWS] Connection error:', err.message);
    });
};

// WebSocket connection management
const connectWebSocket = () => {
  if (tickerWs?.readyState === WebSocket.OPEN) return;
  
  console.log('[WS] Connecting to Binance...');
  
  try {
    if (tickerWs) {
      tickerWs.onopen = null;
      tickerWs.onmessage = null;
      tickerWs.onerror = null;
      tickerWs.onclose = null;
      tickerWs.close();
    }
  } catch (e) {
    console.warn('[WS] Cleanup error:', e);
  }
  
  try {
    tickerWs = new WebSocket(BINANCE_WS_URL);
    
    tickerWs.onopen = () => {
      console.log('[WS] Connected successfully');
      wsBackoffMs = 1000;
    };
    
    tickerWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) {
          data.forEach(processTickerUpdate);
        }
      } catch (e) {
        console.error('[WS] Parse error:', e);
      }
    };
    
    tickerWs.onerror = (e) => {
      console.error('[WS] Error:', e);
    };
    
    tickerWs.onclose = (e) => {
      console.warn('[WS] Closed:', e.code, e.reason);
      tickerWs = null;
      scheduleReconnect();
    };
  } catch (e) {
    console.error('[WS] Setup error:', e);
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

let clickOutsideHandler = null;

onMounted(async () => {
  console.log('[Home] Mounted. Initializing dynamic tickers...');
  
  // First load all symbols and last-known prices from backend
  await loadInitialTickers();
  
  connectWebSocket(); // Binance
  connectMarketSocket(); // Backend Metals & Forex
  
  startAutoSlide();
  
  currentNotice.value = getRandomNotice();
  noticeInterval = setInterval(() => {
    currentNotice.value = getRandomNotice();
  }, 12000);
  
  clickOutsideHandler = (event) => {
    if (showLanguageMenu.value && languageSelectorRef.value && !languageSelectorRef.value.contains(event.target)) {
      showLanguageMenu.value = false;
    }
  };
  document.addEventListener('click', clickOutsideHandler);

  // Poll backend for non-WS assets (Metals) - KEEP as backup or for initial sync
  // Reduced frequency since we have WS now
    pollMetals = setInterval(async () => {
        try {
            const response = await api.get('/market/ticker/24h');
            if (response.data && Array.isArray(response.data)) {
                response.data.forEach(t => {
                   const symbol = t.symbol;
                   if (['XAUUSDT', 'XAGUSDT', 'XPTUSDT', 'XPDUSDT'].includes(symbol)) {
                       const ticker = tickerMap[symbol];
                       if (ticker) {
                           // Only update if distinct difference (prevent jitter fighting)
                           const newPrice = parseFloat(t.price);
                           if (Math.abs(ticker.price - newPrice) / newPrice > 0.001) {
                               ticker.price = newPrice;
                               ticker.change = parseFloat(t.priceChangePercent);
                               ticker.volume = parseFloat(t.volume);
                               ticker.isPlaceholder = false;
                           }
                       }
                   }
                });
            }
        } catch (e) {
            // silent
        }
    }, 5000);
});

  onUnmounted(() => {
  if (marketSocket) {
      marketSocket.disconnect();
      marketSocket = null;
  }
  if (wsReconnectTimer) {
    clearTimeout(wsReconnectTimer);
  }
  
  try {
    if (tickerWs) {
      tickerWs.onopen = null;
      tickerWs.onmessage = null;
      tickerWs.onerror = null;
      tickerWs.onclose = null;
      tickerWs.close();
    }
  } catch {
    // Ignore cleanup errors
  }
  
  if (bannerInterval) {
    clearInterval(bannerInterval);
  }
  
  if (noticeInterval) {
    clearInterval(noticeInterval);
  }
  
  if (pollMetals) {
      clearInterval(pollMetals);
  }
  
  if (clickOutsideHandler) {
    document.removeEventListener('click', clickOutsideHandler);
  }
});
</script>

