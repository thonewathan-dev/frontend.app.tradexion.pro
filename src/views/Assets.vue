<template>
  <div class="min-h-screen">
    <MobileNav v-if="isMobile" />
    <div class="md:flex">
      <DesktopNav v-if="!isMobile" />
      <main class="flex-1 pb-16 md:pb-0">
        <!-- Top Header -->
        <div class="glass-card-no-hover border-b border-white/10 px-4 py-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 glass rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <div class="text-sm font-medium text-white">{{ user?.email || t('common.user') }}</div>
                <div class="text-xs text-white/60">ID: {{ user?.id || 'N/A' }}</div>
              </div>
            </div>
            <button class="px-2 py-0.5 glass-button-no-hover rounded-full text-[10px] font-medium text-white">
              {{ t('assets.creditScore') }}: {{ parseFloat(user?.credited_score || 100).toFixed(0) }}
            </button>
          </div>
        </div>

        <div class="p-3">
          <!-- Loading Skeleton -->
          <template v-if="isLoading">
            <div class="animate-pulse">
              <!-- Asset Center Card Skeleton -->
              <div class="glass-card rounded-lg p-4 mb-3">
                <div class="h-3 bg-white/10 rounded w-32 mb-4"></div>
                <div class="h-8 bg-white/10 rounded w-40 mb-4"></div>
                <div class="flex items-center justify-between py-2 px-2 bg-white/5 rounded-md mb-3">
                  <div class="flex-1 text-center space-y-1">
                    <div class="h-2.5 bg-white/10 rounded w-20 mx-auto"></div>
                    <div class="h-4 bg-white/10 rounded w-24 mx-auto"></div>
                  </div>
                  <div class="w-px h-8 bg-white/10"></div>
                  <div class="flex-1 text-center space-y-1">
                    <div class="h-2.5 bg-white/10 rounded w-20 mx-auto"></div>
                    <div class="h-4 bg-white/10 rounded w-24 mx-auto"></div>
                  </div>
                </div>
                <div class="flex gap-2 mt-4">
                  <div class="flex-1 h-12 bg-white/10 rounded-md"></div>
                  <div class="flex-1 h-12 bg-white/10 rounded-md"></div>
                  <div class="flex-1 h-12 bg-white/10 rounded-md"></div>
                </div>
              </div>
              
              <!-- Account List Skeleton -->
              <div class="glass-card rounded-lg mb-3 overflow-hidden">
                <div v-for="i in 5" :key="i" class="flex items-center justify-between p-3 border-b border-white/10 last:border-b-0">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 bg-white/10 rounded-lg"></div>
                    <div class="h-4 bg-white/10 rounded w-32"></div>
                  </div>
                  <div class="w-4 h-4 bg-white/10 rounded"></div>
                </div>
              </div>
              
              <!-- Settings List Skeleton -->
              <div class="glass-card rounded-lg mb-3 overflow-hidden">
                <div v-for="i in 5" :key="i" class="flex items-center justify-between p-3 border-b border-white/10 last:border-b-0">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 bg-white/10 rounded-lg"></div>
                    <div class="h-4 bg-white/10 rounded w-32"></div>
                  </div>
                  <div class="w-4 h-4 bg-white/10 rounded"></div>
                </div>
              </div>
              
              <!-- Profile List Skeleton -->
              <div class="glass-card rounded-lg overflow-hidden">
                <div v-for="i in 3" :key="i" class="flex items-center justify-between p-3 border-b border-white/10 last:border-b-0">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 bg-white/10 rounded-lg"></div>
                    <div class="h-4 bg-white/10 rounded w-32"></div>
                  </div>
                  <div class="w-4 h-4 bg-white/10 rounded"></div>
                </div>
              </div>
            </div>
          </template>
          
          <!-- Actual Content -->
          <template v-else>
          <!-- Balance Card - Big Glass Card -->
          <div class="glass-card rounded-lg p-4 mb-3">
            <div class="text-white/70 text-xs mb-1.5">{{ t('assets.assetCenter') }}(USDT)</div>
            <div class="text-white text-3xl font-bold mb-3">≈{{ formatBalance(totalBalance) }}</div>
            
            <!-- Account Balances -->
            <div class="flex items-center justify-between py-2 px-2 bg-white/5 rounded-md">
              <div class="flex-1 text-center">
                <div class="text-white/60 text-xs mb-1">{{ t('assets.contractAccount') }}</div>
                <div class="text-white text-base font-semibold">{{ formatBalance(contractBalance) }}</div>
              </div>
              <div class="w-px h-8 bg-white/10"></div>
              <div class="flex-1 text-center">
                <div class="text-white/60 text-xs mb-1">{{ t('assets.spotAccount') }}</div>
                <div class="text-white text-base font-semibold">{{ formatSpotBalance(spotBalance) }}</div>
              </div>
              </div>
            </div>
            
          <!-- Action Buttons Card - Separate Glass Card -->
          <div class="glass-card rounded-lg p-4 mb-3">
            <div class="flex gap-2">
              <button
                @click="$router.push('/deposit')"
                class="flex-1 flex flex-col items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              >
                <img 
                  :src="depositIcon" 
                  alt="Deposit" 
                  class="w-8 h-8 object-contain"
                />
                <span class="text-white text-xs font-medium">{{ t('common.deposit') }}</span>
              </button>
              <button
                @click="$router.push('/withdraw')"
                class="flex-1 flex flex-col items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              >
                <img 
                  :src="withdrawIcon" 
                  alt="Withdraw" 
                  class="w-8 h-8 object-contain"
                />
                <span class="text-white text-xs font-medium">{{ t('common.withdraw') }}</span>
              </button>
              <button
                @click="openTransferModal"
                class="flex-1 flex flex-col items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              >
                <img 
                  :src="transferIcon" 
                  alt="Transfer" 
                  class="w-8 h-8 object-contain"
                />
                <span class="text-white text-xs font-medium">{{ t('common.transfer') }}</span>
              </button>
            </div>
          </div>

          <!-- Account List -->
          <div class="glass-card rounded-lg mb-3 overflow-hidden">
            <div
              v-for="(item, index) in accountItems"
              :key="index"
              class="flex items-center justify-between p-3 border-b border-white/10 last:border-b-0 cursor-pointer hover:bg-white/5 transition-colors"
              @click="handleAccountItemClick(item.action)"
            >
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 glass rounded-lg flex items-center justify-center">
                  <component :is="item.icon" class="w-4 h-4 text-white" />
                </div>
                <span class="text-white text-sm font-medium">{{ item.label }}</span>
              </div>
              <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          <!-- Settings/Support List -->
          <div class="glass-card rounded-lg mb-3 overflow-hidden">
            <div
              v-for="(item, index) in settingsItems"
              :key="index"
              class="flex items-center justify-between p-3 border-b border-white/10 last:border-b-0 cursor-pointer hover:bg-white/5 transition-colors"
              @click="handleSettingsItemClick(item.action)"
            >
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 glass rounded-lg flex items-center justify-center">
                  <component :is="item.icon" class="w-4 h-4 text-white" />
                </div>
                <span class="text-white text-sm font-medium">{{ item.label }}</span>
              </div>
              <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          <!-- Profile/Settings List -->
          <div class="glass-card rounded-lg overflow-hidden">
            <div
              v-for="(item, index) in profileItems"
              :key="index"
              class="flex items-center justify-between p-3 border-b border-white/10 last:border-b-0 cursor-pointer hover:bg-white/5 transition-colors"
              @click="handleProfileItemClick(item.action)"
            >
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 glass rounded-lg flex items-center justify-center">
                  <component :is="item.icon" class="w-4 h-4 text-white" />
                </div>
                <span class="text-white text-sm font-medium">{{ item.label }}</span>
              </div>
              <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
          </template>
        </div>
      </main>
    </div>

    <!-- Withdraw Modal -->
    <div
      v-if="showWithdrawModal"
      class="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
      @click.self="showWithdrawModal = false"
    >
      <div class="glass-card rounded-t-lg md:rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
        <div class="sticky top-0 glass-card-no-hover border-b border-white/10 p-3 flex justify-between items-center">
          <h2 class="text-base font-bold text-white">{{ t('common.withdraw') }}</h2>
          <button @click="showWithdrawModal = false" class="text-white/70 hover:text-white">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-3 space-y-3">
          <div>
            <label class="block text-xs text-white/70 mb-1.5">{{ t('assets.currency') }}</label>
            <CustomSelect
              v-model="withdrawCurrency"
              :options="getAllCoins().map(coin => ({ value: coin, label: coin }))"
            />
          </div>
          <div>
            <label class="block text-xs text-white/70 mb-1.5">{{ t('assets.amount') }}</label>
            <input
              v-model="withdrawAmount"
              type="number"
              step="0.00000001"
              class="w-full px-3 py-2 glass-input rounded-md focus:outline-none"
              :placeholder="t('assets.enterAmount')"
            />
          </div>
          <div>
            <label class="block text-xs text-white/70 mb-1.5">{{ t('assets.address') }}</label>
            <input
              v-model="withdrawAddress"
              type="text"
              class="w-full px-3 py-2 glass-input rounded-md focus:outline-none"
              :placeholder="t('assets.enterWalletAddress')"
            />
          </div>
          <button
            @click="handleWithdraw"
            :disabled="loading"
            class="w-full py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-md text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? t('common.processing') : t('common.withdraw') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Transfer Modal -->
    <div
      v-if="showTransferModal"
      class="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
      @click.self="showTransferModal = false"
    >
      <div class="glass-card rounded-t-lg md:rounded-lg w-full max-w-md animate-slide-up">
        <div class="sticky top-0 glass-card-no-hover border-b border-white/10 p-3 flex justify-between items-center">
          <h2 class="text-base font-bold text-white">{{ t('common.transfer') }}</h2>
          <button @click="showTransferModal = false" class="text-white/70 hover:text-white">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-3 space-y-3">
          <div>
            <label class="block text-xs text-white/70 mb-1.5">{{ t('common.from') }}</label>
            <CustomSelect
              v-model="transferFrom"
              :options="[
                { value: 'spot', label: t('assets.spotAccount') },
                { value: 'contract', label: t('assets.contractAccount') }
              ]"
            />
          </div>
          <div>
            <label class="block text-xs text-white/70 mb-1.5">{{ t('common.to') }}</label>
            <div class="px-3 py-2 glass-input rounded-md text-white/90">
              {{ transferTo === 'spot' ? t('assets.spotAccount') : t('assets.contractAccount') }}
            </div>
            <p class="text-xs text-white/50 mt-1">Automatically set based on source account</p>
          </div>
          <div>
            <label class="block text-xs text-white/70 mb-1.5">{{ t('assets.currency') }}</label>
            <CustomSelect
              v-model="transferCurrency"
              :options="getAllCoins().map(coin => ({ value: coin, label: coin }))"
            />
          </div>
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-xs text-white/70">{{ t('assets.amount') }}</label>
              <div class="flex items-center gap-2">
                <span class="text-xs text-white/50">
                  Available: <span class="text-white font-medium">{{ formatSpotBalance(availableTransferAmount) }} {{ transferCurrency }}</span>
                </span>
                <button
                  @click="setMaxTransfer"
                  class="px-2 py-0.5 text-xs glass-button rounded text-white hover:bg-white/20 transition-colors"
                >
                  Max
                </button>
              </div>
            </div>
            <input
              v-model="transferAmount"
              type="number"
              step="0.00000001"
              class="w-full px-3 py-2 glass-input rounded-md focus:outline-none"
              :placeholder="t('assets.enterAmount')"
            />
          </div>
          <button
            @click="handleTransfer"
            :disabled="loading"
            class="w-full py-2.5 glass-button rounded-md text-sm font-medium text-white hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? t('common.processing') : t('common.transfer') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, onActivated, computed, watch, h } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useI18n } from 'vue-i18n';
import { useAlert } from '../composables/useAlert';
import MobileNav from '../components/MobileNav.vue';
import DesktopNav from '../components/DesktopNav.vue';
import CustomSelect from '../components/CustomSelect.vue';
import depositIcon from '@/assets/dp-wd-tf-icons/deposit.png';
import withdrawIcon from '@/assets/dp-wd-tf-icons/withdraw.png';
import transferIcon from '@/assets/dp-wd-tf-icons/transfer.png';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import api from '../utils/api';
import { getAllCoins } from '../utils/coinLogos';

const { t } = useI18n();
const { showSuccess, showError, showWarning, showInfo } = useAlert();

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const isMobile = computed(() => window.innerWidth < 768);
const user = computed(() => authStore.user);

// Refresh user data to get latest credited_score
const refreshUser = async () => {
  try {
    await authStore.fetchCurrentUser();
  } catch (error) {
    console.error('Error refreshing user:', error);
  }
};

// Periodic refresh for credited_score (every 3 seconds while on Assets page)
let userRefreshInterval = null;

const wallets = ref([]);
const isLoading = ref(true);

// Spot account USDT balance (always >= 0)
const spotBalance = computed(() => {
  const spotWallet = wallets.value.find(w => w.currency === 'USDT' && w.account_type === 'spot');
  const balance = spotWallet ? parseFloat(spotWallet.balance || 0) : 0;
  return Math.max(0, balance); // Ensure never negative
});

// Contract account USDT balance (always >= 0)
const contractBalance = computed(() => {
  const contractWallet = wallets.value.find(w => w.currency === 'USDT' && w.account_type === 'contract');
  const balance = contractWallet ? parseFloat(contractWallet.balance || 0) : 0;
  return Math.max(0, balance); // Ensure never negative
});

// Total balance (spot + contract)
const totalBalance = computed(() => {
  return spotBalance.value + contractBalance.value;
});

// Available transfer amount based on source account
const availableTransferAmount = computed(() => {
  if (!transferFrom.value || !transferCurrency.value) {
    return 0;
  }
  
  // For USDT, use the computed spot/contract balances as fallback
  if (transferCurrency.value.toUpperCase() === 'USDT') {
    if (transferFrom.value === 'spot') {
      const balance = spotBalance.value;
      console.log('[Transfer] Using spot balance:', balance);
      return balance;
    } else if (transferFrom.value === 'contract') {
      const balance = contractBalance.value;
      console.log('[Transfer] Using contract balance:', balance);
      return balance;
    }
  }
  
  // For other currencies or if USDT lookup fails, find wallet
  const sourceWallet = wallets.value.find(
    w => {
      const walletCurrency = (w.currency || '').toUpperCase();
      const walletAccountType = (w.account_type || 'spot').toLowerCase();
      const targetCurrency = transferCurrency.value.toUpperCase();
      const targetAccountType = transferFrom.value.toLowerCase();
      
      return walletCurrency === targetCurrency && walletAccountType === targetAccountType;
    }
  );
  
  if (!sourceWallet) {
    return 0;
  }
  
  const balance = Math.max(0, parseFloat(sourceWallet.balance || 0));
  const locked = Math.max(0, parseFloat(sourceWallet.locked_balance || 0));
  const available = Math.max(0, balance - locked);
  
  return available;
});

const showWithdrawModal = ref(false);
const showTransferModal = ref(false);
const withdrawCurrency = ref('USDT');
const withdrawAmount = ref('');
const withdrawAddress = ref('');
const transferFrom = ref('spot');
const transferTo = ref('contract');
const transferCurrency = ref('USDT');
const transferAmount = ref('');
const loading = ref(false);

// Icon components
const FlashExchangeIcon = () => h('svg', {
  class: 'w-5 h-5',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M13 10V3L4 14h7v7l9-11h-7z'
  })
]);

const SpotAccountIcon = () => h('svg', {
  class: 'w-5 h-5',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'
  })
]);

const ContractAccountIcon = () => h('svg', {
  class: 'w-5 h-5',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  })
]);

const SecondAccountIcon = () => h('svg', {
  class: 'w-5 h-5',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  })
]);

const WithdrawalRecordIcon = () => h('svg', {
  class: 'w-5 h-5',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  })
]);

const NameVerificationIcon = () => h('svg', {
  class: 'w-5 h-5',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  })
]);

const SGRInviteIcon = () => h('svg', {
  class: 'w-5 h-5',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  })
]);

const AboutIcon = () => h('svg', {
  class: 'w-5 h-5',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  })
]);

const ComplaintIcon = () => h('svg', {
  class: 'w-5 h-5',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
  })
]);

const DownloadIcon = () => h('svg', {
  class: 'w-5 h-5',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
  })
]);

const PasswordIcon = () => h('svg', {
  class: 'w-5 h-5',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
  })
]);

const CustomerIcon = () => h('svg', {
  class: 'w-5 h-5',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z'
  })
]);

const LogoutIcon = () => h('svg', {
  class: 'w-5 h-5',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
  })
]);

const accountItems = computed(() => [
  { label: t('assets.flashExchange'), icon: FlashExchangeIcon, action: 'flash-exchange' },
  { label: t('assets.spotAccount'), icon: SpotAccountIcon, action: 'spot-account' },
  { label: t('assets.contractAccount'), icon: ContractAccountIcon, action: 'contract-account' },
  { label: t('assets.secondAccount'), icon: SecondAccountIcon, action: 'second-account' },
  { label: t('assets.withdrawalRecord'), icon: WithdrawalRecordIcon, action: 'withdrawal-record' },
]);

const settingsItems = computed(() => [
  { label: t('assets.nameVerification'), icon: NameVerificationIcon, action: 'name-verification' },
  { label: t('assets.sgrInvite'), icon: SGRInviteIcon, action: 'sgr-invite' },
  { label: t('assets.about'), icon: AboutIcon, action: 'about' },
  { label: t('assets.complaint'), icon: ComplaintIcon, action: 'complaint' },
  { label: t('assets.clientDownload'), icon: DownloadIcon, action: 'download' },
]);

const profileItems = computed(() => [
  { label: t('assets.changePassword'), icon: PasswordIcon, action: 'change-password' },
  { label: t('assets.customer'), icon: CustomerIcon, action: 'customer' },
  { label: t('common.logout'), icon: LogoutIcon, action: 'logout' },
]);

const formatBalance = (balance) => {
  if (!balance && balance !== 0) return '0.00000000';
  const num = Math.max(0, parseFloat(balance) || 0); // Ensure never negative
  if (num >= 1) return num.toFixed(2);
  if (num >= 0.01) return num.toFixed(4);
  return num.toFixed(8);
};

// Format spot account balance (always 2 decimals)
const formatSpotBalance = (balance) => {
  const num = Math.max(0, parseFloat(balance) || 0); // Ensure never negative
  return num.toFixed(2);
};

const handleAccountItemClick = (action) => {
  if (action === 'flash-exchange') {
    router.push('/flash-exchange');
  } else {
    console.log('Account item clicked:', action);
  }
};

const handleSettingsItemClick = (action) => {
  console.log('Settings item clicked:', action);
};

const handleProfileItemClick = (action) => {
  if (action === 'logout') {
    authStore.logout();
    router.push('/login');
  } else {
    console.log('Profile item clicked:', action);
  }
};

// Set max transfer amount
const setMaxTransfer = () => {
  transferAmount.value = formatSpotBalance(availableTransferAmount.value);
};

// Load wallets without showing loading state (for transfer modal)
const loadWalletsSilently = async () => {
  try {
    console.log('[Transfer] Loading wallets silently...');
    const response = await api.get('/wallet');
    wallets.value = (response.data.wallets || []).map(w => ({
      ...w,
      account_type: w.account_type || 'spot'
    }));
    
    // Ensure USDT wallets exist for both account types
    const spotUSDT = wallets.value.find(w => w.currency === 'USDT' && w.account_type === 'spot');
    const contractUSDT = wallets.value.find(w => w.currency === 'USDT' && w.account_type === 'contract');
    
    if (!spotUSDT) {
      try {
        const walletResponse = await api.get('/wallet/USDT?account_type=spot');
        if (walletResponse.data.wallet) {
          wallets.value.push(walletResponse.data.wallet);
        }
      } catch (err) {
        console.error('Error getting USDT spot wallet:', err);
      }
    }
    
    if (!contractUSDT) {
      try {
        const walletResponse = await api.get('/wallet/USDT?account_type=contract');
        if (walletResponse.data.wallet) {
          wallets.value.push(walletResponse.data.wallet);
        }
      } catch (err) {
        console.error('Error getting USDT contract wallet:', err);
      }
    }
    
    console.log('[Transfer] Wallets loaded silently:', wallets.value.length);
  } catch (error) {
    console.error('Error loading wallets silently:', error);
  }
};

// Open transfer modal and ensure wallets are loaded
const openTransferModal = async () => {
  console.log('[Transfer] Opening transfer modal...');
  
  // Reset to default: transfer from spot (which usually has balance) to contract
  transferFrom.value = 'spot';
  transferTo.value = 'contract';
  transferAmount.value = '';
  
  // Open modal immediately (don't wait for wallets)
  showTransferModal.value = true;
  
  // Load wallets in background without showing loading state
  if (wallets.value.length === 0) {
    loadWalletsSilently();
  }
};

// Auto-update "To" account when "From" account changes
watch(transferFrom, (newFrom) => {
  if (newFrom === 'spot') {
    transferTo.value = 'contract';
  } else if (newFrom === 'contract') {
    transferTo.value = 'spot';
  }
});


const loadWallets = async (retryCount = 0) => {
  isLoading.value = true;
  try {
    console.log('Loading wallets...', retryCount > 0 ? `(retry ${retryCount})` : '');
    // Load all wallets (both spot and contract accounts)
    const response = await api.get('/wallet');
    console.log('Wallets response:', response.data);
    wallets.value = (response.data.wallets || []).map(w => ({
      ...w,
      // Ensure account_type is set (default to 'spot' if missing for backward compatibility)
      account_type: w.account_type || 'spot'
    }));
    console.log('Processed wallets:', wallets.value.map(w => ({
      currency: w.currency,
      account_type: w.account_type,
      balance: w.balance
    })));
    
    // Ensure USDT wallets exist for both account types
    const spotUSDT = wallets.value.find(w => w.currency === 'USDT' && w.account_type === 'spot');
    const contractUSDT = wallets.value.find(w => w.currency === 'USDT' && w.account_type === 'contract');
    
    if (!spotUSDT) {
      try {
        console.log('USDT spot wallet not found, creating...');
        const walletResponse = await api.get('/wallet/USDT?account_type=spot');
        console.log('USDT spot wallet response:', walletResponse.data);
        if (walletResponse.data.wallet) {
          wallets.value.push(walletResponse.data.wallet);
        }
      } catch (err) {
        console.error('Error getting USDT spot wallet:', err);
      }
    }
    
    if (!contractUSDT) {
      try {
        console.log('USDT contract wallet not found, creating...');
        const walletResponse = await api.get('/wallet/USDT?account_type=contract');
        console.log('USDT contract wallet response:', walletResponse.data);
        if (walletResponse.data.wallet) {
          wallets.value.push(walletResponse.data.wallet);
        }
      } catch (err) {
        console.error('Error getting USDT contract wallet:', err);
      }
    }
  } catch (error) {
    console.error('Error loading wallets:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error message:', error.message);
    
    // Retry logic for network errors
    if (!error.response && retryCount < 3) {
      console.log(`Retrying wallet load in 2 seconds... (${retryCount + 1}/3)`);
      setTimeout(() => {
        loadWallets(retryCount + 1);
      }, 2000);
      return;
    }
    
    // Show user-friendly error
    if (error.response?.status === 401) {
      showWarning('Please login again');
      router.push('/login');
    } else if (error.response?.status >= 500) {
      // Server error - retry once more
      if (retryCount < 2) {
        setTimeout(() => {
          loadWallets(retryCount + 1);
        }, 3000);
        return;
      }
      console.error('Server error. Please try again later.');
    } else {
      console.error('Failed to load wallets. Please check your connection.');
    }
    // IMPORTANT: don't wipe wallets on transient errors (429 etc)
    // Keep last known wallets and let next success refresh.
  } finally {
    isLoading.value = false;
  }
};


const handleWithdraw = async () => {
  if (!withdrawAmount.value || parseFloat(withdrawAmount.value) <= 0) {
    showWarning('Please enter a valid amount');
    return;
  }
  if (!withdrawAddress.value) {
    showWarning('Please enter a wallet address');
    return;
  }
  
  // Check if user has sufficient balance
  const wallet = wallets.value.find(w => w.currency === withdrawCurrency.value);
  if (!wallet) {
    showError('Wallet not found');
    return;
  }
  
  const availableBalance = parseFloat(wallet.balance) - (parseFloat(wallet.locked_balance) || 0);
  if (availableBalance < parseFloat(withdrawAmount.value)) {
    showError('Insufficient balance');
    return;
  }
  
  loading.value = true;
  try {
    const response = await api.post('/wallet/withdraw', {
      currency: withdrawCurrency.value,
      amount: parseFloat(withdrawAmount.value),
      address: withdrawAddress.value,
    });
    showSuccess('Withdrawal successful');
    withdrawAmount.value = '';
    withdrawAddress.value = '';
    showWithdrawModal.value = false;
    // Reload wallets to get updated balance
    await loadWallets();
  } catch (error) {
    console.error('Withdraw error:', error);
    showError(error.response?.data?.error || 'Withdrawal failed');
  } finally {
    loading.value = false;
  }
};

const handleTransfer = async () => {
  if (!transferAmount.value || parseFloat(transferAmount.value) <= 0) {
    showWarning('Please enter a valid amount');
    return;
  }
  
  if (transferFrom.value === transferTo.value) {
    showWarning('Cannot transfer to the same account');
    return;
  }
  
  // Check source account balance - MUST exist and have balance > 0
  const sourceWallet = wallets.value.find(
    w => w.currency === transferCurrency.value.toUpperCase() && w.account_type === transferFrom.value
  );
  
  if (!sourceWallet) {
    showError(`Source ${transferFrom.value} account not found. Please ensure you have funds in this account.`);
    return;
  }
  
  const sourceBalance = Math.max(0, parseFloat(sourceWallet.balance || 0));
  const sourceLocked = Math.max(0, parseFloat(sourceWallet.locked_balance || 0));
  const availableBalance = Math.max(0, sourceBalance - sourceLocked);
  
  // Strict validation: balance must be > 0
  if (sourceBalance <= 0) {
    showError(`Cannot transfer. ${transferFrom.value} account balance is 0.`);
    return;
  }
  
  if (availableBalance <= 0) {
    showError(`Cannot transfer. Available balance in ${transferFrom.value} account is 0.`);
    return;
  }
  
  const transferAmountNum = parseFloat(transferAmount.value);
  
  if (transferAmountNum <= 0) {
    showWarning('Transfer amount must be greater than 0');
    return;
  }
  
  if (availableBalance < transferAmountNum) {
    showError(`Insufficient balance. Available: ${formatSpotBalance(availableBalance)} ${transferCurrency.value}`);
    return;
  }
  
  loading.value = true;
  try {
    await api.post('/wallet/transfer', {
      from: transferFrom.value,
      to: transferTo.value,
      currency: transferCurrency.value,
      amount: parseFloat(transferAmount.value)
    });
    
    showSuccess('Transfer successful!');
    transferAmount.value = '';
    showTransferModal.value = false;
    await loadWallets(); // Reload wallets to show updated balances
  } catch (error) {
    showError(error.response?.data?.error || 'Transfer failed');
  }
  loading.value = false;
};

let balanceInterval = null;

onMounted(async () => {
  // Fetch user first if not available
  if (!authStore.user) {
    await authStore.fetchCurrentUser();
  } else {
    // Refresh user to get latest credited_score
    await refreshUser();
  }
  // Then load wallets
  await loadWallets();
  
  // Refresh wallets every 30 seconds to keep balance updated
  balanceInterval = setInterval(() => {
    loadWallets();
  }, 30000);
  
  // Refresh user every 10 seconds - reduced from 3s to prevent browser overload
  userRefreshInterval = setInterval(() => {
    if (route.path === '/assets') {
      refreshUser();
    }
  }, 10000);
});

onActivated(async () => {
  // Refresh user when page is activated
  await refreshUser();
});

// Watch for changes in credited_score
watch(() => authStore.user?.credited_score, (newScore, oldScore) => {
  if (newScore !== oldScore && newScore !== undefined) {
    console.log('[Assets] Credited score updated:', oldScore, '->', newScore);
  }
}, { deep: true, immediate: true });

onUnmounted(() => {
  if (balanceInterval) {
    clearInterval(balanceInterval);
  }
  if (userRefreshInterval) {
    clearInterval(userRefreshInterval);
    userRefreshInterval = null;
  }
});
</script>