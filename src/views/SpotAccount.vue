<template>
  <div class="min-h-screen">
    <MobileNav v-if="isMobile" />
    <div class="md:flex">
      <DesktopNav v-if="!isMobile" />

      <main class="flex-1 pb-16 md:pb-0">
        <!-- Header (same style as flash exchange) -->
        <div class="bg-[#181A20] border-b border-gray-800 px-4 py-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="goBack" class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <svg class="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 class="text-lg font-bold text-gray-900">Spot account</h1>
            </div>
          </div>
        </div>

        <div class="px-4 pt-4">
      <!-- Estimated Total Value -->
      <section class="mb-6">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs text-gray-600">Est. Total Value</span>
          <button class="text-gray-600 hover:text-gray-900 transition-colors" @click="toggleValues">
            <svg v-if="showValues" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 3l18 18M10.477 10.485A3 3 0 0113.5 13.5M9.88 9.88L5.12 5.12M9.88 9.88L9.88 9.88M9.88 9.88C8.78 10.24 8 11.24 8 12.4M21 12c-1.274-4.057-5.065-7-9.542-7-1.06 0-2.087.16-3.058.458"
              />
            </svg>
          </button>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-semibold text-gray-900">
            <span v-if="isLoading" class="inline-block h-7 w-24 rounded bg-gray-100 animate-pulse"></span>
            <span v-else>
              {{ showValues ? formatFiat(totalValueUSDT) : '******' }}
            </span>
          </span>
          <span class="text-sm text-gray-600">USDT</span>
        </div>
      </section>

      <!-- Actions -->
      <section class="mb-8">
        <div class="grid grid-cols-3 gap-3">
          <button
            class="w-full rounded-lg py-2.5 text-sm font-bold bg-binance-yellow text-binance-black hover:opacity-90 shadow-lg shadow-binance-yellow/10"
            @click="goDeposit"
          >
            Deposit
          </button>
          <button
            class="w-full rounded-lg py-2.5 text-sm font-medium bg-gray-200 text-gray-900 hover:bg-gray-300"
            @click="goTrade"
          >
            Trade
          </button>
          <button
            class="w-full rounded-lg py-2.5 text-sm font-medium bg-gray-200 text-gray-900 hover:bg-gray-300"
            @click="$router.push('/transfer')"
          >
            Transfer
          </button>
        </div>
      </section>

      <!-- Balances (no outer card) -->
      <section class="space-y-2">
        <h2 class="text-base font-semibold text-gray-900 mb-1">Balances</h2>
        <!-- Loader skeleton while balances are loading -->
        <div v-if="isLoading" class="space-y-2">
          <div
            v-for="i in 3"
            :key="i"
            class="px-3 py-3 rounded-lg flex items-center justify-between bg-gray-50"
          >
            <div class="flex items-center gap-3">
              <div class="w-7 h-7 rounded-full bg-gray-100 animate-pulse"></div>
              <div class="space-y-1">
                <div class="h-3 w-14 bg-gray-100 rounded animate-pulse"></div>
                <div class="h-2 w-20 bg-gray-50 rounded animate-pulse"></div>
              </div>
            </div>
            <div class="text-right space-y-1">
              <div class="h-3 w-16 bg-gray-100 rounded animate-pulse"></div>
              <div class="h-2 w-20 bg-gray-50 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        <!-- Real balances -->
        <div
          v-else
          v-for="asset in assets"
          :key="asset.symbol"
          class="px-3 py-3 rounded-lg flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div class="flex items-center gap-3">
            <img :src="coinLogo(asset.symbol)" :alt="asset.symbol" class="w-7 h-7 object-contain" />
            <div class="flex flex-col">
              <span class="text-sm font-medium text-gray-900">{{ asset.symbol }}</span>
              <span class="text-xs text-gray-600">{{ asset.name }}</span>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm font-medium text-gray-900">
              {{ showValues ? formatWalletBalance(getAvailable(asset.symbol)) : '******' }}
            </div>
            <div class="text-[11px] text-gray-500">
              &approx; {{ showValues ? formatFiat(getAvailable(asset.symbol) * priceInUSDT(asset.symbol)) : '****' }} USDT
            </div>
          </div>
        </div>
      </section>

      </div>
    </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import DesktopNav from '../components/DesktopNav.vue';
import MobileNav from '../components/MobileNav.vue';
import api from '../utils/api';
import { getCoinLogoUrl } from '../utils/coinLogos';

const router = useRouter();
const isMobile = computed(() => window.innerWidth < 768);

const assets = [
  { symbol: 'USDT', name: 'TetherUS' },
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
];

const balances = ref([]);
const isLoading = ref(false);

// Prices vs USDT
const prices = ref({
  USDT: 1,
  BTCUSDT: null,
  ETHUSDT: null,
});
let priceInterval = null;
const showValues = ref(true);

const loadWalletBalances = async () => {
  try {
    if (!balances.value.length) {
      isLoading.value = true;
    }
    const res = await api.get('/wallet/balance', { params: { account_type: 'spot' } });
    balances.value = res.data.balances || [];
  } catch (e) {
    console.error('Error loading spot balances:', e);
  } finally {
    isLoading.value = false;
  }
};

const loadPrices = async () => {
  try {
    const [btcRes, ethRes] = await Promise.all([
      api.get('/market/ticker/BTCUSDT'),
      api.get('/market/ticker/ETHUSDT'),
    ]);
    const parsePrice = (data) => parseFloat(data.price || data.lastPrice || data.close || 0);
    prices.value.BTCUSDT = parsePrice(btcRes.data);
    prices.value.ETHUSDT = parsePrice(ethRes.data);
  } catch (e) {
    console.error('Error loading prices for spot account:', e);
  }
};

const priceInUSDT = (symbol) => {
  if (symbol === 'USDT') return 1;
  if (symbol === 'BTC') return prices.value.BTCUSDT || 0;
  if (symbol === 'ETH') return prices.value.ETHUSDT || 0;
  return 0;
};

const getAvailable = (symbol) => {
  const row = balances.value.find((b) => b.currency === symbol);
  return row ? Number(row.available ?? row.balance ?? 0) : 0;
};

const totalValueUSDT = computed(() =>
  assets.reduce((sum, asset) => {
    const amt = getAvailable(asset.symbol);
    const p = priceInUSDT(asset.symbol);
    if (!p || !amt) return sum;
    return sum + amt * p;
  }, 0),
);

const formatFiat = (value) => {
  const num = Number(value) || 0;
  return num.toFixed(2);
};

const formatWalletBalance = (balance) => {
  const num = Number(balance) || 0;
  const floored = Math.floor(num * 1e8) / 1e8;
  return floored.toFixed(8).replace(/0+$/, '').replace(/\.$/, '') || '0';
};

const coinLogo = (currency) => {
  return getCoinLogoUrl(currency) || '';
};

const toggleValues = () => {
  showValues.value = !showValues.value;
};

const goBack = () => {
  router.back();
};

const goDeposit = () => {
  router.push('/deposit');
};

const goTrade = () => {
  router.push('/spot');
};

onMounted(() => {
  loadWalletBalances();
  loadPrices();
  priceInterval = setInterval(() => {
    loadPrices();
    loadWalletBalances();
  }, 10000);
});

onUnmounted(() => {
  if (priceInterval) {
    clearInterval(priceInterval);
    priceInterval = null;
  }
});
</script>

