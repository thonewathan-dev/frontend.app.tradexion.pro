<template>
  <div class="min-h-screen">
    <MobileNav v-if="isMobile" />
    <div class="md:flex">
      <DesktopNav v-if="!isMobile" />
      <main class="flex-1 pb-16 md:pb-0">
        <!-- Header -->
        <div class="glass-card-no-hover border-b border-white/10 px-4 py-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 glass rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div>
                <div class="text-sm font-medium text-white">{{ user?.email || 'User' }}</div>
                <div class="text-xs text-white/60">ID: {{ user?.id || 'N/A' }}</div>
              </div>
            </div>
            <button class="px-2 py-0.5 glass-button-no-hover rounded-full text-[10px] font-medium text-white">
              Credit score: {{ parseFloat(user?.credited_score || 100).toFixed(0) }}
            </button>
          </div>
        </div>

        <div class="p-3 space-y-3">
          <!-- Asset Center -->
          <div class="glass-card rounded-lg p-4">
            <div class="flex items-center justify-between mb-1">
              <div class="text-white/70 text-xs">Asset Center (USDT)</div>
              <button
                type="button"
                class="p-1 rounded-full hover:bg-white/10 transition-colors"
                @click="handleAssetInfo"
                aria-label="Asset center information"
              >
                <svg class="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2z" />
                </svg>
              </button>
                  </div>
            <div class="text-white text-3xl font-bold mb-3">
              <span v-if="!hasLoadedWallets" class="inline-block h-7 w-28 rounded bg-white/10 animate-pulse" />
              <span v-else>≈{{ formatBalance(totalBalance) }}</span>
            </div>
            <div class="flex items-center justify-between py-2 px-2 bg-white/5 rounded-md">
              <div class="flex-1 text-center">
                <div class="text-white/60 text-xs mb-1">Contract account</div>
                <div class="text-white text-base font-semibold">
                  <span v-if="!hasLoadedWallets" class="inline-block h-4 w-16 rounded bg-white/10 animate-pulse" />
                  <span v-else>{{ formatBalance(contractBalance) }}</span>
                </div>
              </div>
              <div class="w-px h-8 bg-white/10"></div>
              <div class="flex-1 text-center">
                <div class="text-white/60 text-xs mb-1">Spot account</div>
                <div class="text-white text-base font-semibold">
                  <span v-if="!hasLoadedWallets" class="inline-block h-4 w-16 rounded bg-white/10 animate-pulse" />
                  <span v-else>{{ formatBalance(spotBalance) }}</span>
                </div>
              </div>
              </div>
            </div>
            
          <!-- Actions -->
          <div class="glass-card rounded-lg p-4">
            <div class="flex gap-2">
              <button
                @click="router.push('/deposit')"
                class="flex-1 flex flex-col items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              >
                <img :src="depositIcon" alt="Deposit" class="w-8 h-8 object-contain" />
                <span class="text-white text-xs font-medium">Deposit</span>
              </button>
              <button
                @click="router.push('/withdraw')"
                class="flex-1 flex flex-col items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              >
                <img :src="withdrawIcon" alt="Withdraw" class="w-8 h-8 object-contain" />
                <span class="text-white text-xs font-medium">Withdraw</span>
              </button>
              <button
                @click="router.push('/transfer')"
                class="flex-1 flex flex-col items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              >
                <img :src="transferIcon" alt="Transfer" class="w-8 h-8 object-contain" />
                <span class="text-white text-xs font-medium">Transfer</span>
              </button>
            </div>
          </div>

          <!-- Menu Cards -->
          <div class="space-y-3 mt-1">
            <!-- Card 1: Accounts -->
            <div class="glass-card-no-hover rounded-lg overflow-hidden">
              <button
                class="w-full flex items-center justify-between px-3 py-3 border-b border-white/10 transition-colors hover:bg-white/5"
                @click="router.push('/flash-exchange')"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span class="text-white text-sm font-medium">Flash Exchange</span>
                </div>
                <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                class="w-full flex items-center justify-between px-3 py-3 border-b border-white/10 transition-colors hover:bg-white/5"
                @click="router.push('/spot-account')"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span class="text-white text-sm font-medium">Spot account</span>
                </div>
                <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                class="w-full flex items-center justify-between px-3 py-3 transition-colors hover:bg-white/5"
                @click="router.push('/contract-account')"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span class="text-white text-sm font-medium">Contract account</span>
              </div>
              <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              </button>
            </div>

            <!-- Card 2: Services -->
            <div class="glass-card-no-hover rounded-lg overflow-hidden">
              <button
                class="w-full flex items-center justify-between px-3 py-3 border-b border-white/10 transition-colors hover:bg-white/5"
                @click="handleInviteFriends"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span class="text-white text-sm font-medium">Invite friends</span>
          </div>
                <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                class="w-full flex items-center justify-between px-3 py-3 border-b border-white/10 transition-colors hover:bg-white/5"
                @click="router.push('/about-tradexion')"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-white text-sm font-medium">About TradeXion</span>
                </div>
                <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                class="w-full flex items-center justify-between px-3 py-3 transition-colors hover:bg-white/5"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span class="text-white text-sm font-medium">Complaint suggestion</span>
              </div>
              <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              </button>
          </div>

            <!-- Card 3: Settings -->
            <div class="glass-card-no-hover rounded-lg overflow-hidden">
              <button
                class="w-full flex items-center justify-between px-3 py-3 border-b border-white/10 transition-colors hover:bg-white/5"
                @click="handleClientDownload"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span class="text-white text-sm font-medium">Client Download</span>
                </div>
                <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                class="w-full flex items-center justify-between px-3 py-3 border-b border-white/10 transition-colors hover:bg-white/5"
                @click="router.push('/change-password')"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span class="text-white text-sm font-medium">Modify the password</span>
              </div>
              <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
                class="w-full flex items-center justify-between px-3 py-3 transition-colors hover:bg-white/5"
                @click="router.push('/chat')"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 10a6 6 0 00-12 0v3H5a2 2 0 00-2 2v1a2 2 0 002 2h3v-4H8v-4a4 4 0 118 0v4h-1v4h3a2 2 0 002-2v-1a2 2 0 00-2-2h-1v-3z" />
                  </svg>
                  <span class="text-white text-sm font-medium">Customer Services</span>
        </div>
                <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
            </div>

            <!-- Logout Button (separate, not in card) -->
                <button
              class="w-full flex items-center justify-between px-3 py-3 rounded-xl bg-red-500/10 transition-colors hover:bg-red-500/20 active:bg-red-500/30"
              @click="handleLogout"
            >
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span class="text-white text-sm font-medium">Log out</span>
              </div>
            </button>
          </div>
        </div>

      </main>
    </div>

    <!-- Client Download Modal -->
    <div
      v-if="showDownloadModal"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      @click.self="showDownloadModal = false"
    >
      <div class="glass-card rounded-lg p-4 max-w-sm w-full shadow-2xl border border-white/10 animate-slide-up max-h-[85vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-white font-semibold text-base">Download TradeXion App</h2>
          <button
            @click="showDownloadModal = false"
            class="p-1.5 rounded"
          >
            <svg class="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-3">
          <!-- Already Installed -->
          <div v-if="isAppInstalled" class="p-3 bg-green-500/10 border border-green-500/20 rounded">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="text-white font-medium text-sm">App Installed</p>
                <p class="text-white/70 text-xs">TradeXion is already installed on your device</p>
              </div>
            </div>
          </div>

          <!-- Android/Desktop Install -->
          <div v-if="!isIOSDevice && !isAppInstalled" class="space-y-2">
            <div class="p-3 bg-white/5 rounded border border-white/10">
              <div class="flex items-start gap-2 mb-3">
                <img src="/icon-192.png" alt="TradeXion" class="w-12 h-12 rounded-lg flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <h3 class="text-white font-semibold text-sm">TradeXion</h3>
                  <p class="text-white/70 text-xs">Professional Trading Platform</p>
                </div>
              </div>
              <button
                v-if="deferredPrompt"
                @click="handleInstall"
                class="w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded font-medium text-sm shadow-lg"
              >
                Install App
              </button>
              <div v-else class="p-2 bg-white/5 rounded">
                <p class="text-white/70 text-xs text-center">
                  Install option will appear automatically. Make sure you're using Chrome or Edge browser.
                </p>
              </div>
            </div>
            <div class="text-xs text-white/60 text-center space-y-0.5">
              <p>For the best experience, install TradeXion as an app</p>
              <p>Works offline • Faster loading • App-like experience</p>
            </div>
          </div>

          <!-- iOS Install Instructions -->
          <div v-if="isIOSDevice && !isAppInstalled" class="space-y-3">
            <div class="p-3 bg-white/5 rounded border border-white/10">
              <div class="flex items-start gap-2 mb-3">
                <img src="/icon-192.png" alt="TradeXion" class="w-12 h-12 rounded-lg flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <h3 class="text-white font-semibold text-sm">TradeXion</h3>
                  <p class="text-white/70 text-xs">Professional Trading Platform</p>
                </div>
              </div>
              
              <div class="space-y-2 mb-3">
                <div class="flex items-start gap-2">
                  <div class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span class="text-blue-400 font-bold text-xs">1</span>
                  </div>
                  <div class="flex-1">
                    <p class="text-white text-xs">Tap the <span class="font-semibold">Share</span> button</p>
                    <p class="text-white/60 text-[10px] mt-0.5">Located at the bottom of Safari</p>
                  </div>
                </div>
                
                <div class="flex items-start gap-2">
                  <div class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span class="text-blue-400 font-bold text-xs">2</span>
                  </div>
                  <div class="flex-1">
                    <p class="text-white text-xs">Select <span class="font-semibold">"Add to Home Screen"</span></p>
                    <p class="text-white/60 text-[10px] mt-0.5">Scroll down if needed</p>
                  </div>
                </div>
                
                <div class="flex items-start gap-2">
                  <div class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span class="text-blue-400 font-bold text-xs">3</span>
                  </div>
                  <div class="flex-1">
                    <p class="text-white text-xs">Tap <span class="font-semibold">"Add"</span></p>
                    <p class="text-white/60 text-[10px] mt-0.5">The app will appear on your home screen</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Platform Info -->
          <div class="pt-2 border-t border-white/10">
            <p class="text-white/60 text-[10px] text-center">
              <span v-if="isIOSDevice">iOS Safari detected</span>
              <span v-else-if="isAndroidDevice">Android detected</span>
              <span v-else>Desktop browser detected</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useAlert } from '../composables/useAlert';
import MobileNav from '../components/MobileNav.vue';
import DesktopNav from '../components/DesktopNav.vue';
import api from '../utils/api';
import { isIOS, isAndroid, isAppInstalled as checkIsAppInstalled } from '../utils/pwa';
import depositIcon from '@/assets/dp-wd-tf-icons/deposit.png';
import withdrawIcon from '@/assets/dp-wd-tf-icons/withdraw.png';
import transferIcon from '@/assets/dp-wd-tf-icons/transfer.png';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { showSuccess, showError, showWarning, showInfo } = useAlert();

const isMobile = computed(() => window.innerWidth < 768);
const user = computed(() => authStore.user);

const wallets = ref([]);
const loading = ref(false);
const hasLoadedWallets = ref(false);
const showDownloadModal = ref(false);
const deferredPrompt = ref(null);
const isIOSDevice = ref(false);
const isAndroidDevice = ref(false);
const isInstalled = ref(false);

// Computed property for template compatibility
const isAppInstalled = computed(() => isInstalled.value);

// Prices vs USDT for asset center calculations
const prices = ref({
  USDT: 1,
  BTCUSDT: null,
  ETHUSDT: null,
});

let balanceInterval = null;
let userRefreshInterval = null;

const priceInUSDT = (symbol) => {
  const s = (symbol || '').toUpperCase();
  if (s === 'USDT') return 1;
  if (s === 'BTC') return prices.value.BTCUSDT || 0;
  if (s === 'ETH') return prices.value.ETHUSDT || 0;
    return 0;
};

const accountTotalUSDT = (accountType) => {
  const type = (accountType || 'spot').toLowerCase();
  return wallets.value.reduce((sum, w) => {
    const accType = (w.account_type || 'spot').toLowerCase();
    if (accType !== type) return sum;
    const sym = (w.currency || '').toUpperCase();
    const bal = Math.max(0, parseFloat(w.balance || 0));
    if (!bal) return sum;
    const p = priceInUSDT(sym);
    if (!p) return sum;
    return sum + bal * p;
  }, 0);
};

const spotBalance = computed(() => accountTotalUSDT('spot'));
const contractBalance = computed(() => accountTotalUSDT('contract'));
const totalBalance = computed(() => spotBalance.value + contractBalance.value);

const formatBalance = (balance) => {
  const num = parseFloat(balance) || 0;
  if (num >= 1) return num.toFixed(2);
  if (num >= 0.01) return num.toFixed(4);
  return num.toFixed(8);
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
    console.error('Error loading prices for asset center:', e);
  }
};

const handleLogout = () => {
    authStore.logout();
    router.push('/login');
};

const handleInviteFriends = () => {
  showWarning('Invite friends feature will be available soon.');
};

// Check install status
const checkInstallStatus = () => {
  isIOSDevice.value = isIOS();
  isAndroidDevice.value = isAndroid();
  isInstalled.value = checkIsAppInstalled();
};

// Handle install button click (Android/Desktop)
const handleInstall = async () => {
  if (!deferredPrompt.value) {
    // If no deferred prompt, show info message
    if (isIOSDevice.value) {
      // For iOS, show instructions modal
      showDownloadModal.value = true;
    } else {
      showInfo('Install prompt not available. Please use Chrome or Edge browser and make sure the site meets PWA requirements.');
    }
    return;
  }
  
  // Show the native browser install prompt
  deferredPrompt.value.prompt();
  
  // Wait for user response
  const { outcome } = await deferredPrompt.value.userChoice;
  
  if (outcome === 'accepted') {
    showSuccess('App installation started!');
  } else {
    showInfo('Installation cancelled.');
  }
  
  // Clear the deferred prompt
  deferredPrompt.value = null;
};

// Handle Client Download button click
const handleClientDownload = () => {
  // Check if app is already installed
  if (isInstalled.value) {
    showInfo('TradeXion is already installed on your device.');
    return;
  }
  
  // For iOS, show instructions modal
  if (isIOSDevice.value) {
    showDownloadModal.value = true;
    return;
  }
  
  // For Android/Desktop, try to trigger native install prompt
  if (deferredPrompt.value) {
    handleInstall();
  } else {
    // If prompt not available yet, show info
    showInfo('Install option will appear automatically. Please use Chrome or Edge browser.');
  }
};

// Listen for beforeinstallprompt event (Android/Desktop)
const handleBeforeInstallPrompt = (e) => {
  e.preventDefault();
  deferredPrompt.value = e;
};

// Listen for app installed event
const handleAppInstalled = () => {
  isInstalled.value = true;
  deferredPrompt.value = null;
  showSuccess('TradeXion has been installed successfully!');
  showDownloadModal.value = false;
};

const handleAssetInfo = () => {
  showInfo(
    'Asset Center shows your total balance converted to USDT, combining both Spot and Contract accounts. For detailed breakdowns, open the Spot or Contract account pages.'
  );
};

const loadWallets = async () => {
  try {
    loading.value = true;
    const res = await api.get('/wallet');
    wallets.value = (res.data.wallets || []).map(w => ({
      ...w,
      account_type: w.account_type || 'spot',
    }));
    hasLoadedWallets.value = true;
  } catch (e) {
    console.error('Error loading wallets:', e);
    showError('Failed to load wallets');
    // Still mark as loaded to avoid infinite skeleton
    hasLoadedWallets.value = true;
  } finally {
    loading.value = false;
  }
};

const loadWalletsSilently = async () => {
  try {
    const res = await api.get('/wallet');
    wallets.value = (res.data.wallets || []).map(w => ({
      ...w,
      account_type: w.account_type || 'spot',
    }));
  } catch (e) {
    console.error('Error loading wallets silently:', e);
  }
};

const refreshUser = async () => {
  try {
    await authStore.fetchCurrentUser();
  } catch (e) {
    console.error('Error refreshing user:', e);
  }
};


onMounted(async () => {
  if (!authStore.user) {
    await authStore.fetchCurrentUser();
  } else {
    await refreshUser();
  }
  await loadPrices();
  await loadWallets();
  
  // Check PWA install status
  checkInstallStatus();
  
  // Listen for beforeinstallprompt (Chrome/Edge)
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  
  // Listen for app installed
  window.addEventListener('appinstalled', handleAppInstalled);
  
  balanceInterval = setInterval(() => {
    loadWalletsSilently();
    loadPrices();
  }, 30000);

  userRefreshInterval = setInterval(() => {
    if (route.path === '/assets') {
      refreshUser();
      checkInstallStatus(); // Recheck install status periodically
    }
  }, 10000);
});

onUnmounted(() => {
  if (balanceInterval) clearInterval(balanceInterval);
  if (userRefreshInterval) {
    clearInterval(userRefreshInterval);
    userRefreshInterval = null;
  }
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.removeEventListener('appinstalled', handleAppInstalled);
});
</script>

<style scoped>
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
</style>
