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
              <button @click="$router.back()" class="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 class="text-lg font-bold text-white">{{ t('deposit.title') }}</h1>
            </div>
            <button @click="showHistory = true" class="text-sm text-white/70 hover:text-white transition-colors">
              {{ t('deposit.history') }}
            </button>
          </div>
        </div>

        <div class="p-3 pb-4">
          <!-- Currency Selection -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-white font-medium">{{ selectedCurrency }}</span>
              <button
                @click="showCurrencySelector = true"
                class="flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors"
              >
                {{ t('deposit.selectCurrency') }}
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Network Selection (only for crypto) -->
          <div v-if="selectedCurrency !== 'BANK'" class="mb-4">
            <div class="flex gap-2">
              <button
                v-for="network in availableNetworks"
                :key="network"
                @click="selectedNetwork = network"
                :class="[
                  'flex-1 py-2 px-4 rounded-lg font-medium transition-colors',
                  selectedNetwork === network
                    ? 'bg-blue-500/30 text-blue-200 border border-blue-500/50'
                    : 'glass-input text-white/70 hover:bg-white/10'
                ]"
              >
                {{ network }}
              </button>
            </div>
          </div>

          <!-- QR Code and Address -->
          <div class="rounded-xl p-4 mb-3 text-center bg-white/5 border border-white/10 min-h-[230px] flex flex-col items-center justify-center">
            <!-- Loading state -->
            <div v-if="depositAddressLoading" class="flex flex-col items-center gap-3 w-full">
              <div class="w-32 h-32 rounded-lg bg-white/10 animate-pulse" />
              <div class="h-3 w-40 bg-white/10 rounded-full animate-pulse" />
              <div class="h-3 w-56 bg-white/10 rounded-full animate-pulse" />
            </div>

            <!-- Loaded state -->
            <template v-else-if="depositAddress">
              <div class="mb-4">
                <div class="inline-block p-3 bg-white rounded-lg relative">
                  <img :src="qrCodeUrl" alt="QR Code" class="w-40 h-40" />
                  <!-- Coin Logo Overlay -->
                  <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div class="w-10 h-10 bg-white rounded-full p-1.5 flex items-center justify-center shadow-lg">
                      <img :src="coinLogo" :alt="selectedCurrency" class="w-full h-full object-contain" />
                    </div>
                  </div>
                </div>
              </div>
              <div class="mb-2">
                <p class="text-white/70 text-xs mb-1.5">{{ t('deposit.depositAddress') }}</p>
                <div class="flex items-center gap-2 justify-center">
                  <p class="text-white font-mono text-xs break-all">{{ depositAddress }}</p>
                  <button
                    @click="copyAddress"
                    class="px-3 py-1 bg-blue-500/30 text-blue-200 rounded-lg text-xs transition-colors"
                  >
                    {{ t('deposit.copy') }}
                  </button>
                </div>
              </div>
            </template>

            <!-- No address state -->
            <p v-else class="text-xs text-white/60">
              {{ t('deposit.noAddressAvailable') || 'Deposit address not available for this currency/network.' }}
            </p>
          </div>

          <!-- Deposit Form -->
          <div class="rounded-xl p-3 space-y-3 bg-white/5 border border-white/10">
            <div>
              <label class="block text-xs text-white/70 mb-1.5">{{ t('deposit.rechargeQuantity') }}</label>
              <div class="flex items-center gap-2">
                <input
                  v-model="depositAmount"
                  type="number"
                  step="0.00000001"
                  class="flex-1 px-3 py-2 glass-input rounded-lg focus:outline-none text-sm"
                  placeholder="0.00"
                />
                <span class="text-white/70 text-xs">{{ selectedCurrency }}</span>
              </div>
            </div>

            <div>
              <label class="block text-xs text-white/70 mb-1.5">{{ t('deposit.transferScreenshot') }}</label>
              <input
                type="file"
                accept="image/*"
                @change="handleFileSelect"
                class="hidden"
                ref="fileInput"
              />
              <input
                type="text"
                :value="screenshotFile ? screenshotFile.name : 'Select Picture'"
                readonly
                @click="fileInput?.click()"
                class="w-full px-3 py-2 glass-input rounded-lg focus:outline-none cursor-pointer text-sm"
                placeholder="Select Picture"
              />
              <div v-if="screenshotPreview" class="mt-2">
                <img :src="screenshotPreview" alt="Preview" class="w-full h-24 object-cover rounded-lg" />
              </div>
            </div>

            <button
              @click="handleSubmit"
              :disabled="loading || !depositAmount || (selectedCurrency !== 'BANK' && !screenshotFile)"
              class="w-full py-2.5 bg-blue-500/40 border border-blue-500/60 rounded-lg font-medium text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? t('common.processing') : t('deposit.submitButton') }}
            </button>

            <p class="text-[11px] text-white/60 text-center leading-snug">
              {{ t('deposit.waitForReview') }}
            </p>
          </div>
        </div>
      </main>
    </div>

    <!-- Currency Selector Modal -->
    <div
      v-if="showCurrencySelector"
      class="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
      @click.self="showCurrencySelector = false"
    >
      <div class="glass-card rounded-t-xl md:rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto animate-slide-up">
        <div class="sticky top-0 glass-card-no-hover border-b border-white/10 p-4 flex justify-between items-center">
          <h2 class="text-lg font-bold text-white">{{ t('deposit.selectCurrency') }}</h2>
          <button @click="showCurrencySelector = false" class="text-white/70 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-2">
          <button
            v-for="currency in currencies"
            :key="currency.value"
            @click="selectCurrency(currency.value)"
            class="w-full flex items-center justify-between p-4 border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors"
          >
            <span class="text-white font-medium">{{ currency.label }}</span>
            <svg
              v-if="selectedCurrency === currency.value"
              class="w-5 h-5 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- History Modal -->
    <div
      v-if="showHistory"
      class="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
      @click.self="showHistory = false"
    >
      <div class="glass-card rounded-t-xl md:rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto animate-slide-up">
        <div class="sticky top-0 glass-card-no-hover border-b border-white/10 p-4 flex justify-between items-center">
          <h2 class="text-lg font-bold text-white">Recharge record</h2>
          <button @click="showHistory = false" class="text-white/70 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-4">
          <div
            v-for="deposit in depositHistory"
            :key="deposit.id"
            class="p-4 border-b border-white/10 last:border-b-0"
          >
            <div class="flex justify-between items-start mb-2">
              <div>
                <div class="text-white font-medium">{{ deposit.currency }} - {{ formatBalance(deposit.amount) }}</div>
                <div class="text-white/60 text-sm">{{ formatDate(deposit.created_at) }}</div>
              </div>
              <span
                :class="[
                  'px-2 py-1 rounded text-xs',
                  deposit.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                  deposit.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                  'bg-yellow-500/20 text-yellow-300'
                ]"
              >
                {{ deposit.status }}
              </span>
            </div>
          </div>
          <div v-if="depositHistory.length === 0" class="text-center text-white/60 py-8">
            {{ t('deposit.noRecords') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import MobileNav from '../components/MobileNav.vue';
import DesktopNav from '../components/DesktopNav.vue';
import api from '../utils/api';

const { t } = useI18n();

const route = useRoute();
const isMobile = computed(() => window.innerWidth < 768);

const selectedCurrency = ref(route.query.currency || 'USDT');
const selectedNetwork = ref('TRC20');
const depositAmount = ref('');
const screenshotFile = ref(null);
const screenshotPreview = ref(null);
const depositAddress = ref('');
const qrCodeUrl = ref('');
const depositAddressLoading = ref(false);
const loading = ref(false);
const showCurrencySelector = ref(false);
const showHistory = ref(false);
const depositHistory = ref([]);
const fileInput = ref(null);

const currencies = [
  { value: 'BTC', label: 'BTC' },
  { value: 'USDT', label: 'USDT' },
  { value: 'ETH', label: 'ETH' },
  { value: 'BANK', label: 'P2P Bank transfer' },
];

const availableNetworks = computed(() => {
  if (selectedCurrency.value === 'USDT') {
    return ['TRC20', 'ERC20'];
  } else if (selectedCurrency.value === 'ETH') {
    return ['ERC20'];
  } else if (selectedCurrency.value === 'BTC') {
    return ['BTC'];
  }
  return [];
});

// Get coin logo based on currency and network
const coinLogo = computed(() => {
  if (selectedCurrency.value === 'USDT') {
    if (selectedNetwork.value === 'TRC20') {
      return new URL('../assets/coins/USDT-TRC20.png', import.meta.url).href;
    } else if (selectedNetwork.value === 'ERC20') {
      return new URL('../assets/coins/USDT-ERC20.png', import.meta.url).href;
    }
  } else if (selectedCurrency.value === 'BTC') {
    return new URL('../assets/coins/BTC.png', import.meta.url).href;
  } else if (selectedCurrency.value === 'ETH') {
    return new URL('../assets/coins/ETH.png', import.meta.url).href;
  }
  // Default fallback
  return new URL('../assets/coins/USDT-TRC20.png', import.meta.url).href;
});

const formatBalance = (balance) => {
  const num = parseFloat(balance);
  if (num >= 1) return num.toFixed(2);
  if (num >= 0.01) return num.toFixed(4);
  return num.toFixed(8);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
};

const selectCurrency = (currency) => {
  selectedCurrency.value = currency;
  showCurrencySelector.value = false;
  loadDepositAddress();
};

const loadDepositAddress = async () => {
  if (selectedCurrency.value === 'BANK') {
    depositAddress.value = '';
    qrCodeUrl.value = '';
    return;
  }

  depositAddressLoading.value = true;
  depositAddress.value = '';
  qrCodeUrl.value = '';

  try {
    console.log('Loading deposit address for:', selectedCurrency.value, selectedNetwork.value);
    
    const response = await api.get('/deposit/addresses', {
      params: {
        currency: selectedCurrency.value,
        network: selectedNetwork.value,
      },
    });
    
    console.log('Deposit address response:', response.data);
    
    const addresses = response.data.addresses || [];
    console.log('Found addresses:', addresses.length, addresses);
    
    const activeAddress = addresses.find(addr => addr.is_active !== false) || addresses[0];
    
    if (activeAddress && activeAddress.address) {
      depositAddress.value = activeAddress.address;
      // Generate QR code using a simple API or placeholder
      qrCodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(depositAddress.value)}`;
      console.log('Set deposit address:', depositAddress.value.substring(0, 20) + '...');
    } else {
      console.warn('No valid address found. Addresses array:', addresses);
      depositAddress.value = '';
      qrCodeUrl.value = '';
    }
  } catch (error) {
    console.error('Error loading deposit address:', error);
    console.error('Currency:', selectedCurrency.value, 'Network:', selectedNetwork.value);
    console.error('Error response:', error.response?.data);
    console.error('Full error:', error);
    
    // Show user-friendly error
    if (error.response?.status === 404 || (error.response?.data?.addresses?.length === 0)) {
      console.warn(`No deposit address found for ${selectedCurrency.value} ${selectedNetwork.value}. Please contact admin.`);
    }
    
    depositAddress.value = '';
    qrCodeUrl.value = '';
  } finally {
    depositAddressLoading.value = false;
  }
};

const copyAddress = async () => {
  if (depositAddress.value) {
    try {
      await navigator.clipboard.writeText(depositAddress.value);
      alert('Address copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    screenshotFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      screenshotPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const loadDepositHistory = async () => {
  try {
    console.log('Loading deposit history...');
    const response = await api.get('/deposit/requests');
    console.log('Deposit history response:', response.data);
    depositHistory.value = response.data.deposits || response.data || [];
  } catch (error) {
    console.error('Error loading deposit history:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error message:', error.message);
    if (error.response?.status === 401) {
      alert('Please login again');
    } else {
      console.error('Failed to load deposit history');
    }
    depositHistory.value = [];
  }
};

const handleSubmit = async () => {
  if (!depositAmount.value || parseFloat(depositAmount.value) <= 0) {
    alert('Please enter a valid amount');
    return;
  }
  
  if (selectedCurrency.value !== 'BANK' && !screenshotFile.value) {
    alert('Screenshot is required for crypto deposits');
    return;
  }
  
  loading.value = true;
  try {
    const formData = new FormData();
    formData.append('currency', selectedCurrency.value === 'BANK' ? 'USDT' : selectedCurrency.value);
    formData.append('amount', depositAmount.value);
    formData.append('deposit_type', selectedCurrency.value === 'BANK' ? 'bank' : 'crypto');
    if (selectedCurrency.value !== 'BANK' && selectedNetwork.value) {
      formData.append('network', selectedNetwork.value);
    }
    if (screenshotFile.value) {
      formData.append('screenshot', screenshotFile.value);
    }
    
    await api.post('/deposit/request', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    alert('Deposit request submitted successfully! Waiting for admin approval.');
    depositAmount.value = '';
    screenshotFile.value = null;
    screenshotPreview.value = null;
    loadDepositHistory();
  } catch (error) {
    alert(error.response?.data?.error || 'Deposit request failed');
  }
  loading.value = false;
};

// Watch for network changes
watch(selectedNetwork, () => {
  loadDepositAddress();
});

// Watch for currency changes
watch(selectedCurrency, () => {
  if (selectedCurrency.value !== 'BANK' && availableNetworks.value.length > 0) {
    selectedNetwork.value = availableNetworks.value[0];
  }
  loadDepositAddress();
});

onMounted(() => {
  loadDepositAddress();
  loadDepositHistory();
});
</script>