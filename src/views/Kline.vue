<template>
  <div class="min-h-screen">
    <!-- Top Header Section -->
    <div class="bg-gray-800/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
      <div class="px-3 py-2">
        <div class="flex items-center gap-2 mb-2">
          <button
            @click="$router.back()"
            class="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 class="text-base font-bold text-white flex-1 text-center">{{ selectedSymbol }}</h1>
          <div class="w-8"></div> <!-- Spacer for centering -->
        </div>
        
        <!-- Price Display -->
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div 
              :class="[
                'text-xl font-bold mb-1',
                (Number(ticker?.priceChangePercent) || 0) >= 0 ? 'text-green-400' : 'text-red-400'
              ]"
            >
              {{ formatPrice(ticker?.price || 0) }}
            </div>
            <div 
              :class="[
                'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium',
                (Number(ticker?.priceChangePercent) || 0) >= 0 
                  ? 'bg-green-500/20 text-green-300' 
                  : 'bg-red-500/20 text-red-300'
              ]"
            >
              <svg v-if="(Number(ticker?.priceChangePercent) || 0) < 0" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
              <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
              {{ (Number(ticker?.priceChangePercent) || 0) >= 0 ? '+' : '' }}{{ (Number(ticker?.priceChangePercent) || 0).toFixed(2) }}%
            </div>
          </div>
          
          <!-- 24H Stats -->
          <div class="text-right text-xs space-y-1">
            <div class="flex items-center justify-end gap-2">
              <span class="text-gray-400">{{ t('kline.high') }}</span>
              <span class="text-white font-medium">{{ formatPrice(ticker?.highPrice || 0) }}</span>
            </div>
            <div class="flex items-center justify-end gap-2">
              <span class="text-gray-400">{{ t('kline.low') }}</span>
              <span class="text-white font-medium">{{ formatPrice(ticker?.lowPrice || 0) }}</span>
            </div>
            <div class="flex items-center justify-end gap-2">
              <span class="text-gray-400">{{ t('kline.volume24h') }}</span>
              <span class="text-white font-medium">{{ formatVolume(ticker?.volume || 0) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <main class="pb-20">
        <div class="px-4">
          <!-- Timeframe Selection -->
          <div class="flex gap-4 overflow-x-auto scrollbar-hide border-b border-white/10">
            <button
              v-for="interval in intervals"
              :key="interval"
              @click="selectedInterval = interval; loadKlines()"
              :class="[
                'px-2 py-2 text-xs font-medium whitespace-nowrap transition-all relative',
                selectedInterval === interval
                  ? 'text-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              ]"
            >
              {{ interval }}
              <span
                v-if="selectedInterval === interval"
                class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"
              ></span>
            </button>
          </div>
        </div>

        <!-- Chart Container -->
        <div class="glass-card-no-hover rounded-none md:rounded-xl p-2 md:p-4 mb-3 md:mb-4 mx-0 md:mx-4">
          <div
            ref="chartContainer"
            class="w-full"
            :style="{ height: `${totalChartHeight}px` }"
          ></div>
        </div>

        <!-- Market Trades -->
        <div v-if="isLoading" class="glass-card-no-hover rounded-none md:rounded-xl p-4 mb-4 mx-0 md:mx-4">
          <div class="h-6 bg-white/10 rounded w-32 mb-3 animate-pulse"></div>
          <div class="space-y-2">
            <SkeletonLoader v-for="i in 10" :key="i" type="table-row" />
          </div>
        </div>
        <div v-else class="glass-card-no-hover rounded-none md:rounded-xl p-4 mb-4 mx-0 md:mx-4">
            <h3 class="font-bold text-white mb-3">{{ t('kline.marketTrades') }}</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-gray-400 border-b border-white/10">
                    <th class="text-left py-2 px-2">{{ t('kline.time') }}</th>
                    <th class="text-left py-2 px-2">Direction</th>
                    <th class="text-left py-2 px-2">{{ t('kline.price') }}</th>
                    <th class="text-left py-2 px-2">{{ t('kline.quantity') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="trade in recentTrades.slice(0, 20)"
                    :key="trade.id"
                    class="border-b border-white/5"
                  >
                    <td class="py-2 px-2 text-gray-300">{{ formatTime(trade.time) }}</td>
                    <td 
                      :class="[
                        'py-2 px-2 font-medium',
                        trade.isBuyerMaker ? 'text-red-400' : 'text-green-400'
                      ]"
                    >
                      {{ trade.isBuyerMaker ? 'Inbuy' : 'Outsell' }}
                    </td>
                    <td 
                      :class="[
                        'py-2 px-2',
                        trade.isBuyerMaker ? 'text-red-400' : 'text-green-400'
                      ]"
                    >
                      {{ formatPrice(trade.price) }}
                    </td>
                    <td 
                      :class="[
                        'py-2 px-2',
                        trade.isBuyerMaker ? 'text-red-400' : 'text-green-400'
                      ]"
                    >
                      {{ formatQuantity(trade.quantity) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
      </main>

      <!-- Fixed Bottom Navigation Buttons -->
      <div class="fixed bottom-0 left-0 right-0 bg-gray-800/80 backdrop-blur-md border-t border-white/10 px-3 py-2 z-20">
        <div class="grid grid-cols-2 gap-3 max-w-md mx-auto">
          <button
            @click="handleQuickAction('buy')"
            class="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-2.5 rounded-lg text-base transition-colors shadow-lg"
          >
            Up
          </button>
          <button
            @click="handleQuickAction('sell')"
            class="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold py-2.5 rounded-lg text-base transition-colors shadow-lg"
          >
            Fall
          </button>
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, computed, shallowRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import api from '../utils/api';
import * as echarts from 'echarts';
import axios from 'axios';

const { t } = useI18n();

const BINANCE_HTTP_API = 'https://api.binance.com/api/v3';
const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws/!ticker@arr';

const route = useRoute();
const router = useRouter();

// Detect mobile for responsive chart sizing
const isMobile = computed(() => window.innerWidth < 768);
const chartHeight = computed(() => isMobile.value ? 280 : 400);
const volumeHeight = computed(() => isMobile.value ? 60 : 80);
const totalChartHeight = computed(() => chartHeight.value + volumeHeight.value + 20);

const chartContainer = ref(null);
let chart = null;
let resizeObserver = null;

const intervals = ['Realtime', '1min', '5min', '15min', '30min', '1hour', '4hour', '1day', '1week', '1month'];
const selectedInterval = ref('1min');

const symbols = ref([
  'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'XRP/USDT',
  'DOGE/USDT', 'ADA/USDT', 'AVAX/USDT', 'SHIB/USDT', 'DOT/USDT',
  'LINK/USDT', 'TRX/USDT', 'MATIC/USDT', 'LTC/USDT', 'BCH/USDT',
  'ATOM/USDT', 'UNI/USDT', 'XLM/USDT', 'ETC/USDT', 'FIL/USDT'
]);

// Get default symbol from query or use first symbol
const getDefaultSymbol = () => {
  const querySymbol = route.query.symbol;
  if (querySymbol) {
    let symbol = querySymbol.trim();
    if (!symbol.includes('/')) {
      symbol = symbol.replace(/USDT$/, '/USDT');
    }
    if (symbols.value.includes(symbol)) {
      return symbol;
    }
  }
  return symbols.value[0];
};

const selectedSymbol = ref(getDefaultSymbol());

const ticker = ref(null);
const recentTrades = ref([]);
const isLoading = ref(true);

// Store raw kline data for chart updates
const klineData = shallowRef([]);

// WebSocket and abort controllers
let tickerWs = null;
let wsReconnectTimer = null;
let wsBackoffMs = 1000;
const MAX_BACKOFF_MS = 30000;

let tickerAbortController = null;
let tradesAbortController = null;
let klinesAbortController = null;
let handleResize = null;

// Format functions
const formatPrice = (price) => {
  const num = Number(price);
  if (isNaN(num)) return '0.00';
  if (num >= 1000) return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (num >= 1) return num.toFixed(2);
  if (num >= 0.01) return num.toFixed(4);
  return num.toFixed(6);
};

const formatVolume = (volume) => {
  const num = Number(volume);
  if (isNaN(num)) return '0';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
};

const formatTime = (time) => {
  const date = new Date(time);
  return date.toLocaleTimeString('en-US', { hour12: false });
};

const formatQuantity = (quantity) => {
  const num = Number(quantity);
  if (isNaN(num)) return '0';
  return num.toFixed(6);
};

// Load market data
const loadMarketData = async () => {
  const symbol = selectedSymbol.value.replace('/', '');
  await Promise.all([
    loadTicker(symbol),
    loadRecentTrades(symbol),
    loadKlines(),
  ]);
};

const loadTicker = async (symbol) => {
  if (tickerAbortController) {
    tickerAbortController.abort();
  }
  tickerAbortController = new AbortController();
  
  try {
    const response = await api.get(`/market/ticker/${symbol}`, {
      signal: tickerAbortController.signal,
    });
    if (response.data) {
      ticker.value = {
        price: response.data.lastPrice || response.data.price,
        priceChange: response.data.priceChange,
        priceChangePercent: response.data.priceChangePercent,
        highPrice: response.data.highPrice,
        lowPrice: response.data.lowPrice,
        volume: response.data.volume,
      };
    }
  } catch (error) {
    if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
      console.error('Error loading ticker:', error);
    }
  }
};

const loadRecentTrades = async (symbol) => {
  if (tradesAbortController) {
    tradesAbortController.abort();
  }
  tradesAbortController = new AbortController();
  
  try {
    const response = await api.get(`/market/trades/${symbol}`, {
      params: { limit: 50 },
      signal: tradesAbortController.signal,
    });
    if (response.data) {
      // Log the first trade to help debug field names if needed
      if (response.data.length > 0 && Math.random() < 0.05) {
        console.log('Sample trade data:', response.data[0]);
      }
      
      recentTrades.value = response.data.map(trade => ({
        id: trade.id,
        price: trade.price,
        // Check multiple possible field names for quantity
        quantity: trade.qty || trade.quantity || trade.amount || trade.q || 0,
        time: trade.time,
        isBuyerMaker: trade.isBuyerMaker,
      }));
    }
  } catch (error) {
    if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
      console.error('Error loading trades:', error);
    }
  }
};

const loadKlines = async () => {
  if (klinesAbortController) {
    klinesAbortController.abort();
  }
  klinesAbortController = new AbortController();
  
  try {
    const symbol = selectedSymbol.value.replace('/', '');
    let interval = selectedInterval.value.toLowerCase();
    
    const intervalMap = {
      'realtime': '1m',
      '1min': '1m',
      '5min': '5m',
      '15min': '15m',
      '30min': '30m',
      '1hour': '1h',
      '4hour': '4h',
      '1day': '1d',
      '1week': '1w',
      '1month': '1M',
    };
    
    const binanceInterval = intervalMap[interval] || '1m';
    
    const response = await api.get(`/market/klines/${symbol}`, {
      params: {
        interval: binanceInterval,
        limit: 200,
      },
      signal: klinesAbortController.signal,
    });
    
    let klines = Array.isArray(response.data) ? response.data : [];

    // Fallback to direct Binance API if backend returns empty
    if (!klines.length) {
      try {
        const binanceRes = await axios.get(`${BINANCE_HTTP_API}/klines`, {
          params: {
            symbol,
            interval: binanceInterval,
            limit: 200,
          },
        });
        klines = (binanceRes.data || []).map((k) => ({
          time: k[0],
          open: k[1],
          high: k[2],
          low: k[3],
          close: k[4],
          volume: k[5],
        }));
      } catch (fallbackErr) {
        console.warn('Binance klines fallback failed:', fallbackErr?.message);
      }
    }
    
    if (klines && klines.length > 0) {
      klineData.value = klines;
      updateChart();
    }
  } catch (error) {
    if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
      console.error('Error loading klines:', error);
    }
  }
};

// Calculate moving average
const calculateMA = (data, period) => {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push('-');
      continue;
    }
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += parseFloat(data[i - j][1]); // Close price
    }
    result.push((sum / period).toFixed(2));
  }
  return result;
};

const initChart = () => {
  if (!chartContainer.value) return;
  
  chart = echarts.init(chartContainer.value, 'dark');
  
  // Set up resize observer
  resizeObserver = new ResizeObserver(() => {
    chart?.resize();
  });
  resizeObserver.observe(chartContainer.value);
};

const updateChart = () => {
  if (!chart || !klineData.value.length) return;
  
  const data = klineData.value;
  
  // Prepare category data (time) and values
  const categoryData = [];
  const candlestickData = [];
  const volumeData = [];
  
  data.forEach((k) => {
    const time = new Date(k.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    categoryData.push(time);
    
    const open = parseFloat(k.open);
    const close = parseFloat(k.close);
    const low = parseFloat(k.low);
    const high = parseFloat(k.high);
    const volume = parseFloat(k.volume);
    
    // ECharts candlestick format: [open, close, low, high]
    candlestickData.push([open, close, low, high]);
    
    // Volume with color
    volumeData.push({
      value: volume,
      itemStyle: {
        color: close >= open ? '#43A047' : '#E53935',
      },
    });
  });
  
  // Calculate moving averages
  const ma5 = calculateMA(candlestickData, 5);
  const ma10 = calculateMA(candlestickData, 10);
  const ma20 = calculateMA(candlestickData, 20);
  
  const option = {
    backgroundColor: 'transparent',
    animation: false,
    legend: {
      show: false,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
      backgroundColor: 'rgba(30, 30, 30, 0.9)',
      borderColor: '#444',
      textStyle: {
        color: '#fff',
      },
    },
    axisPointer: {
      link: [{ xAxisIndex: 'all' }],
      label: {
        backgroundColor: '#555',
      },
    },
    grid: [
      {
        left: '0%',
        right: '12%',
        top: '2%',
        height: '68%',
      },
      {
        left: '0%',
        right: '12%',
        top: '75%',
        height: '20%',
      },
    ],
    xAxis: [
      {
        type: 'category',
        data: categoryData,
        boundaryGap: true,
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
        axisLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
        splitLine: { show: false },
        min: 'dataMin',
        max: 'dataMax',
        axisPointer: { show: true },
      },
      {
        type: 'category',
        gridIndex: 1,
        data: categoryData,
        boundaryGap: true,
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
        axisLabel: { show: false },
        splitLine: { show: false },
        min: 'dataMin',
        max: 'dataMax',
      },
    ],
    yAxis: [
      {
        scale: true,
        splitArea: { show: false },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
        axisLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        position: 'right',
      },
      {
        scale: true,
        gridIndex: 1,
        splitNumber: 2,
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
      },
    ],
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0, 1],
        start: 70,
        end: 100,
      },
    ],
    series: [
      {
        name: 'Candlestick',
        type: 'candlestick',
        data: candlestickData,
        itemStyle: {
          color: '#43A047',
          color0: '#E53935',
          borderColor: '#43A047',
          borderColor0: '#E53935',
        },
      },
      {
        name: 'MA5',
        type: 'line',
        data: ma5,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 1,
          color: '#FF6B9D',
        },
      },
      {
        name: 'MA10',
        type: 'line',
        data: ma10,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 1,
          color: '#4ECDC4',
        },
      },
      {
        name: 'MA20',
        type: 'line',
        data: ma20,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 1,
          color: '#95E1D3',
        },
      },
      {
        name: 'Volume',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: volumeData,
      },
    ],
  };
  
  chart.setOption(option);
};

const handleQuickAction = (side) => {
  const symbol = selectedSymbol.value.replace('/', '');
  router.push({ 
    path: '/contracts', 
    query: { 
      symbol: symbol,
      side: side 
    } 
  });
};

// WebSocket for real-time ticker updates
const processTickerUpdate = (tickerData) => {
  if (!tickerData?.s) return;
  
  const symbol = tickerData.s;
  const currentSymbol = selectedSymbol.value.replace('/', '');
  
  if (symbol !== currentSymbol) return;
  
  const price = Number.parseFloat(tickerData.c);
  const changePercent = Number.parseFloat(tickerData.P) || 0;
  const volume = Number.parseFloat(tickerData.v) || 0;
  const highPrice = Number.parseFloat(tickerData.h) || 0;
  const lowPrice = Number.parseFloat(tickerData.l) || 0;
  
  if (!Number.isFinite(price)) return;
  
  ticker.value = {
    ...ticker.value,
    price,
    priceChangePercent: changePercent,
    volume,
    highPrice,
    lowPrice,
  };
};

const connectWebSocket = () => {
  if (tickerWs) {
    try { tickerWs.close(); } catch (e) {}
    tickerWs = null;
  }
  
  try {
    tickerWs = new WebSocket(BINANCE_WS_URL);
    
    tickerWs.onopen = () => {
      wsBackoffMs = 1000;
    };
    
    tickerWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) {
          data.forEach(processTickerUpdate);
        } else if (data.s) {
          processTickerUpdate(data);
        }
      } catch (e) {
        console.error('[Kline WS] Parse error:', e);
      }
    };
    
    tickerWs.onerror = (e) => {
      console.error('[Kline WS] Error:', e);
    };
    
    tickerWs.onclose = () => {
      tickerWs = null;
      scheduleReconnect();
    };
  } catch (e) {
    console.error('[Kline WS] Setup error:', e);
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

// Watch for symbol changes
watch(() => route.query.symbol, (newSymbol) => {
  if (newSymbol) {
    let symbol = newSymbol.trim();
    if (!symbol.includes('/')) {
      symbol = symbol.replace(/USDT$/, '/USDT');
    }
    if (symbols.value.includes(symbol)) {
      selectedSymbol.value = symbol;
      loadMarketData();
      if (tickerWs) {
        try { tickerWs.close(); } catch (e) {}
        tickerWs = null;
      }
      connectWebSocket();
    }
  }
}, { immediate: true });

let dataInterval = null;

onMounted(async () => {
  await nextTick();
  initChart();
  
  isLoading.value = true;
  try {
    await loadMarketData();
  } finally {
    isLoading.value = false;
  }
  
  handleResize = () => {
    chart?.resize();
  };
  window.addEventListener('resize', handleResize, { passive: true });
  
  connectWebSocket();
  
  // Refresh data every 3 seconds
  dataInterval = setInterval(async () => {
    const symbol = selectedSymbol.value.replace('/', '');
    await Promise.all([
      loadRecentTrades(symbol),
      loadKlines(),
    ]);
  }, 3000);
});

onUnmounted(() => {
  if (tickerAbortController) tickerAbortController.abort();
  if (tradesAbortController) tradesAbortController.abort();
  if (klinesAbortController) klinesAbortController.abort();
  
  if (wsReconnectTimer) {
    clearTimeout(wsReconnectTimer);
    wsReconnectTimer = null;
  }
  
  if (tickerWs) {
    tickerWs.onopen = null;
    tickerWs.onmessage = null;
    tickerWs.onerror = null;
    tickerWs.onclose = null;
    tickerWs.close();
    tickerWs = null;
  }
  
  if (dataInterval) {
    clearInterval(dataInterval);
  }
  
  if (handleResize) {
    window.removeEventListener('resize', handleResize);
  }
  
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  
  if (chart) {
    chart.dispose();
    chart = null;
  }
});
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>