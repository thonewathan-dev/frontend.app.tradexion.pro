<template>
  <div class="w-full">
    <div class="grid grid-cols-1 gap-4">
      <!-- Left: Featured coin card -->
      <button
        type="button"
        class="glass-card-no-hover rounded-2xl border border-white/10 p-5 text-left w-full hover:bg-white/5 transition-colors"
        @click="goHome"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-white/5 border border-white/15 flex items-center justify-center overflow-hidden">
              <img
                v-if="featuredLogo"
                :src="featuredLogo"
                :alt="featured.symbol"
                class="w-6 h-6 object-contain"
              />
              <span v-else class="text-white font-bold text-sm">₿</span>
            </div>
            <div>
              <div class="text-base font-bold text-white leading-tight">{{ featured.symbol }}</div>
              <div class="text-xs text-white/60">{{ featured.name }}</div>
            </div>
          </div>
          <div class="text-white/60 text-lg">›</div>
        </div>

        <!-- Sparkline -->
        <div class="mt-4">
          <div class="h-16 w-full relative">
            <svg class="absolute inset-0 w-full h-full" viewBox="0 0 220 64" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="rgba(244,63,94,0.35)" />
                  <stop offset="1" stop-color="rgba(244,63,94,0)" />
                </linearGradient>
              </defs>
              <path
                :d="featuredPath"
                fill="none"
                stroke="rgba(248,113,113,1)"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path :d="featuredAreaPath" fill="url(#sparkFill)" />
            </svg>
          </div>
        </div>

        <div class="mt-3 flex items-end justify-between">
          <div>
            <div :class="featured.change < 0 ? 'text-red-300' : 'text-emerald-300'" class="text-2xl font-extrabold">
              {{ formatChange(featured.change) }}
            </div>
            <div class="text-xs text-white/50 mt-0.5">Price</div>
          </div>
          <div class="text-right">
            <div class="text-white font-bold text-lg">{{ formatPrice(featured.price) }}</div>
          </div>
        </div>
      </button>

      <!-- Right: Market list card -->
      <div class="glass-card-no-hover rounded-2xl border border-white/10 overflow-hidden">
        <div class="px-5 pt-4 pb-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-6 text-sm font-semibold">
              <button
                type="button"
                class="pb-2 border-b-2 transition-colors"
                :class="activeTab === 'spot' ? 'border-white text-white' : 'border-transparent text-white/50 hover:text-white/80'"
                @click="activeTab = 'spot'"
              >
                Spot
              </button>
              <button
                type="button"
                class="pb-2 border-b-2 transition-colors"
                :class="activeTab === 'futures' ? 'border-white text-white' : 'border-transparent text-white/50 hover:text-white/80'"
                @click="activeTab = 'futures'"
              >
                Futures
              </button>
              <button
                type="button"
                class="pb-2 border-b-2 transition-colors"
                :class="activeTab === 'new' ? 'border-white text-white' : 'border-transparent text-white/50 hover:text-white/80'"
                @click="activeTab = 'new'"
              >
                New
              </button>
            </div>

            <button
              type="button"
              class="text-xs text-white/50 font-semibold hover:text-white/80 transition-colors"
              @click="goHome"
            >
              View All <span class="text-white/40">›</span>
            </button>
          </div>
        </div>

        <div class="divide-y divide-white/10">
          <div
            v-for="item in tabItems"
            :key="item.symbol"
            class="px-5 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="w-9 h-9 rounded-full border flex items-center justify-center"
                :class="item.color"
              >
                <img
                  v-if="item.logo"
                  :src="item.logo"
                  :alt="item.symbol"
                  class="w-5 h-5 object-contain"
                />
                <span v-else class="text-white text-xs font-bold">{{ item.badge }}</span>
              </div>
              <div class="min-w-0">
                <div class="text-sm font-bold text-white leading-tight">{{ item.symbol }}</div>
                <div class="text-xs text-white/60 truncate">{{ item.name }}</div>
              </div>
            </div>

            <div class="flex items-center gap-6">
              <div class="text-sm font-bold text-white tabular-nums">{{ formatPrice(item.price) }}</div>
              <div
                class="text-sm font-bold tabular-nums w-16 text-right"
                :class="item.change < 0 ? 'text-red-300' : 'text-emerald-300'"
              >
                {{ formatChange(item.change) }}
              </div>
            </div>
          </div>
        </div>

        <div class="px-5 py-3 text-xs text-white/40">
          Market data is illustrative on auth pages.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../utils/api';
import { getCoinLogoUrl } from '../utils/coinLogos';

const router = useRouter();
const goHome = () => router.push('/');

// Use the same supported symbol list as Home (so we don't show random coins)
const SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT',
  'ADAUSDT', 'DOGEUSDT', 'LTCUSDT', 'ETCUSDT',
  'BCHUSDT', 'DOTUSDT', 'NEOUSDT', 'IOTAUSDT', 'LUNAUSDT'
];

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws/!ticker@arr';

const activeTab = ref('spot'); // 'spot' | 'futures' | 'new'

// tickerMap by symbolKey (e.g., BTCUSDT)
const tickerMap = reactive({});
SYMBOLS.forEach((s) => {
  tickerMap[s] = reactive({
    symbol: s,
    base: s.replace('USDT', ''),
    price: 0,
    change: 0,
    volume: 0,
  });
});

// Small price history for sparkline (BTC only)
const featuredSeries = ref(Array.from({ length: 16 }).map(() => 50));
let tickerWs = null;
let wsReconnectTimer = null;
const lastSeriesAt = ref(0);

const processTickerUpdate = (tickerData) => {
  const symbol = tickerData?.s;
  if (!symbol || !tickerMap[symbol]) return;

  const t = tickerMap[symbol];
  t.price = Number(tickerData.c ?? t.price) || t.price;
  t.change = Number(tickerData.P ?? t.change) || t.change;
  t.volume = Number(tickerData.q ?? t.volume) || t.volume;

  // Update BTC sparkline (throttled)
  if (symbol === 'BTCUSDT') {
    const now = Date.now();
    if (now - lastSeriesAt.value > 1200) {
      lastSeriesAt.value = now;
      const next = (Number(tickerData.c) || 0);
      if (next > 0) {
        const arr = featuredSeries.value.slice(-19);
        arr.push(next);
        featuredSeries.value = arr;
      }
    }
  }
};

const connectWebSocket = () => {
  try {
    if (tickerWs) tickerWs.close();
    tickerWs = new WebSocket(BINANCE_WS_URL);
    tickerWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) data.forEach(processTickerUpdate);
      } catch (_) {}
    };
    tickerWs.onclose = () => scheduleReconnect();
    tickerWs.onerror = () => scheduleReconnect();
  } catch (_) {
    scheduleReconnect();
  }
};

const scheduleReconnect = () => {
  if (wsReconnectTimer) return;
  wsReconnectTimer = setTimeout(() => {
    wsReconnectTimer = null;
    connectWebSocket();
  }, 1500);
};

const hydrateFromRest = async () => {
  try {
    const res = await api.get('/market/ticker/24h');
    const arr = Array.isArray(res.data) ? res.data : (res.data?.tickers || []);
    // Match our symbols only
    arr.forEach((row) => {
      const sym = row?.symbol;
      if (!sym || !tickerMap[sym]) return;
      tickerMap[sym].price = Number(row.lastPrice ?? row.c ?? tickerMap[sym].price) || tickerMap[sym].price;
      // Binance 24h endpoint uses priceChangePercent; WS uses P
      tickerMap[sym].change = Number(row.priceChangePercent ?? row.P ?? tickerMap[sym].change) || tickerMap[sym].change;
      tickerMap[sym].volume = Number(row.quoteVolume ?? row.q ?? tickerMap[sym].volume) || tickerMap[sym].volume;
    });
  } catch (_) {
    // ok - websocket will still update
  }
};

const featured = computed(() => {
  const t = tickerMap.BTCUSDT;
  return {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: t?.price || 0,
    change: t?.change || 0,
  };
});

const featuredLogo = computed(() => {
  try {
    return getCoinLogoUrl('BTC');
  } catch (_) {
    return null;
  }
});

// Convert BTC price history into sparkline (normalized to SVG space)
const sparkValues = computed(() => {
  const vals = featuredSeries.value.filter((n) => Number(n) > 0);
  if (vals.length < 2) return [50, 50, 50, 50];
  return vals;
});

const tabItems = computed(() => {
  const rows = SYMBOLS
    .map((s) => tickerMap[s])
    .filter(Boolean)
    .map((t) => ({
      symbol: t.base,
      name: t.base,
      price: t.price,
      change: t.change,
      volume: t.volume,
      badge: t.base.slice(0, 1),
      logo: (() => {
        try {
          return getCoinLogoUrl(t.base);
        } catch (_) {
          return null;
        }
      })(),
      color: 'bg-white/5 border-white/15',
    }));

  if (activeTab.value === 'spot') {
    return rows
      .slice()
      .sort((a, b) => (b.volume || 0) - (a.volume || 0))
      .slice(0, 6);
  }

  if (activeTab.value === 'futures') {
    return rows
      .slice()
      .sort((a, b) => Math.abs(b.change || 0) - Math.abs(a.change || 0))
      .slice(0, 6);
  }

  // "New": show top gainers among supported list
  return rows
    .slice()
    .sort((a, b) => (b.change || 0) - (a.change || 0))
    .slice(0, 6);
});

const formatPrice = (n) => {
  const num = Number(n) || 0;
  if (num >= 1000) return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (num >= 1) return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`;
};

const formatChange = (n) => {
  const num = Number(n) || 0;
  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
};

const buildPath = (values) => {
  const w = 220;
  const h = 64;
  const pad = 6;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  const step = (w - pad * 2) / (values.length - 1);

  const pts = values.map((v, i) => {
    const x = pad + i * step;
    const y = pad + (h - pad * 2) * (1 - (v - min) / span);
    return { x, y };
  });

  const d = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ');

  const area = `${d} L ${(w - pad).toFixed(2)} ${(h - pad).toFixed(2)} L ${pad.toFixed(2)} ${(h - pad).toFixed(2)} Z`;
  return { d, area };
};

const featuredPaths = computed(() => buildPath(sparkValues.value));
const featuredPath = computed(() => featuredPaths.value.d);
const featuredAreaPath = computed(() => featuredPaths.value.area);

onMounted(async () => {
  await hydrateFromRest();
  connectWebSocket();
});

onUnmounted(() => {
  if (wsReconnectTimer) clearTimeout(wsReconnectTimer);
  wsReconnectTimer = null;
  if (tickerWs) tickerWs.close();
  tickerWs = null;
});
</script>

