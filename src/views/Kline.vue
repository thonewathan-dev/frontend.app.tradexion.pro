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
              @click="selectedInterval = interval; userHasZoomed = false; loadKlines()"
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
            class="w-full chart-no-watermark"
            :style="{ height: `${chartHeight}px` }"
          ></div>
          <div
            ref="volumeContainer"
            class="w-full mt-2 chart-no-watermark"
            :style="{ height: `${volumeHeight}px` }"
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
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import api from '../utils/api';
import { createChart } from 'lightweight-charts';
import { getCoinLogoUrl } from '../utils/coinLogos';
import axios from 'axios';

const { t } = useI18n();

const BINANCE_HTTP_API = 'https://api.binance.com/api/v3';

const route = useRoute();
const router = useRouter();

// Detect mobile for responsive chart sizing
const isMobile = computed(() => window.innerWidth < 768);
const chartHeight = computed(() => (isMobile.value ? 320 : 400));
const volumeHeight = computed(() => (isMobile.value ? 72 : 120));

// Use only coins available on Binance
const binanceCoins = ['BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'DOGE', 'DOT', 'LTC', 'BCH', 'ETC', 'NEO', 'IOTA', 'LUNA'];
const symbols = ref(binanceCoins.map(coin => `${coin}/USDT`));

// Get symbol from query or default
const getInitialSymbol = () => {
  if (route.query.symbol) {
    let symbol = route.query.symbol.trim();
    // If symbol already has a slash, use it as is
    if (symbol.includes('/')) {
      // Already in format like "BCH/USDT"
      if (symbols.value.includes(symbol)) {
        return symbol;
      }
    } else {
      // Format like "BCHUSDT" - add slash before USDT
      symbol = symbol.replace(/USDT$/, '/USDT');
      if (symbols.value.includes(symbol)) {
        return symbol;
      }
    }
  }
  return symbols.value[0] || 'BTC/USDT';
};

const selectedSymbol = ref(getInitialSymbol());
const selectedInterval = ref('1min');
const intervals = ['Realtime', '1min', '5min', '15min', '30min', '1hour', '1day', '1week', '1m'];
const ticker = ref(null);
const recentTrades = ref([]);
const isLoading = ref(true);
const chartContainer = ref(null);
const volumeContainer = ref(null);
let chart = null;
let volumeChart = null;
let candlestickSeries = null;
let volumeSeries = null;
let ma1Series = null;
let ma2Series = null;
let ma3Series = null;

// Default zoom: show only the most recent candles on first load (looks like "zoomed in")
const applyDefaultViewport = (candlestickData) => {
  try {
    if (!chart || !candlestickData?.length) return;
    const len = candlestickData.length;
    const visibleBars = isMobile.value ? 55 : 80; // mobile a bit tighter
    const fromIndex = Math.max(0, len - visibleBars);
    const from = candlestickData[fromIndex].time;
    const to = candlestickData[len - 1].time;

    // Improve default readability
    chart.applyOptions({
      timeScale: {
        rightOffset: 6,
        barSpacing: isMobile.value ? 7 : 6,
      },
      rightPriceScale: {
        autoScale: true,
        scaleMargins: { top: 0.12, bottom: 0.18 },
      },
    });

    chart.timeScale().setVisibleRange({ from, to });
    if (volumeChart) {
      volumeChart.timeScale().setVisibleRange({ from, to });
    }
  } catch (e) {
    console.warn('applyDefaultViewport error:', e);
  }
};
let watermarkObserver = null;
let isInitialLoad = true; // Track if this is the first data load
let userHasZoomed = false; // Track if user has manually zoomed
let handleResize = null;

const formatPrice = (price) => {
  const num = Number(price);
  if (!Number.isFinite(num) || num === 0) return '0.00';
  if (num >= 1) return num.toFixed(2);
  if (num >= 0.01) return num.toFixed(4);
  return num.toFixed(8);
};

const formatQuantity = (qty) => {
  if (!qty) return '0.0000';
  return parseFloat(qty).toFixed(6);
};

const formatVolume = (volume) => {
  if (!volume) return '0.00';
  if (volume >= 1e9) return (volume / 1e9).toFixed(2) + 'B';
  if (volume >= 1e6) return (volume / 1e6).toFixed(2) + 'M';
  if (volume >= 1e3) return (volume / 1e3).toFixed(2) + 'K';
  return volume.toFixed(2);
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const getCoinLogo = (symbol) => {
  const baseCurrency = symbol.split('/')[0];
  return getCoinLogoUrl(baseCurrency) || `https://via.placeholder.com/32?text=${baseCurrency}`;
};

const handleImageError = (event) => {
  const symbol = event.target.alt.split('/')[0];
  event.target.src = `https://via.placeholder.com/32?text=${symbol}`;
};

const loadMarketData = async () => {
  isLoading.value = true;
  const symbol = selectedSymbol.value.replace('/', '');
  try {
    await Promise.all([
      loadTicker(symbol),
      loadRecentTrades(symbol),
      // Only load klines if chart is already initialized (to avoid duplicate calls)
      chart && candlestickSeries ? loadKlines() : Promise.resolve(),
    ]);
  } finally {
    isLoading.value = false;
  }
};

let tickerAbortController = null;
let tradesAbortController = null;
let klinesAbortController = null;

// WebSocket state management (same as Home page)
let tickerWs = null;
let wsReconnectTimer = null;
let wsBackoffMs = 1000;
const MAX_BACKOFF_MS = 30000;

const loadTicker = async (symbol) => {
  // Cancel previous request if still pending
  if (tickerAbortController) {
    tickerAbortController.abort();
  }
  tickerAbortController = new AbortController();
  
  try {
    const response = await api.get(`/market/ticker/${symbol}/24h`, {
      signal: tickerAbortController.signal,
    });
    // Ensure numeric fields are properly parsed
    if (response.data) {
      ticker.value = {
        ...response.data,
        price: Number(response.data.price) || 0,
        priceChangePercent: Number(response.data.priceChangePercent) || 0,
        priceChange: Number(response.data.priceChange) || 0,
        volume: Number(response.data.volume) || 0,
        highPrice: Number(response.data.highPrice) || 0,
        lowPrice: Number(response.data.lowPrice) || 0,
      };
    } else {
      ticker.value = null;
    }
  } catch (error) {
    // Ignore abort errors
    if (error.name === 'AbortError' || error.name === 'CanceledError') {
      return;
    }
    console.error('Error loading ticker:', error);
  }
};

const loadRecentTrades = async (symbol) => {
  // Cancel previous request if still pending
  if (tradesAbortController) {
    tradesAbortController.abort();
  }
  tradesAbortController = new AbortController();
  
  try {
    let trades = [];

    // Try backend first
    const response = await api.get(`/market/trades/${symbol}`, { 
      params: { limit: 50 },
      signal: tradesAbortController.signal,
    });
    trades = Array.isArray(response.data) ? response.data : [];

    // If backend returns no data (e.g. Binance 451), fall back to direct Binance HTTP
    if (!trades.length) {
      try {
        const binanceRes = await axios.get(`${BINANCE_HTTP_API}/trades`, {
          params: { symbol, limit: 50 },
        });
        trades = (binanceRes.data || []).map((trade) => ({
          id: trade.id,
          price: Number(trade.price),
          quantity: Number(trade.qty),
          time: trade.time,
          isBuyerMaker: trade.isBuyerMaker,
        }));
      } catch (fallbackErr) {
        console.warn('Binance trades fallback failed:', fallbackErr?.message || fallbackErr);
      }
    }

    recentTrades.value = trades;
  } catch (error) {
    // Ignore abort errors
    if (error.name === 'AbortError' || error.name === 'CanceledError') {
      return;
    }
    console.error('Error loading recent trades:', error);
  }
};

const loadKlines = async () => {
  // Cancel previous request if still pending
  if (klinesAbortController) {
    klinesAbortController.abort();
  }
  klinesAbortController = new AbortController();
  
  try {
    // Wait for chart to be initialized - retry multiple times
    let retries = 0;
    while ((!chart || !candlestickSeries) && retries < 10) {
      if (retries > 0) {
        console.log('Chart not initialized yet, waiting...', retries);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      retries++;
    }
    
    if (!chart || !candlestickSeries) {
      console.error('Chart still not initialized after retries');
      return;
    }
    
    const symbol = selectedSymbol.value.replace('/', '');
    let interval = selectedInterval.value.toLowerCase();
    
    // Map interval names to Binance format
    const intervalMap = {
      'realtime': '1m',
      '1min': '1m',
      '5min': '5m',
      '15min': '15m',
      '30min': '30m',
      '1hour': '1h',
      '1day': '1d',
      '1week': '1w',
      '1m': '1M',
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

    // If backend returns no klines (e.g. Binance 451), fall back to direct Binance HTTP
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
        console.warn('Binance klines fallback failed:', fallbackErr?.message || fallbackErr);
      }
    }
    
    if (!klines || klines.length === 0) {
      console.warn('No klines data received');
      return;
    }
    
    // Prepare candlestick data - ensure all values are valid numbers
    const candlestickData = klines
      .filter((k) => k && k.time && k.open !== undefined && k.high !== undefined && k.low !== undefined && k.close !== undefined)
      .map((k) => {
        const time = typeof k.time === 'number' ? Math.floor(k.time / 1000) : Math.floor(new Date(k.time).getTime() / 1000);
        return {
          time: time,
          open: parseFloat(k.open),
          high: parseFloat(k.high),
          low: parseFloat(k.low),
          close: parseFloat(k.close),
        };
      })
      .filter((k) => k.time > 0 && !isNaN(k.open) && !isNaN(k.high) && !isNaN(k.low) && !isNaN(k.close) && k.open > 0 && k.high > 0 && k.low > 0 && k.close > 0);
    
    // Prepare volume data
    const volumeData = klines.map((k) => ({
      time: Math.floor(k.time / 1000),
      value: parseFloat(k.volume),
      color: parseFloat(k.close) >= parseFloat(k.open) ? '#43A047' : '#E53935',
    }));
    
    // Calculate moving averages
    const ma1Data = calculateMA(candlestickData, 5);
    const ma2Data = calculateMA(candlestickData, 10);
    const ma3Data = calculateMA(candlestickData, 20);
    
    // Update chart data - candlesticks first, then moving averages
    if (candlestickSeries && candlestickData.length > 0) {
      console.log('Setting candlestick data:', candlestickData.length, 'candles');
      // Set candlestick data
      candlestickSeries.setData(candlestickData);
      // Ensure candlesticks are visible
      candlestickSeries.applyOptions({
        visible: true,
        priceLineVisible: false,
        lastValueVisible: true,
      });
      
      // On first load, set a "zoomed in" default viewport (do NOT fit all candles)
      if (isInitialLoad && candlestickData.length > 0) {
        setTimeout(() => {
          applyDefaultViewport(candlestickData);
          isInitialLoad = false;
        }, 150);
      }
    } else {
      console.warn('No candlestick data to display:', {
        hasSeries: !!candlestickSeries,
        dataLength: candlestickData.length,
      });
    }
    
    if (volumeSeries && volumeData.length > 0 && volumeChart) {
      volumeSeries.setData(volumeData);
    }
    
    // Update moving averages only if we have valid candlestick data
    if (candlestickData.length > 0) {
      if (ma1Series && ma1Data.length > 0) {
        ma1Series.setData(ma1Data);
      }
      
      if (ma2Series && ma2Data.length > 0) {
        ma2Series.setData(ma2Data);
      }
      
      if (ma3Series && ma3Data.length > 0) {
        ma3Series.setData(ma3Data);
      }
    }
    
    // Wait for next tick and resize charts to ensure they render properly
    await nextTick();
    if (chart && chartContainer.value && candlestickData.length > 0) {
      const newWidth = chartContainer.value.clientWidth;
      if (newWidth > 0) {
        chart.applyOptions({ width: newWidth });
      }
    }
    if (volumeChart && volumeContainer.value && volumeData.length > 0) {
      const newVolumeWidth = volumeContainer.value.clientWidth;
      if (newVolumeWidth > 0) {
        volumeChart.applyOptions({ width: newVolumeWidth });
      }
    }
  } catch (error) {
    // Ignore abort errors
    if (error.name === 'AbortError' || error.name === 'CanceledError') {
      return;
    }
    console.error('Error loading klines:', error);
  }
};

const calculateMA = (data, period) => {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    // IMPORTANT: do NOT push null/0 values for early points, it can ruin autoscale when zoomed out
    if (i < period - 1) continue;
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    result.push({ time: data[i].time, value: sum / period });
  }
  return result;
};

const handleQuickAction = (side) => {
  // Navigate to Contracts page with the selected symbol and side
  const symbol = selectedSymbol.value.replace('/', '');
  router.push({ 
    path: '/contracts', 
    query: { 
      symbol: symbol,
      side: side 
    } 
  });
};

const initChart = async () => {
  await nextTick();
  if (chartContainer.value && !chart) {
    // Wait a bit more to ensure container is fully rendered and has dimensions
    let retries = 0;
    while ((!chartContainer.value.clientWidth || chartContainer.value.clientWidth === 0) && retries < 10) {
      await new Promise(resolve => setTimeout(resolve, 50));
      retries++;
    }
    
    // Main candlestick chart
    const containerWidth = chartContainer.value.clientWidth || 800;
    if (containerWidth === 0) {
      console.error('Chart container has no width');
      return;
    }
    
    chart = createChart(chartContainer.value, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#ffffff',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      width: containerWidth,
      height: chartHeight.value,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 6,
        barSpacing: isMobile.value ? 7 : 6,
      },
      rightPriceScale: {
        autoScale: true,
        scaleMargins: { top: 0.12, bottom: 0.18 },
      },
      watermark: {
        visible: false,
      },
    });
    
    // Use the computed isMobile value
    const isMobileValue = isMobile.value;
    
    candlestickSeries = chart.addCandlestickSeries({
      upColor: '#43A047',
      downColor: '#E53935',
      borderUpColor: '#43A047',
      borderDownColor: '#E53935',
      wickUpColor: '#43A047',
      wickDownColor: '#E53935',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
      visible: true,
      priceLineVisible: false,
      lastValueVisible: true,
    });
    
    // Add moving averages
    ma1Series = chart.addLineSeries({
      color: '#FF6B9D',
      lineWidth: 2,
      title: 'MA5',
    });
    
    ma2Series = chart.addLineSeries({
      color: '#4ECDC4',
      lineWidth: 2,
      title: 'MA10',
    });
    
    ma3Series = chart.addLineSeries({
      color: '#95E1D3',
      lineWidth: 2,
      title: 'MA20',
    });
    
    // Volume chart
    if (volumeContainer.value) {
      // Ensure volume container has dimensions
      let volumeRetries = 0;
      while ((!volumeContainer.value.clientWidth || volumeContainer.value.clientWidth === 0) && volumeRetries < 10) {
        await new Promise(resolve => setTimeout(resolve, 50));
        volumeRetries++;
      }
      
      const volumeWidth = volumeContainer.value.clientWidth || 800;
      volumeChart = createChart(volumeContainer.value, {
        layout: {
          background: { color: 'transparent' },
          textColor: '#ffffff',
        },
        grid: {
          vertLines: { visible: false },
          horzLines: { color: 'rgba(255, 255, 255, 0.1)' },
        },
        width: volumeWidth,
        height: volumeHeight.value,
        timeScale: {
          visible: false,
        },
        rightPriceScale: {
          visible: true,
        },
        watermark: {
          visible: false,
        },
      });
      
      volumeSeries = volumeChart.addHistogramSeries({
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });
      
      // Synchronize time scales
      chart.timeScale().subscribeVisibleTimeRangeChange((timeRange) => {
        if (timeRange && volumeChart) {
          try {
            const volumeTimeScale = volumeChart.timeScale();
            if (volumeTimeScale && timeRange.from && timeRange.to) {
              volumeTimeScale.setVisibleRange(timeRange);
            }
          } catch (error) {
            console.warn('Error syncing time scales:', error);
          }
        }
      });
    }
    
    // Function to remove watermark elements
    const removeWatermarks = () => {
      if (chartContainer.value) {
        const watermarks = chartContainer.value.querySelectorAll('svg[class*="watermark"], svg[data-name="watermark"], .watermark, [class*="tradingview"], svg text[class*="watermark"], svg text[data-name="watermark"]');
        watermarks.forEach(el => {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
          el.style.opacity = '0';
          el.remove();
        });
      }
      if (volumeContainer.value) {
        const watermarks = volumeContainer.value.querySelectorAll('svg[class*="watermark"], svg[data-name="watermark"], .watermark, [class*="tradingview"], svg text[class*="watermark"], svg text[data-name="watermark"]');
        watermarks.forEach(el => {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
          el.style.opacity = '0';
          el.remove();
        });
      }
    };
    
    // Remove watermark elements after chart initialization
    setTimeout(removeWatermarks, 100);
    setTimeout(removeWatermarks, 500);
    setTimeout(removeWatermarks, 1000);
    
    // Watch for dynamically added watermark elements
    if (chartContainer.value && volumeContainer.value) {
      watermarkObserver = new MutationObserver(() => {
        removeWatermarks();
      });
      
      watermarkObserver.observe(chartContainer.value, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'data-name']
      });
      
      watermarkObserver.observe(volumeContainer.value, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'data-name']
      });
    }
    
    // Don't load klines here - let onMounted handle it after chart is ready
    // loadKlines() will be called from onMounted after chart initialization
  }
};

// Watch for symbol changes
watch(() => route.query.symbol, (newSymbol) => {
  if (newSymbol) {
    let symbol = newSymbol.trim();
    // If symbol already has a slash, use it as is
    if (symbol.includes('/')) {
      // Already in format like "BCH/USDT"
      if (symbols.value.includes(symbol)) {
        selectedSymbol.value = symbol;
        loadMarketData();
        // Ensure WebSocket is connected when symbol changes
        if (!tickerWs || tickerWs.readyState !== WebSocket.OPEN) {
          connectWebSocket();
        }
      }
    } else {
      // Format like "BCHUSDT" - add slash before USDT
      symbol = symbol.replace(/USDT$/, '/USDT');
      if (symbols.value.includes(symbol)) {
        selectedSymbol.value = symbol;
        loadMarketData();
        // Ensure WebSocket is connected when symbol changes
        if (!tickerWs || tickerWs.readyState !== WebSocket.OPEN) {
          connectWebSocket();
        }
      }
    }
  }
}, { immediate: true });

let dataInterval = null;

// Process WebSocket updates - MUTATE existing ticker object (same as Home page)
const processTickerUpdate = (tickerData) => {
  if (!tickerData?.s) return;
  
  const symbol = tickerData.s;
  const currentSymbol = selectedSymbol.value.replace('/', '');
  if (symbol !== currentSymbol) return;
  
  if (!ticker.value) {
    // Initialize ticker if it doesn't exist
    ticker.value = {
      price: 0,
      priceChangePercent: 0,
      priceChange: 0,
      volume: 0,
      highPrice: 0,
      lowPrice: 0,
    };
  }
  
  const price = Number.parseFloat(tickerData.c);
  const changePercent = Number.parseFloat(tickerData.P) || 0;
  const change = Number.parseFloat(tickerData.p) || 0;
  const volume = Number.parseFloat(tickerData.v) || 0;
  const highPrice = Number.parseFloat(tickerData.h) || 0;
  const lowPrice = Number.parseFloat(tickerData.l) || 0;
  
  if (!Number.isFinite(price)) return;
  
  // Directly mutate properties (same as Home page) - Vue reactivity will detect changes
  ticker.value.price = price;
  ticker.value.priceChangePercent = changePercent;
  ticker.value.priceChange = change;
  ticker.value.volume = volume;
  ticker.value.highPrice = highPrice;
  ticker.value.lowPrice = lowPrice;
};

// WebSocket connection management (same as Home page)
const connectWebSocket = () => {
  if (tickerWs?.readyState === WebSocket.OPEN) return;
  
  console.log('[Kline WS] Connecting to Binance...');
  
  try {
    if (tickerWs) {
      tickerWs.onopen = null;
      tickerWs.onmessage = null;
      tickerWs.onerror = null;
      tickerWs.onclose = null;
      tickerWs.close();
    }
  } catch (e) {
    console.warn('[Kline WS] Cleanup error:', e);
  }
  
  try {
    tickerWs = new WebSocket(BINANCE_WS_URL);
    
    tickerWs.onopen = () => {
      console.log('[Kline WS] Connected successfully');
      wsBackoffMs = 1000;
    };
    
    tickerWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) {
          data.forEach(processTickerUpdate);
        }
      } catch (e) {
        console.error('[Kline WS] Parse error:', e);
      }
    };
    
    tickerWs.onerror = (e) => {
      console.error('[Kline WS] Error:', e);
    };
    
    tickerWs.onclose = (e) => {
      console.warn('[Kline WS] Closed:', e.code, e.reason);
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

const refreshMarketData = async () => {
  const symbol = selectedSymbol.value.replace('/', '');
  
  // Preserve zoom state during updates
  const currentTimeRange = chart?.timeScale()?.getVisibleRange();
  
  await Promise.all([
    loadTicker(symbol),
    loadRecentTrades(symbol),
    loadKlines(),
  ]);
  
  // Restore zoom state if user had zoomed (not initial load)
  if (!isInitialLoad && userHasZoomed && currentTimeRange && chart) {
    try {
      chart.timeScale().setVisibleRange(currentTimeRange);
      if (volumeChart) {
        volumeChart.timeScale().setVisibleRange(currentTimeRange);
      }
    } catch (error) {
      console.warn('Error restoring zoom:', error);
    }
  }
};

onMounted(async () => {
  // Initialize chart first, then load data
  await initChart();
  // Load market data (ticker and trades), klines will be loaded by initChart
  const symbol = selectedSymbol.value.replace('/', '');
  isLoading.value = true;
  try {
    await Promise.all([
      loadTicker(symbol),
      loadRecentTrades(symbol),
    ]);
    // Ensure klines are loaded after chart is ready
    if (chart && candlestickSeries) {
      await loadKlines();
    }
  } finally {
    isLoading.value = false;
  }
  
  // Resize charts on window resize (also adjust height on mobile to avoid empty space)
  handleResize = () => {
    try {
      if (chart && chartContainer.value) {
        const w = chartContainer.value.clientWidth;
        if (w > 0) chart.applyOptions({ width: w, height: chartHeight.value });
      }
      if (volumeChart && volumeContainer.value) {
        const w2 = volumeContainer.value.clientWidth;
        if (w2 > 0) volumeChart.applyOptions({ width: w2, height: volumeHeight.value });
      }
    } catch (e) {
      console.warn('handleResize error:', e);
    }
  };
  window.addEventListener('resize', handleResize, { passive: true });
  // One extra resize tick for mobile browsers after layout settles
  setTimeout(handleResize, 250);
  
  // WebSocket for real-time ticker updates (header price/change/volume)
  handleResize = () => {
    try {
      if (chart && chartContainer.value) {
        const w = chartContainer.value.clientWidth;
        if (w > 0) chart.applyOptions({ width: w, height: chartHeight.value });
      }
      if (volumeChart && volumeChartContainer.value) {
        const w = volumeChartContainer.value.clientWidth;
        if (w > 0) volumeChart.applyOptions({ width: w, height: volumeHeight.value });
      }
    } catch (error) {
      console.warn('Error resizing charts:', error);
    }
  };
  window.addEventListener('resize', handleResize);
  setTimeout(handleResize, 250);
  
  // Connect WebSocket for real-time updates (same as Home page)
  connectWebSocket();

  // Refresh klines and trades every 1 second (ticker updated via WebSocket in real-time)
  let isRefreshing = false;
  dataInterval = setInterval(async () => {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const symbol = selectedSymbol.value.replace('/', '');
        await Promise.all([
          loadRecentTrades(symbol),
          loadKlines(),
        ]);
      } catch (error) {
        console.error('Error refreshing market data:', error);
      } finally {
        isRefreshing = false;
      }
    }
  }, 1000);
});

onUnmounted(() => {
  // Cancel all pending requests
  if (tickerAbortController) {
    tickerAbortController.abort();
  }
  if (tradesAbortController) {
    tradesAbortController.abort();
  }
  if (klinesAbortController) {
    klinesAbortController.abort();
  }
  
  // Cleanup WebSocket
  if (wsReconnectTimer) {
    clearTimeout(wsReconnectTimer);
    wsReconnectTimer = null;
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
  
  if (watermarkObserver) {
    watermarkObserver.disconnect();
    watermarkObserver = null;
  }
  if (dataInterval) {
    clearInterval(dataInterval);
  }
  // Remove resize handler
  if (handleResize) {
    window.removeEventListener('resize', handleResize);
    handleResize = null;
  }
  if (chart) {
    chart.remove();
  }
  if (volumeChart) {
    volumeChart.remove();
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

/* IMPORTANT: no forced min-height on mobile (it caused large empty space) */
</style>