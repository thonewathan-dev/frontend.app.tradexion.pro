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


const symbols = ref([
  // Crypto
  'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT', 'DOGE/USDT', 
  'SOL/USDT', 'LTC/USDT', 'ETC/USDT', 'BCH/USDT', 'DOT/USDT', 'NEO/USDT', 
  'IOTA/USDT', 'LUNA/USDT', 'LINK/USDT', 'TRX/USDT', 'MATIC/USDT', 'AVAX/USDT', 
  'SHIB/USDT', 'ATOM/USDT', 'UNI/USDT', 'XLM/USDT', 'FIL/USDT',
  
  // Metals
  'XAU/USD', 'XAG/USD', 'XPT/USD', 'XPD/USD',
  
  // Forex
  'AUD/USD', 'BRL/USD', 'CAD/USD', 'CHF/USD', 'CNY/USD', 'CZK/USD', 'DKK/USD',
  'EUR/USD', 'GBP/USD', 'HKD/USD', 'HUF/USD', 'IDR/USD', 'ILS/USD', 'INR/USD', 'ISK/USD',
  'JPY/USD', 'KRW/USD', 'MXN/USD', 'MYR/USD', 'NOK/USD', 'NZD/USD', 'PHP/USD', 'PLN/USD',
  'RON/USD', 'SEK/USD', 'SGD/USD', 'THB/USD', 'TRY/USD', 'USD/USD', 'ZAR/USD'
]);

// Get default symbol from query or use first symbol
const getDefaultSymbol = () => {
  const querySymbol = route.query.symbol;
  if (querySymbol) {
    let s = querySymbol.trim().toUpperCase();
    
    // 1. Exact match in our list
    if (symbols.value.includes(s)) return s;
    
    // 2. Try adding slash for crypto (BTCUSDT -> BTC/USDT)
    if (s.endsWith('USDT')) {
      const withSlash = s.replace(/USDT$/, '/USDT');
      if (symbols.value.includes(withSlash)) return withSlash;
    }
    
    // 3. Try adding slash for forex/metals (GBPUSD -> GBP/USD, XAUUSD -> XAU/USD)
    if (s.length === 6 && !s.includes('/')) {
      const withSlash = `${s.slice(0, 3)}/${s.slice(3)}`;
      if (symbols.value.includes(withSlash)) return withSlash;
    }
    
    // 4. Try adding slash for metals specifically tracked as /USD
    if (s.endsWith('USD') && (s.startsWith('XAU') || s.startsWith('XAG') || s.startsWith('XPT') || s.startsWith('XPD'))) {
       const withSlash = s.replace(/USD$/, '/USD');
       if (symbols.value.includes(withSlash)) return withSlash;
    }
  }
  return symbols.value[0];
};

const selectedSymbol = ref(getDefaultSymbol());

// Determine default interval based on symbol type
// Crypto/Metals -> 1min
// Forex -> Realtime
const getDefaultInterval = (symbol) => {
  if (!symbol) return '1min';
  
  // Crypto check (USDT)
  if (symbol.endsWith('USDT')) return '1min';
  
  // Metal check (XAU, XAG, XPT, XPD)
  if (['XAU/USD', 'XAG/USD', 'XPT/USD', 'XPD/USD'].includes(symbol)) return '1min';
  
  // Default to Realtime for Forex
  return 'Realtime';
};

const selectedInterval = ref(getDefaultInterval(selectedSymbol.value));

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
  // For Forex pairs (typically around 1.0), use 5 decimals for precision
  if (num >= 0.1 && num <= 10) return num.toFixed(5);
  if (num >= 1) return num.toFixed(2);
  if (num >= 0.01) return num.toFixed(4);
  return num.toFixed(8);
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
    
    if (response.data && response.data.length > 0) {
      recentTrades.value = response.data.map(trade => ({
        id: trade.id,
        price: trade.price,
        quantity: trade.qty || trade.quantity || trade.amount || trade.q || 0,
        time: trade.time,
        isBuyerMaker: trade.isBuyerMaker,
      }));
    } else {
      // Fallback: Generate mock trades for Forex/Metals if backend returns empty
      generateMockTrades(symbol);
    }
  } catch (error) {
    if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
      console.error('Error loading trades:', error);
      // Fallback on error too
      generateMockTrades(symbol);
    }
  }
};

const generateMockTrades = (symbol) => {
  if (!ticker.value?.price) return;
  
  const currentPrice = parseFloat(ticker.value.price);
  const mockData = [];
  const now = Date.now();
  
  for (let i = 0; i < 20; i++) {
    const isBuyerMaker = Math.random() > 0.5;
    const priceVariation = (Math.random() - 0.5) * (currentPrice * 0.0005);
    const price = currentPrice + priceVariation;
    
    // Quantity logic differs by asset type
    let quantity;
    if (symbol.includes('USD') && !symbol.includes('T')) { // Forex
       quantity = Math.random() * 1000 + 100; // e.g. 500 USD
    } else {
       quantity = Math.random() * 2; 
    }

    mockData.push({
      id: now - i * 1000,
      price: price.toFixed(symbol.includes('JPY') ? 2 : 5),
      quantity: quantity.toFixed(4),
      time: now - i * 5000,
      isBuyerMaker: isBuyerMaker
    });
  }
  recentTrades.value = mockData;
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
    
    // Fallback: Generate mock klines if still empty (e.g. for Forex pairs not on Binance)
    if (!klines.length && ticker.value?.price) {
        console.log('Generating mock klines for', symbol);
        klines = generateMockKlines(parseFloat(ticker.value.price), binanceInterval);
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

const generateMockKlines = (basePrice, interval) => {
    const now = Date.now();
    const mockData = [];
    const limit = 100;
    
    // Ms per interval
    const intervalMsMap = {
        '1m': 60000,
        '5m': 300000,
        '15m': 900000,
        '30m': 1800000,
        '1h': 3600000,
        '4h': 14400000,
        '1d': 86400000,
        '1w': 604800000,
        '1M': 2592000000,
    };
    const step = intervalMsMap[interval] || 60000;
    
    let currentPrice = basePrice;
    
    for (let i = limit; i > 0; i--) {
        const time = now - (i * step);
        const volatility = basePrice * 0.0005; // 0.05% volatility
        const change = (Math.random() - 0.5) * volatility;
        
        const open = currentPrice;
        const close = currentPrice + change;
        const high = Math.max(open, close) + (Math.random() * volatility * 0.5);
        const low = Math.min(open, close) - (Math.random() * volatility * 0.5);
        const volume = Math.random() * 1000;
        
        mockData.push({
            time,
            open: open.toFixed(5),
            high: high.toFixed(5),
            low: low.toFixed(5),
            close: close.toFixed(5),
            volume: volume.toFixed(2)
        });
        
        currentPrice = close;
    }
    
    return mockData;
};

// Calculate moving average

// Fill gaps in kline data removed - using direct data or mock data only
// to prevent complexity issues.

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
  
  // Use raw data directly to ensure stability
  const rawData = klineData.value;
  
  // 1. Prepare Data
  const categoryData = [];
  const candlestickData = [];
  const volumeData = [];
  
  rawData.forEach((k) => {
    // Format time
    const dateObj = new Date(k.time);
    const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
       
    categoryData.push(timeStr);
    
    const open = parseFloat(k.open);
    const close = parseFloat(k.close);
    const low = parseFloat(k.low);
    const high = parseFloat(k.high);
    const volume = parseFloat(k.volume);
    
    candlestickData.push([open, close, low, high]);
    
    volumeData.push({
      value: volume,
      itemStyle: {
        color: close >= open ? 'rgba(14, 203, 129, 0.3)' : 'rgba(246, 70, 93, 0.3)' // More transparent
      },
    });
  });

  const ma5 = calculateMA(candlestickData, 5);
  const ma10 = calculateMA(candlestickData, 10);
  const ma20 = calculateMA(candlestickData, 20);

  const isLineChart = selectedInterval.value === 'Realtime';
  const lastPrice = candlestickData.length > 0 ? candlestickData[candlestickData.length - 1][1] : 0;

  const series = [];
  
  if (isLineChart) {
    series.push({
      name: 'Price',
      type: 'line',
      data: rawData.map(k => parseFloat(k.close)),
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 2, color: '#2ebd85' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(46, 189, 133, 0.2)' },
          { offset: 1, color: 'rgba(46, 189, 133, 0.0)' }
        ])
      }
    });
  } else {
    series.push({
      name: 'Candlestick',
      type: 'candlestick',
      data: candlestickData,
      barWidth: '60%', 
      itemStyle: {
        color: '#0ecb81',
        color0: '#f6465d',
        borderColor: '#0ecb81',
        borderColor0: '#f6465d',
      },
      markLine: {
        symbol: ['none', 'none'],
        label: {
          show: true,
          position: 'end',
          backgroundColor: '#2ebd85',
          color: '#fff',
          padding: 4,
          borderRadius: 4,
          formatter: '{c}'
        },
        lineStyle: {
          color: '#2ebd85',
          type: 'dashed',
          width: 1,
          opacity: 0.5
        },
        data: [{ yAxis: lastPrice }]
      }
    });
    
    // MAs only for candles
    if (!isLineChart && !isMobile.value) {
       series.push(
        { name: 'MA5', type: 'line', data: ma5, smooth: true, showSymbol: false, lineStyle: { width: 1, color: '#f5dc62', opacity: 0.5 } },
        { name: 'MA10', type: 'line', data: ma10, smooth: true, showSymbol: false, lineStyle: { width: 1, color: '#4ECDC4', opacity: 0.5 } },
        { name: 'MA20', type: 'line', data: ma20, smooth: true, showSymbol: false, lineStyle: { width: 1, color: '#9932CC', opacity: 0.5 } }
       );
    }
  }

  // Volume Overlay (on same grid but scaled separately via separate axis)
  series.push({
    name: 'Volume',
    type: 'bar',
    xAxisIndex: 0, 
    yAxisIndex: 1, // Use secondary axis
    z: -1, // Behind candles
    data: volumeData,
    barWidth: '60%'
  });
  
  // Get current zoom level if available to preserve it
  let start = 70;
  let end = 100;
  
  try {
    const currentOption = chart.getOption();
    if (currentOption && currentOption.dataZoom && currentOption.dataZoom.length > 0) {
      start = currentOption.dataZoom[0].start;
      end = currentOption.dataZoom[0].end;
    }
  } catch (e) {
    // ignore
  }
  
  const option = {
    backgroundColor: 'transparent',
    animation: false,
    legend: { show: false },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross', label: { backgroundColor: '#2d3a4b' } },
      backgroundColor: 'rgba(20, 21, 26, 0.9)',
      borderColor: '#333',
      textStyle: { color: '#ccc', fontSize: 12 },
      formatter: function (params) {
        if (!params || !params.length) return '';
        const date = params[0].axisValue;
        let html = `<div style="font-size: 10px; color: #888; margin-bottom: 4px;">${date}</div>`;
        params.forEach(param => {
          if (param.seriesName === 'Candlestick') {
            const [o, c, l, h] = param.data.slice(1);
            const color = c >= o ? '#0ecb81' : '#f6465d';
            html += `
              <div style="display: flex; gap: 12px; font-size: 12px;">
                <span style="color: #888">O</span> <span style="color: ${color}">${formatPrice(o)}</span>
                <span style="color: #888">H</span> <span style="color: ${color}">${formatPrice(h)}</span>
                <span style="color: #888">L</span> <span style="color: ${color}">${formatPrice(l)}</span>
                <span style="color: #888">C</span> <span style="color: ${color}">${formatPrice(c)}</span>
              </div>
            `;
          } else if (param.seriesName === 'Price') {
             html += `<div style="font-size: 12px;">Price: <span style="color: #2ebd85">${param.value}</span></div>`;
          }
        });
        return html;
      }
    },
    grid: {
      left: 10,
      right: 60, // Space for axis labels
      top: 10,
      bottom: 20,
      containLabel: false
    },
    xAxis: {
      type: 'category',
      data: categoryData,
      boundaryGap: !isLineChart,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#666', fontSize: 10, margin: 10 },
      splitLine: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        scale: true,
        position: 'right',
        splitLine: { show: true, lineStyle: { color: '#2b2f36', type: 'dashed' } }, // Subtle grid
        axisLine: { show: false },
        axisLabel: { 
            color: '#888', 
            fontSize: 10,
            formatter: (v) => formatPrice(v)
        },
        // Add padding to top/bottom
        splitNumber: 5
      },
      {
        type: 'value',
        scale: true,
        max: (value) => value.max * 5, // Push volume down (occupy bottom 1/5)
        splitLine: { show: false },
        axisLabel: { show: false },
        axisLine: { show: false }
      }
    ],
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: 0,
        start: start,
        end: end,
      },
    ],
    series: series,
  };
  
  chart.setOption(option, true);
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

import { io } from 'socket.io-client';

// WebSocket for real-time ticker updates
let marketSocket = null;

const processTickerUpdate = (tickerData) => {
  // Handle both Binance object format and array format
  const data = Array.isArray(tickerData) ? tickerData : [tickerData];
  
  data.forEach(item => {
      if (!item?.s) return;
      
      const symbol = item.s;
      // Normalization: remove slash for comparison
      const currentSymbolClean = selectedSymbol.value.replace('/', '');
      const itemSymbolClean = symbol.replace('/', '');
      
      if (itemSymbolClean !== currentSymbolClean) return;
      
      const price = Number.parseFloat(item.c);
      const changePercent = Number.parseFloat(item.P) || 0;
      const volume = Number.parseFloat(item.v) || 0;
      const highPrice = Number.parseFloat(item.h) || price; // Fallback to price if no high
      const lowPrice = Number.parseFloat(item.l) || price;   // Fallback to price if no low
      
      if (!Number.isFinite(price)) return;
      
      // Update ticker ref
      ticker.value = {
        ...ticker.value,
        price,
        priceChangePercent: changePercent,
        volume,
        highPrice: Math.max(ticker.value?.highPrice || 0, highPrice),
        lowPrice: ticker.value?.lowPrice ? Math.min(ticker.value.lowPrice, lowPrice) : lowPrice,
      };
      
      // Update title document if needed
      document.title = `${formatPrice(price)} | ${selectedSymbol.value}`;
      
      // Simulate real-time trade addition for liveliness
      // Always add a trade on ticker update to ensure movement
      const isBuyerMaker = Math.random() > 0.5;
      const tradePrice = price; // Current ticker price
      
      // Smart quantity generation
      let quantity;
      if (price > 1000) quantity = Math.random() * 0.5; // BTC etc
      else if (price < 2) quantity = Math.random() * 1000 + 100; // Forex
      else quantity = Math.random() * 10;
      
      const newTrade = {
        id: Date.now(),
        price: tradePrice,
        quantity: quantity,
        time: Date.now(),
        isBuyerMaker: isBuyerMaker
      };
      
      // Add to start, keep list size constant
      const currentTrades = recentTrades.value || [];
      currentTrades.unshift(newTrade);
      if (currentTrades.length > 30) {
          currentTrades.pop();
      }
      recentTrades.value = [...currentTrades]; // Trigger reactivity
  });
};

const connectWebSocket = () => {
    // 1. Connect to Binance WS for standard pairs
    if (tickerWs) {
        try { tickerWs.close(); } catch (e) {}
        tickerWs = null;
    }
  
    try {
        tickerWs = new WebSocket(BINANCE_WS_URL);
        tickerWs.onmessage = (event) => {
             try {
                const data = JSON.parse(event.data);
                processTickerUpdate(data);
             } catch (e) {
                 // ignore
             }
        };
    } catch (e) {
        console.error('Binance WS Error:', e);
    }

    // 2. Connect to Backend Market Socket for Metals
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
  // MarketSocket auto-reconnects, so we only manage Binance WS manually if needed
  if (!tickerWs || tickerWs.readyState === WebSocket.CLOSED) {
      setTimeout(connectWebSocket, 5000);
  }
};

// Watch for symbol changes
watch(() => route.query.symbol, (newSymbol) => {
  if (newSymbol) {
    let s = newSymbol.trim().toUpperCase();
    let targetSymbol = null;
    
    // 1. Exact match in our list
    if (symbols.value.includes(s)) targetSymbol = s;
    
    // 2. Try adding slash for crypto (BTCUSDT -> BTC/USDT)
    else if (s.endsWith('USDT')) {
      const withSlash = s.replace(/USDT$/, '/USDT');
      if (symbols.value.includes(withSlash)) targetSymbol = withSlash;
    }
    
    // 3. Try adding slash for forex/metals (GBPUSD -> GBP/USD)
    else if (s.length === 6 && !s.includes('/')) {
      const withSlash = `${s.slice(0, 3)}/${s.slice(3)}`;
      if (symbols.value.includes(withSlash)) targetSymbol = withSlash;
    }
    
    // 4. Metals /USD handling
    else if (s.endsWith('USD') && (s.startsWith('XAU') || s.startsWith('XAG') || s.startsWith('XPT') || s.startsWith('XPD'))) {
       const withSlash = s.replace(/USD$/, '/USD');
       if (symbols.value.includes(withSlash)) targetSymbol = withSlash;
    }

    if (targetSymbol) {
      selectedSymbol.value = targetSymbol;
      // Reset interval based on new symbol type
      selectedInterval.value = getDefaultInterval(targetSymbol);
      
      // Close old WS before loading new data
      if (tickerWs) {
        try { tickerWs.close(); } catch (e) {}
        tickerWs = null;
      }
      loadMarketData();
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
    try { tickerWs.close(); } catch (e) {}
    tickerWs = null;
  }
  
  if (marketSocket) {
      marketSocket.disconnect();
      marketSocket = null;
  }
  
  if (dataInterval) {
    clearInterval(dataInterval);
  }
  
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  
  if (handleResize) {
    window.removeEventListener('resize', handleResize);
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