<template>
  <div class="min-h-screen">
    <MobileNav v-if="isMobile" />
    <div class="md:flex">
      <DesktopNav v-if="!isMobile" />
      <main class="flex-1 pb-16 md:pb-0">
        <!-- Header with Profile and Language Selector -->
        <div class="glass-card-no-hover border-b border-white/10 px-4 py-3 flex items-center justify-between relative z-50">
          <!-- Profile Icon (Left) -->
          <button
            @click="goToAssets"
            class="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                class="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl overflow-hidden z-[9999] min-w-[160px] border border-gray-200"
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
            class="overflow-hidden relative rounded-lg md:rounded-xl cursor-grab active:cursor-grabbing"
            style="aspect-ratio: 96 / 35;"
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
                class="min-w-full h-full flex-shrink-0"
              >
                <img
                  :src="banner"
                  :alt="`Banner ${index + 1}`"
                  class="w-full h-full object-cover pointer-events-none"
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
                    ? 'bg-blue-400 w-6 h-1' 
                    : 'bg-white/30 w-1 h-1 hover:bg-white/50'
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
              <svg class="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4.617-3.793a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clip-rule="evenodd" />
              </svg>
            </div>
            <!-- Scrolling Text -->
            <div class="flex-1 overflow-hidden relative h-5">
              <div class="absolute inset-0 whitespace-nowrap">
                <span 
                  :key="currentNotice"
                  class="text-white text-sm font-medium inline-block animate-marquee"
                  :style="{ animation: 'marquee 12s linear infinite' }"
                >
                  {{ currentNotice }}
                </span>
              </div>
            </div>
            <!-- Menu Icon -->
            <div class="flex-shrink-0">
              <button class="p-1 hover:bg-white/10 rounded transition-colors">
                <svg class="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              :key="ticker?.symbol || index"
              class="glass-card rounded-lg p-3 cursor-pointer hover:border-blue-500/50 transition-colors"
              @click="selectSymbol(ticker.symbol)"
            >
              <div class="flex flex-col items-center text-center">
                <img
                  :src="getCoinLogo(ticker.symbol)"
                  :alt="ticker.symbol"
                  class="w-10 h-10 md:w-12 md:h-12 rounded-full mb-2"
                  @error="handleImageError"
                />
                <div class="text-xs md:text-sm font-semibold text-white mb-1">{{ ticker.symbol }}</div>
                <span
                  :class="[
                    'text-xs px-2 py-0.5 rounded-full font-medium mb-1',
                    ticker.change >= 0 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/50' 
                      : 'bg-red-500/20 text-red-300 border border-red-500/50'
                  ]"
                >
                  {{ ticker.change >= 0 ? '+' : '' }}{{ ticker.change.toFixed(2) }}%
                </span>
                <div class="text-sm md:text-base font-bold text-white mb-0.5">${{ formatPrice(ticker.price) }}</div>
                <div class="text-xs text-white/60">Vol {{ formatVolume(ticker.volume) }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Quick Menu Items -->
        <div class="px-3 md:px-4 mb-3">
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
              <span class="text-xs md:text-sm font-medium text-white">{{ menu.label }}</span>
            </div>
          </div>
        </div>
        
        <!-- Quick Recharge Section -->
        <div class="px-3 md:px-4 mb-3">
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
                <div class="text-white font-semibold text-sm md:text-base mb-1">Quick recharge</div>
                <div class="text-white/60 text-xs md:text-sm">Support Coin BTC/USDT/ETH</div>
              </div>
            </div>
            <svg class="w-5 h-5 md:w-6 md:h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        
        <div class="p-3 md:p-8">
          <!-- Market Tickers - Always visible, only price/volume/% update -->
          <!-- Mobile: Compact horizontal cards -->
          <div class="flex flex-col gap-2 md:hidden mb-6">
            <div
              v-for="ticker in tickers"
              :key="ticker.symbol"
              class="glass-card rounded-lg p-3 cursor-pointer active:scale-[0.98] transition-transform"
              @click="selectSymbol(ticker.symbol)"
            >
              <div class="flex items-center justify-between">
                <!-- Left: Logo and Name -->
                <div class="flex items-center gap-2.5 flex-1 min-w-0">
                  <img
                    :src="getCoinLogo(ticker.symbol)"
                    :alt="ticker.symbol"
                    class="w-9 h-9 md:w-10 md:h-10 rounded-full flex-shrink-0"
                    @error="handleImageError"
                  />
                  <div class="flex flex-col min-w-0">
                    <span class="text-sm font-semibold text-white truncate">{{ ticker.symbol.split('/')[0] }}</span>
                    <span class="text-xs text-white/60">{{ $t('home.volume') }} {{ formatVolume(ticker.volume) }}</span>
                  </div>
                </div>
                
                <!-- Right: Price and Change -->
                <div class="flex items-center gap-3 flex-shrink-0">
                  <div class="text-right">
                    <div class="text-base font-bold text-white leading-tight">${{ formatPrice(ticker.price) }}</div>
                  </div>
                  <span
                    :class="[
                      'text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap flex items-center gap-1',
                      ticker.change >= 0 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-red-500/20 text-red-300'
                    ]"
                  >
                    <svg v-if="ticker.change < 0" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                    <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                    {{ ticker.change >= 0 ? '+' : '' }}{{ ticker.change.toFixed(2) }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Desktop: Grid layout -->
          <div class="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div
              v-for="ticker in tickers"
              :key="ticker.symbol"
              class="glass-card rounded-xl p-4 cursor-pointer"
              @click="selectSymbol(ticker.symbol)"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <img
                    :src="getCoinLogo(ticker.symbol)"
                    :alt="ticker.symbol"
                    class="w-10 h-10 rounded-full ring-2 ring-white/20"
                    @error="handleImageError"
                  />
                  <span class="text-sm font-semibold text-white">{{ ticker.symbol }}</span>
                </div>
                <span
                  :class="[
                    'text-xs px-2 py-1 rounded-full font-medium',
                    ticker.change >= 0 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/50' 
                      : 'bg-red-500/20 text-red-300 border border-red-500/50'
                  ]"
                >
                  {{ ticker.change >= 0 ? '+' : '' }}{{ ticker.change.toFixed(2) }}%
                </span>
              </div>
              <div class="text-2xl font-bold text-white mb-1">${{ formatPrice(ticker.price) }}</div>
              <div class="text-xs text-white/60">{{ $t('home.volume') }}: {{ formatVolume(ticker.volume) }}</div>
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

const router = useRouter();
const { t } = useI18n();
const authStore = useAuthStore();
const { languages, currentLanguage, showLanguageMenu, getCurrentFlag, changeLanguage } = useLanguage();
const isMobile = computed(() => window.innerWidth < 768);
const languageSelectorRef = ref(null);

// Fixed symbol list - single source of truth
const SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT',
  'ADAUSDT', 'DOGEUSDT', 'LTCUSDT', 'ETCUSDT',
  'BCHUSDT', 'DOTUSDT', 'NEOUSDT', 'IOTAUSDT', 'LUNAUSDT'
];

// WebSocket URL
const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws/!ticker@arr';

// Reactive tickerMap - single source of truth, NEVER cleared
const tickerMap = reactive({});

// Initialize ALL symbols as placeholders - cards NEVER disappear
SYMBOLS.forEach((symbol) => {
  tickerMap[symbol] = reactive({
    symbol: symbol.replace('USDT', '/USDT'),
    price: 0,
    change: 0,
    volume: 0,
    isPlaceholder: true
  });
});

// Computed tickers - ALWAYS returns all symbols in fixed order
// This array of references will now be COMPLETELY STABLE.
const tickers = computed(() => {
  return SYMBOLS.map(symbol => tickerMap[symbol]);
});

// Top 3 tickers for featured section
const top3Tickers = computed(() => {
  const targetSymbols = ['BTC/USDT', 'ETH/USDT', 'XRP/USDT'];
  return targetSymbols.map(symbol => {
    const symbolKey = symbol.replace('/', '');
    return tickerMap[symbolKey] || null;
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
  if (price >= 1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(4);
  return price.toFixed(8);
};

const formatVolume = (volume) => {
  if (volume >= 1e9) return (volume / 1e9).toFixed(2) + 'B';
  if (volume >= 1e6) return (volume / 1e6).toFixed(2) + 'M';
  if (volume >= 1e3) return (volume / 1e3).toFixed(2) + 'K';
  return volume.toFixed(2);
};

const getCoinLogo = (symbol) => {
  const baseCurrency = symbol.split('/')[0];
  return getCoinLogoUrl(baseCurrency) || `https://via.placeholder.com/32?text=${baseCurrency}`;
};

const handleImageError = (event) => {
  const symbol = event.target.alt.split('/')[0];
  event.target.src = `https://via.placeholder.com/32?text=${symbol}`;
};

// WebSocket state management
let tickerWs = null;
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

onMounted(() => {
  console.log('[Home] Mounted. Initializing tickers...');
  // Double check initialization
  SYMBOLS.forEach((symbol) => {
    if (!tickerMap[symbol]) {
      tickerMap[symbol] = reactive({
        symbol: symbol.replace('USDT', '/USDT'),
        price: 0,
        change: 0,
        volume: 0,
        isPlaceholder: true
      });
    }
  });
  console.log('[Home] tickerMap size:', Object.keys(tickerMap).length);
  
  connectWebSocket();
  startAutoSlide();
  
  currentNotice.value = getRandomNotice();
  noticeInterval = setInterval(() => {
    currentNotice.value = getRandomNotice();
  }, 12000);
  
  clickOutsideHandler = (event) => {
    if (languageSelectorRef.value && !languageSelectorRef.value.contains(event.target)) {
      showLanguageMenu.value = false;
    }
  };
  
  setTimeout(() => {
    document.addEventListener('click', clickOutsideHandler);
  }, 100);
});

onUnmounted(() => {
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
  
  if (clickOutsideHandler) {
    document.removeEventListener('click', clickOutsideHandler);
  }
});
</script>
