<template>
  <div class="min-h-screen">
    <MobileNav v-if="isMobile" />
    <div class="md:flex">
      <DesktopNav v-if="!isMobile" />
      <main class="flex-1 pb-16 md:pb-0">
        <!-- Header -->
        <div class="px-3 py-2 border-b border-white/10">
          <!-- Top: Contracts title -->
          <div class="mb-2">
            <h1 class="text-base font-bold text-white">{{ t('contracts.title') }}</h1>
          </div>
          
          <!-- Bottom: Settings icon, Trading pair, Chart icon -->
          <div class="flex items-center gap-3 py-2">
            <button
              @click="showCoinSelector = true"
              class="p-1.5 hover:opacity-80 transition-opacity"
            >
              <svg class="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <span class="flex-1 text-center text-white font-semibold text-base">{{ selectedSymbol }}</span>
            <button
              @click="$router.push({ path: '/kline', query: { symbol: selectedSymbol } })"
              class="p-1.5 hover:opacity-80 transition-opacity"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <!-- Left green candlestick -->
                <rect x="2" y="14" width="4" height="6" fill="#10B981" />
                <line x1="4" y1="12" x2="4" y2="14" stroke="#10B981" stroke-width="1.5" stroke-linecap="round" />
                <line x1="4" y1="20" x2="4" y2="22" stroke="#10B981" stroke-width="1.5" stroke-linecap="round" />
                
                <!-- Middle red candlestick -->
                <rect x="9" y="10" width="4" height="10" fill="#EF4444" />
                <line x1="11" y1="8" x2="11" y2="10" stroke="#EF4444" stroke-width="1.5" stroke-linecap="round" />
                <line x1="11" y1="20" x2="11" y2="22" stroke="#EF4444" stroke-width="1.5" stroke-linecap="round" />
                
                <!-- Right green candlestick -->
                <rect x="16" y="14" width="4" height="6" fill="#10B981" />
                <line x1="18" y1="12" x2="18" y2="14" stroke="#10B981" stroke-width="1.5" stroke-linecap="round" />
                <line x1="18" y1="20" x2="18" y2="22" stroke="#10B981" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div class="p-2 md:p-4">
          <!-- Loading Skeleton -->
          <div v-if="isLoading" class="flex flex-row gap-2 md:gap-3 items-stretch">
            <!-- Left Skeleton -->
            <div class="flex-1 min-w-0 max-w-[50%] flex flex-col gap-3">
              <SkeletonLoader type="button" />
              <SkeletonLoader type="input" />
              <SkeletonLoader type="input" />
              <SkeletonLoader type="input" />
              <SkeletonLoader type="button" />
            </div>
            <!-- Right Skeleton -->
            <div class="flex-1 min-w-0 max-w-[50%] flex flex-col gap-3">
              <SkeletonLoader type="button" />
              <SkeletonLoader type="order-book" :rows="6" />
              <div class="h-px bg-white/10 my-1"></div>
              <SkeletonLoader type="order-book" :rows="6" />
            </div>
          </div>
          
          <!-- Actual Content -->
          <div v-else class="flex flex-row gap-2 md:gap-3 items-stretch">
            <!-- Left: Trading Panel -->
            <div class="flex-1 min-w-0 max-w-[50%] flex flex-col h-full">
              <!-- UP/FALL Tabs and Price on same line -->
              <div class="flex gap-2 mb-3 items-center">
                <button
                  @click="orderSide = 'buy'"
                  :class="[
                    'flex-1 py-2 rounded-lg font-medium transition-colors',
                    orderSide === 'buy'
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  ]"
                >
                  {{ t('contracts.up') }}
                </button>
                <button
                  @click="orderSide = 'sell'"
                  :class="[
                    'flex-1 py-2 rounded-lg font-medium transition-colors',
                    orderSide === 'sell'
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  ]"
                >
                  {{ t('contracts.fall') }}
                </button>
              </div>
              <!-- Transaction Mode -->
              <div class="mb-2">
                <label class="block text-xs text-white/70 mb-1">{{ t('contracts.transactionMode') }}</label>
                <CustomSelect
                  v-model="transactionMode"
                  :options="[
                    { value: 'USDT', label: 'USDT' },
                    { value: 'COIN', label: 'COIN' }
                  ]"
                />
              </div>

              <!-- Opening Quantity -->
              <div class="mb-2">
                <label class="block text-xs text-white/70 mb-1">Opening quantity</label>
                <div class="flex items-center gap-1.5">
                  <input
                    v-model="openingQuantity"
                    type="number"
                    step="0.00000001"
                    placeholder="0.00"
                    class="flex-1 min-w-0 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50 text-sm text-white"
                  />
                  <span class="text-white/70 text-xs whitespace-nowrap flex-shrink-0">USDT</span>
                </div>
              </div>

              <!-- Open Time -->
              <div class="mb-2">
                <label class="block text-xs text-white/70 mb-1">Open time</label>
                <CustomSelect
                  v-model="openTime"
                  :options="[
                    { value: '30', label: '30 sec' },
                    { value: '60', label: '60 sec' },
                    { value: '120', label: '120 sec' },
                    { value: '180', label: '180 sec' },
                    { value: '240', label: '240 sec' },
                    { value: '300', label: '300 sec' }
                  ]"
                />
              </div>

              <!-- Info -->
              <div class="mb-3 space-y-0.5">
                <div class="flex justify-between text-xs">
                  <span class="text-white/70">Profit rate</span>
                  <span class="text-white truncate ml-2">{{ tradeConfig[openTime]?.profitRate || 10 }}%</span>
                </div>
                <div class="flex justify-between text-xs">
                  <span class="text-white/70">{{ t('contracts.minimumAmount') }}</span>
                  <span class="text-white truncate ml-2">{{ tradeConfig[openTime]?.minAmount || 100 }}.00 USDT</span>
                </div>
                <div class="flex justify-between text-xs">
                  <span class="text-white/70">Usable</span>
                  <span class="text-white truncate ml-2">{{ formatPrice(walletBalance) }} USDT</span>
                </div>
              </div>

              <!-- Place Order Button -->
              <button
                @click="placeOrder"
                :disabled="loading || !openingQuantity || parseFloat(openingQuantity) <= 0"
                :class="[
                  'w-full py-2.5 rounded-lg font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm',
                  orderSide === 'buy'
                    ? 'bg-green-500 hover:bg-green-600 active:bg-green-700'
                    : 'bg-red-500 hover:bg-red-600 active:bg-red-700'
                ]"
              >
                {{ loading ? t('common.processing') : `${orderSide === 'buy' ? t('contracts.up') : t('contracts.fall')} ${selectedSymbol.split('/')[0]}` }}
              </button>
            </div>

            <!-- Right: Order Book -->
            <div class="flex-1 min-w-0 max-w-[50%] flex flex-col h-full">
              <!-- Price aligned with UP/FALL tabs -->
              <div class="flex gap-2 mb-3 items-center">
                <div class="flex-1"></div>
                <div class="flex-1 text-center">
                  <div class="text-sm md:text-base font-bold text-blue-400 truncate">{{ formatPrice(ticker?.price || 0) }} USDT</div>
                </div>
                <div class="flex-1"></div>
              </div>
              
              <!-- Sell Orders (Asks) -->
              <div class="mb-2">
                <div class="flex justify-between text-xs text-white/60 mb-1">
                  <span>{{ t('contracts.price') }}</span>
                  <span>{{ t('contracts.quantity') }}</span>
                </div>
                <div class="space-y-0 max-h-32 md:max-h-48 overflow-y-auto">
                  <div
                    v-for="(ask, index) in orderBook.asks.slice(0, 6).reverse()"
                    :key="`ask-${index}`"
                    class="relative flex justify-between items-center text-xs cursor-pointer hover:bg-white/5 py-0.5 px-1"
                    @click="selectOrderBookPrice(ask.price)"
                  >
                    <!-- Volume bar background -->
                    <div 
                      class="absolute left-0 top-0 bottom-0 bg-red-500/10 transition-all"
                      :style="{ width: `${getVolumePercent(ask.quantity, 'ask')}%` }"
                    ></div>
                    <span class="relative z-10 text-red-400 font-medium text-xs truncate">{{ formatPrice(ask.price) }}</span>
                    <span class="relative z-10 text-white/70 text-xs truncate">{{ formatQuantity(ask.quantity) }}</span>
                  </div>
                </div>
              </div>

              <!-- Current Price Separator -->
              <div class="border-t border-b border-white/10 py-1.5 my-1 text-center">
                <div class="text-xs font-bold text-blue-400 truncate">{{ formatPrice(ticker?.price || 0) }} USDT</div>
              </div>

              <!-- Buy Orders (Bids) -->
              <div>
                <div class="space-y-0 max-h-32 md:max-h-48 overflow-y-auto">
                  <div
                    v-for="(bid, index) in orderBook.bids.slice(0, 6)"
                    :key="`bid-${index}`"
                    class="relative flex justify-between items-center text-xs cursor-pointer hover:bg-white/5 py-0.5 px-1"
                    @click="selectOrderBookPrice(bid.price)"
                  >
                    <!-- Volume bar background -->
                    <div 
                      class="absolute left-0 top-0 bottom-0 bg-blue-500/10 transition-all"
                      :style="{ width: `${getVolumePercent(bid.quantity, 'bid')}%` }"
                    ></div>
                    <span class="relative z-10 text-blue-400 font-medium text-xs truncate">{{ formatPrice(bid.price) }}</span>
                    <span class="relative z-10 text-white/70 text-xs truncate">{{ formatQuantity(bid.quantity) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Active Trade Modal -->
          <Teleport to="body">
            <div
              v-if="currentActiveTrade && showActiveTradeModal"
              class="fixed inset-0 z-[9999] flex items-center justify-center p-3"
              style="z-index: 9999 !important;"
            >
              <!-- Backdrop -->
              <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showActiveTradeModal = false"></div>
              
              <!-- Modal Content - compact, clean UI -->
              <div class="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-2xl w-full max-w-sm shadow-2xl z-[10000] border border-white/10 overflow-hidden" @click.stop>
              <!-- Header -->
              <div class="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-slate-900/80">
                <button
                  @click="showActiveTradeModal = false"
                  class="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <h2 class="text-sm font-semibold tracking-wide text-white">
                  {{ currentActiveTrade?.symbol || selectedSymbol }}
                </h2>
                <button
                  @click="showActiveTradeModal = false"
                  class="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <!-- Countdown Circle or Result -->
              <!-- Keep a fixed visual height for all states (counting / analyzing / completed) -->
              <div class="flex flex-col items-center justify-center py-10 px-6 min-h-[280px]">
                <!-- Show countdown if > 0 (always count to the end, ignore admin status) -->
                <div
                  v-if="(countdowns[currentActiveTrade?.id] || 0) > 0"
                  class="relative w-28 h-28 mb-5"
                >
                  <!-- Circle Background -->
                  <svg class="w-28 h-28 transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      stroke-width="8"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="#3B82F6"
                      stroke-width="8"
                      stroke-dasharray="339.292"
                      :stroke-dashoffset="339.292 - (339.292 * (countdowns[currentActiveTrade?.id] || 0) / (currentActiveTrade?.duration || 30))"
                      stroke-linecap="round"
                      class="transition-all duration-1000"
                    />
                  </svg>
                  <!-- Countdown Number -->
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="text-center">
                      <div class="text-4xl font-semibold text-white">{{ countdowns[currentActiveTrade?.id] || 0 }}</div>
                    </div>
                  </div>
                </div>
                
                <!-- Show Analyzing when countdown reaches 0 and no final result yet -->
                <div
                  v-else-if="(countdowns[currentActiveTrade?.id] || 0) <= 0 && !currentActiveTrade?.result"
                  class="text-center mb-5"
                >
                  <div class="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <div class="text-center">
                      <svg class="w-10 h-10 text-blue-400 mx-auto mb-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <div class="text-sm font-medium text-blue-400">Analyzing trading data...</div>
                    </div>
                  </div>
                </div>
                
                <!-- Show Win/Lose Result only after countdown finished AND result exists -->
                <div
                  v-else-if="currentActiveTrade?.result"
                  class="text-center mb-5"
                >
                  <div class="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <div class="text-center">
                      <!-- Win Icon -->
                      <div
                        v-if="currentActiveTrade.result === 'win'"
                        class="w-20 h-20 mx-auto mb-2 rounded-full bg-green-500/15 flex items-center justify-center"
                      >
                        <svg class="w-10 h-10 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                      </div>
                      <!-- Lose Icon -->
                      <div
                        v-else-if="currentActiveTrade.result === 'lose'"
                        class="w-20 h-20 mx-auto mb-2 rounded-full bg-red-500/15 flex items-center justify-center"
                      >
                        <svg class="w-10 h-10 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        </svg>
                      </div>
                      <div
                        class="text-xl font-bold tracking-wide"
                        :class="{
                        'text-green-400': currentActiveTrade.result === 'win',
                        'text-red-400': currentActiveTrade.result === 'lose'
                      }">
                        {{ currentActiveTrade.result.toUpperCase() }}
                      </div>
                      <!-- Profit amount -->
                      <div
                        class="text-lg font-semibold mt-2 whitespace-nowrap"
                        :class="{
                          'text-green-400': parseFloat(currentActiveTrade.profit_loss || 0) > 0,
                          'text-red-400': parseFloat(currentActiveTrade.profit_loss || 0) < 0
                        }"
                      >
                        {{ parseFloat(currentActiveTrade.profit_loss || 0) > 0 ? '+' : '' }}{{ parseFloat(currentActiveTrade.profit_loss || 0).toFixed(2) }} USDT
                      </div>
                      <!-- Now price line for completed trade -->
                      <div class="mt-1 text-xs text-white/60 whitespace-nowrap">
                        Now price - 
                        <span class="text-base font-semibold text-blue-400">
                          {{ formatPrice(ticker?.price || currentActiveTrade?.entry_price || 0) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Now Price (only while countdown running or analyzing) -->
                <div v-if="(countdowns[currentActiveTrade?.id] || 0) > 0 && !currentActiveTrade?.result" class="text-center mb-7">
                  <div class="text-xs text-white/50 mb-0.5">Now price</div>
                  <div class="text-lg font-semibold text-blue-400">
                    {{ formatPrice(ticker?.price || currentActiveTrade?.entry_price || 0) }}
                  </div>
                </div>
                
                <!-- Trade Details -->
                <div class="w-full space-y-0 px-5 pb-2">
                  <div class="flex justify-between items-center py-3 border-b border-white/5">
                    <span class="text-sm text-white/60">Direction:</span>
                    <span :class="[
                      'text-sm font-semibold',
                      currentActiveTrade?.side === 'buy' ? 'text-green-400' : 'text-red-400'
                    ]">
                      {{ currentActiveTrade?.side === 'buy' ? t('contracts.up') : t('contracts.fall') }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center py-3 border-b border-white/5">
                    <span class="text-sm text-white/60">Opening quantity:</span>
                    <span class="text-sm font-medium text-white">{{ parseFloat(currentActiveTrade?.amount || 0).toFixed(2) }} USDT</span>
                  </div>
                  <div class="flex justify-between items-center py-3 border-b border-white/5">
                    <span class="text-sm text-white/60">Purchase price:</span>
                    <span class="text-sm font-medium text-white">{{ formatPrice(currentActiveTrade?.entry_price || 0) }}</span>
                  </div>
                  <div class="flex justify-between items-center py-3">
                    <span class="text-sm text-white/60">
                      {{ currentActiveTrade?.status === 'completed' ? 'Profit and loss:' : 'Estimated profit and loss:' }}
                    </span>
                    <span :class="[
                      'text-sm font-semibold',
                      currentActiveTrade?.status === 'completed' 
                        ? (parseFloat(currentActiveTrade.profit_loss || 0) >= 0 ? 'text-green-400' : 'text-red-400')
                        : (estimatedPL >= 0 ? 'text-green-400' : 'text-red-400')
                    ]">
                      {{ currentActiveTrade?.status === 'completed' 
                        ? (parseFloat(currentActiveTrade.profit_loss || 0) > 0 ? '+' : '') + parseFloat(currentActiveTrade.profit_loss || 0).toFixed(2) + ' USDT'
                        : (estimatedPL >= 0 ? '+' : '') + estimatedPL.toFixed(2) + ' USDT'
                      }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- OK/Back Button -->
              <div class="px-4 pb-4 pt-2">
                <button
                  @click="showActiveTradeModal = false"
                  :class="[
                    'w-full py-3.5 text-white rounded-xl text-sm font-semibold transition-all shadow-lg',
                    currentActiveTrade?.status === 'completed'
                      ? 'bg-green-500/90 hover:bg-green-500 hover:shadow-green-500/50'
                      : 'bg-blue-500/90 hover:bg-blue-500 hover:shadow-blue-500/50'
                  ]"
                >
                  {{ currentActiveTrade?.status === 'completed' ? 'OK' : 'Back' }}
                </button>
              </div>
              </div>
            </div>
          </Teleport>

          <!-- Transaction History Tabs -->
          <div class="mt-3">
            <div class="flex gap-2 mb-4 border-b border-white/10">
              <button
                @click="activeTab = 'transaction'"
                :class="[
                  'px-4 py-2 text-sm font-medium transition-all relative',
                  activeTab === 'transaction'
                    ? 'text-green-400'
                    : 'text-gray-400'
                ]"
              >
                Current
                <span
                  v-if="activeTab === 'transaction'"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400"
                ></span>
              </button>
              <button
                @click="activeTab = 'closed'"
                :class="[
                  'px-4 py-2 text-sm font-medium transition-all relative',
                  activeTab === 'closed'
                    ? 'text-green-400'
                    : 'text-gray-400'
                ]"
              >
                History
                <span
                  v-if="activeTab === 'closed'"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400"
                ></span>
              </button>
            </div>
            <!-- Active Trades (Transaction History) -->
            <div v-if="activeTab === 'transaction'">
              <div v-if="activeTrades.length === 0" class="text-center py-12">
                <svg class="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p class="text-gray-400">{{ t('contracts.noHistory') }}</p>
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="trade in activeTrades"
                  :key="trade.id"
                  @click="currentActiveTrade = trade; showActiveTradeModal = true"
                  class="bg-white/5 rounded-lg p-3 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <div class="flex justify-between items-start mb-2">
                    <div>
                      <div class="flex items-center gap-2 mb-1">
                        <span :class="[
                          'text-sm font-bold',
                          trade.side === 'buy' ? 'text-green-400' : 'text-red-400'
                        ]">
                          {{ trade.side === 'buy' ? t('contracts.up') : t('contracts.fall') }}
                        </span>
                        <span class="text-white/70 text-xs">{{ trade.symbol }}</span>
                      </div>
                      <div class="text-xs text-white/60">
                        {{ parseFloat(trade.amount).toFixed(2) }} USDT • {{ trade.duration }}s • {{ trade.profit_rate }}%
                      </div>
                    </div>
                    <div class="text-right">
                      <div v-if="(countdowns[trade.id] || 0) > 0" class="text-lg font-bold text-green-400">
                        {{ formatCountdown(countdowns[trade.id] || 0) }}
                      </div>
                      <div v-else class="text-sm text-blue-400 flex items-center justify-end gap-1">
                        <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Analyzing trading data...
                      </div>
                      <div class="text-xs text-white/60 mt-1">Entry: {{ formatPrice(trade.entry_price) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Closed Trades -->
            <div v-else>
              <div v-if="closedTrades.length === 0" class="text-center py-12">
                <svg class="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p class="text-gray-400">{{ t('contracts.noHistory') }}</p>
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="trade in closedTrades"
                  :key="trade.id"
                  class="bg-white/5 rounded-lg p-3 border border-white/10"
                >
                  <div class="flex justify-between items-start mb-2">
                    <div>
                      <div class="flex items-center gap-2 mb-1">
                        <span :class="[
                          'text-sm font-bold',
                          trade.side === 'buy' ? 'text-green-400' : 'text-red-400'
                        ]">
                          {{ trade.side === 'buy' ? t('contracts.up') : t('contracts.fall') }}
                        </span>
                        <span class="text-white/70 text-xs">{{ trade.symbol }}</span>
                        <span v-if="trade.result === 'win'" class="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                          WIN
                        </span>
                        <span v-else-if="trade.result === 'lose'" class="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          </svg>
                          LOSE
                        </span>
                      </div>
                      <div class="text-xs text-white/60">
                        {{ parseFloat(trade.amount).toFixed(2) }} USDT • {{ trade.duration }}s • {{ trade.profit_rate }}%
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-lg font-bold" :class="{
                        'text-green-400': parseFloat(trade.profit_loss) > 0,
                        'text-red-400': parseFloat(trade.profit_loss) < 0,
                        'text-white/60': parseFloat(trade.profit_loss) === 0
                      }">
                        {{ parseFloat(trade.profit_loss) > 0 ? '+' : '' }}{{ parseFloat(trade.profit_loss).toFixed(2) }} USDT
                      </div>
                      <div class="text-xs text-white/60">{{ formatDate(trade.created_at) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Coin Selector Modal -->
    <div
      v-if="showCoinSelector"
      class="fixed inset-0 z-50 flex items-end md:items-center md:justify-center"
      @click.self="showCoinSelector = false"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showCoinSelector = false"></div>
      
      <!-- Modal Content -->
      <div
        class="relative glass-card w-full md:w-96 md:max-w-md rounded-b-2xl md:rounded-b-2xl shadow-2xl max-h-[80vh] flex flex-col animate-slide-up"
      >
        <!-- Header -->
        <div class="sticky top-0 glass-card-no-hover border-b border-white/10 px-4 py-4 z-10">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-white">USDT</h2>
            <button
              @click="showCoinSelector = false"
              class="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <svg class="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Coin List -->
        <div class="flex-1 overflow-y-auto">
          <div
            v-for="coin in coinList"
            :key="coin.symbol"
            @click="selectCoin(coin.symbol)"
            class="flex items-center justify-between px-4 py-3 hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer border-b border-white/10"
          >
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <img
                :src="getCoinLogo(coin.symbol)"
                :alt="coin.symbol"
                class="w-8 h-8 rounded-full flex-shrink-0"
                @error="handleImageError"
              />
              <span class="text-white font-medium">{{ coin.symbol.split('/')[0] }}</span>
            </div>
            <div class="flex items-center gap-4 flex-shrink-0">
              <span
                :class="[
                  'text-sm font-medium',
                  coin.change >= 0 ? 'text-green-400' : 'text-red-400'
                ]"
              >
                {{ coin.change >= 0 ? '+' : '' }}{{ coin.change.toFixed(2) }}%
              </span>
              <span class="text-white font-medium text-sm min-w-[80px] text-right">
                {{ formatPrice(coin.price) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import MobileNav from '../components/MobileNav.vue';
import DesktopNav from '../components/DesktopNav.vue';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import api from '../utils/api';
import { getCoinLogoUrl } from '../utils/coinLogos';
import CustomSelect from '../components/CustomSelect.vue';
import axios from 'axios';

const BINANCE_HTTP_API = 'https://api.binance.com/api/v3';
const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws/!ticker@arr';

const { t } = useI18n();

const route = useRoute();
const isMobile = computed(() => window.innerWidth < 768);

// Get symbol from query or default
const getInitialSymbol = () => {
  if (route.query.symbol) {
    let symbol = route.query.symbol.trim();
    // If symbol already has a slash, use it as is
    if (symbol.includes('/')) {
      return symbol;
    } else {
      // Format like "BCHUSDT" - add slash before USDT
      symbol = symbol.replace(/USDT$/, '/USDT');
      return symbol;
    }
  }
  return 'BTC/USDT';
};

const selectedSymbol = ref(getInitialSymbol());
const orderSide = ref(route.query.side === 'sell' ? 'sell' : 'buy');
const transactionMode = ref('USDT');
const openingQuantity = ref('');
const openTime = ref('30');
const activeTab = ref('transaction');
const ticker = ref(null);
const orderBook = ref({ bids: [], asks: [] });
const walletBalance = ref(0);
const loading = ref(false);
const showCoinSelector = ref(false);
const coinList = ref([]);
const isLoading = ref(true);
const activeTrades = ref([]);
const closedTrades = ref([]);
const countdowns = ref({});
const showActiveTradeModal = ref(false);
const currentActiveTrade = ref(null);

// Trade configuration
const tradeConfig = {
  '30': { minAmount: 100, profitRate: 10 },
  '60': { minAmount: 1000, profitRate: 20 },
  '120': { minAmount: 5000, profitRate: 30 },
  '180': { minAmount: 20000, profitRate: 40 },
  '240': { minAmount: 50000, profitRate: 50 },
  '300': { minAmount: 100000, profitRate: 60 },
};

// Available coins
const binanceCoins = ['BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'DOGE', 'DOT', 'LTC', 'BCH', 'ETC', 'NEO', 'IOTA', 'LUNA'];
const symbols = ref(binanceCoins.map(coin => `${coin}/USDT`));

// Match coin price formatting used on Home page:
// >= 1      -> 2 decimals
// >= 0.01   -> 4 decimals
// <  0.01   -> 8 decimals
const formatPrice = (price) => {
  if (price === null || price === undefined) return '0.00';
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return '0.00';
  if (numPrice >= 1) return numPrice.toFixed(2);
  if (numPrice >= 0.01) return numPrice.toFixed(4);
  return numPrice.toFixed(8);
};

const formatQuantity = (qty) => {
  if (!qty) return '0.00';
  return parseFloat(qty).toFixed(2);
};

const selectOrderBookPrice = (price) => {
  // Could be used to set a price if needed
};

const getVolumePercent = (quantity, type) => {
  if (!orderBook.value.bids.length || !orderBook.value.asks.length) return 0;
  
  const allQuantities = type === 'bid' 
    ? orderBook.value.bids.map(b => parseFloat(b.quantity))
    : orderBook.value.asks.map(a => parseFloat(a.quantity));
  
  const maxQuantity = Math.max(...allQuantities);
  if (maxQuantity === 0) return 0;
  
  return (parseFloat(quantity) / maxQuantity) * 100;
};

const loadMarketData = async () => {
  isLoading.value = true;
  const symbol = selectedSymbol.value.replace('/', '');
  try {
    await Promise.all([
      loadTicker(symbol),
      loadOrderBook(symbol),
      loadWalletBalance(),
    ]);
  } finally {
    isLoading.value = false;
  }
};

const loadTicker = async (symbol) => {
  try {
    const response = await api.get(`/market/ticker/${symbol}/24h`);
    if (response.data && response.data.price) {
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
      // Fallback: fetch directly from Binance
      try {
        const binanceResponse = await axios.get(`${BINANCE_HTTP_API}/ticker/24hr`, {
          params: { symbol: symbol.toUpperCase() }
        });
        const data = binanceResponse.data;
        ticker.value = {
          price: Number(data.lastPrice) || 0,
          priceChangePercent: Number(data.priceChangePercent) || 0,
          priceChange: Number(data.priceChange) || 0,
          volume: Number(data.volume) || 0,
          highPrice: Number(data.highPrice) || 0,
          lowPrice: Number(data.lowPrice) || 0,
        };
      } catch (binanceError) {
        console.error('Binance fallback failed:', binanceError);
      }
    }
  } catch (error) {
    console.error('Error loading ticker:', error);
    // Try Binance fallback on error
    try {
      const binanceResponse = await axios.get(`${BINANCE_HTTP_API}/ticker/24hr`, {
        params: { symbol: symbol.toUpperCase() }
      });
      const data = binanceResponse.data;
      ticker.value = {
        price: Number(data.lastPrice) || 0,
        priceChangePercent: Number(data.priceChangePercent) || 0,
        priceChange: Number(data.priceChange) || 0,
        volume: Number(data.volume) || 0,
        highPrice: Number(data.highPrice) || 0,
        lowPrice: Number(data.lowPrice) || 0,
      };
    } catch (binanceError) {
      console.error('Binance fallback failed:', binanceError);
    }
  }
};

const loadOrderBook = async (symbol) => {
  try {
    const response = await api.get(`/market/orderbook/${symbol}`, { params: { limit: 20 } });
    if (response.data && (response.data.bids?.length > 0 || response.data.asks?.length > 0)) {
    orderBook.value = response.data;
    } else {
      // Fallback: fetch directly from Binance
      try {
        const binanceResponse = await axios.get(`${BINANCE_HTTP_API}/depth`, {
          params: { symbol: symbol.toUpperCase(), limit: 20 }
        });
        orderBook.value = {
          bids: (binanceResponse.data.bids || []).map(([price, quantity]) => ({
            price: Number(price) || 0,
            quantity: Number(quantity) || 0,
          })),
          asks: (binanceResponse.data.asks || []).map(([price, quantity]) => ({
            price: Number(price) || 0,
            quantity: Number(quantity) || 0,
          })),
          timestamp: Date.now(),
        };
      } catch (binanceError) {
        console.error('Binance orderbook fallback failed:', binanceError);
      }
    }
  } catch (error) {
    console.error('Error loading order book:', error);
    // Try Binance fallback on error
    try {
      const binanceResponse = await axios.get(`${BINANCE_HTTP_API}/depth`, {
        params: { symbol: symbol.toUpperCase(), limit: 20 }
      });
      orderBook.value = {
        bids: (binanceResponse.data.bids || []).map(([price, quantity]) => ({
          price: Number(price) || 0,
          quantity: Number(quantity) || 0,
        })),
        asks: (binanceResponse.data.asks || []).map(([price, quantity]) => ({
          price: Number(price) || 0,
          quantity: Number(quantity) || 0,
        })),
        timestamp: Date.now(),
      };
    } catch (binanceError) {
      console.error('Binance orderbook fallback failed:', binanceError);
    }
  }
};

// Load wallet balance for USDT (same logic as Spot page)
const loadWalletBalance = async () => {
  try {
    console.log('[Contracts] Loading contract account balance...');
    // Get contract account balance specifically
    const response = await api.get('/wallet/balance', { params: { account_type: 'contract' } });
    console.log('[Contracts] Contract account balance response:', response.data);
    const usdtBalance = response.data.balances?.find(b => b.currency === 'USDT');
    console.log('[Contracts] USDT contract balance found:', usdtBalance);
    walletBalance.value = usdtBalance?.available || 0;
    console.log('[Contracts] Set walletBalance.value to:', walletBalance.value);
  } catch (error) {
    console.error('[Contracts] Error loading contract account balance:', error);
    console.error('[Contracts] Error response:', error.response?.data);
    console.error('[Contracts] Error status:', error.response?.status);
    // IMPORTANT: don't force 0 on error (429 makes UI show 0.0000 even when balance exists)
    // Keep the last known value; next successful request will refresh it.
  }
};

const loadCoinList = async () => {
  try {
    const promises = binanceCoins.map(async (coin) => {
      try {
        const symbol = `${coin}USDT`;
        const response = await api.get(`/market/ticker/${symbol}/24h`);
        if (response.data && response.data.price) {
          return {
            symbol: `${coin}/USDT`,
            price: response.data.price,
            change: response.data.priceChangePercent || 0,
          };
        }
        return null;
      } catch (error) {
        console.debug(`Failed to fetch ${coin}:`, error.message);
        return null;
      }
    });
    
    const results = await Promise.all(promises);
    coinList.value = results.filter(Boolean).sort((a, b) => {
      // Sort by symbol name
      return a.symbol.localeCompare(b.symbol);
    });
  } catch (error) {
    console.error('Error loading coin list:', error);
  }
};

const selectCoin = (symbol) => {
  selectedSymbol.value = symbol;
  showCoinSelector.value = false;
  loadMarketData();
};

const getCoinLogo = (symbol) => {
  const baseCurrency = symbol.split('/')[0];
  return getCoinLogoUrl(baseCurrency) || `https://via.placeholder.com/32?text=${baseCurrency}`;
};

const handleImageError = (event) => {
  const symbol = event.target.alt.split('/')[0];
  event.target.src = `https://via.placeholder.com/32?text=${symbol}`;
};

const placeOrder = async () => {
  if (!openingQuantity.value || parseFloat(openingQuantity.value) <= 0) {
    alert('Please enter a valid opening quantity');
    return;
  }
  
  const config = tradeConfig[openTime.value];
  if (parseFloat(openingQuantity.value) < config.minAmount) {
    alert(`Minimum amount for ${openTime.value}s trade is ${config.minAmount} USDT`);
    return;
  }
  
  loading.value = true;
  try {
    const response = await api.post('/contracts', {
      symbol: selectedSymbol.value,
      side: orderSide.value,
      amount: parseFloat(openingQuantity.value),
      duration: parseInt(openTime.value),
      entry_price: ticker.value?.price || 50000,
    });
    
    console.log('Trade created:', response.data);
    
    // Clear input
    openingQuantity.value = '';
    
    // Get the created trade from response
    const createdTrade = response.data.trade;
    console.log('=== TRADE CREATED ===');
    console.log('Full response:', response);
    console.log('Response data:', response.data);
    console.log('Created trade:', createdTrade);
    
    if (createdTrade) {
      // Force set the trade immediately with all required fields
      // Convert all numeric fields to numbers (PostgreSQL returns strings)
      currentActiveTrade.value = {
        id: createdTrade.id,
        symbol: createdTrade.symbol || selectedSymbol.value,
        side: createdTrade.side || orderSide.value,
        amount: parseFloat(createdTrade.amount) || parseFloat(openingQuantity.value),
        duration: parseInt(createdTrade.duration) || parseInt(openTime.value),
        profit_rate: parseFloat(createdTrade.profit_rate) || tradeConfig[openTime.value]?.profitRate || 10,
        entry_price: parseFloat(createdTrade.entry_price) || parseFloat(ticker.value?.price) || 50000,
        expires_at: createdTrade.expires_at,
        status: createdTrade.status || 'pending'
      };
      
      // Force show modal
      showActiveTradeModal.value = true;
      
      // Initialize countdown for the new trade
      if (createdTrade.expires_at) {
        const expiresAt = new Date(createdTrade.expires_at).getTime();
        const now = Date.now();
        const remaining = Math.floor((expiresAt - now) / 1000);
        // Cap countdown at 0 (don't allow negative)
        countdowns.value[createdTrade.id] = Math.max(0, remaining);
        console.log('Countdown initialized from expires_at:', countdowns.value[createdTrade.id], 'seconds');
      } else if (createdTrade.duration) {
        // If no expires_at, use duration as initial countdown
        countdowns.value[createdTrade.id] = Math.max(0, parseInt(createdTrade.duration));
        console.log('Countdown set from duration:', createdTrade.duration);
      } else {
        // Fallback to selected duration
        const duration = parseInt(openTime.value);
        countdowns.value[createdTrade.id] = Math.max(0, duration);
        console.log('Countdown set to selected duration:', duration);
      }
      
      // Force Vue to update
      await nextTick();
      
      console.log('=== MODAL STATE ===');
      console.log('currentActiveTrade:', currentActiveTrade.value);
      console.log('showActiveTradeModal:', showActiveTradeModal.value);
      console.log('Modal condition check:', !!currentActiveTrade.value && showActiveTradeModal.value);
      console.log('Countdown value:', countdowns.value[createdTrade.id]);
      
      // Add to active trades list immediately
      activeTrades.value.unshift(currentActiveTrade.value);
    } else {
      console.error('❌ No trade in response!');
      console.error('Response:', response);
      console.error('Response data:', response.data);
      alert('Trade created but no trade data returned. Please check console.');
    }
    
    // Reload market data and trades in background (non-blocking)
    loadMarketData();
    loadContractTrades();
  } catch (error) {
    console.error('Error creating trade:', error);
    alert(error.response?.data?.error || 'Failed to create contract trade');
  }
  loading.value = false;
};

const loadContractTrades = async () => {
  try {
    const response = await api.get('/contracts');
    const allTrades = response.data.trades || [];
    
    const now = Date.now();
    // Treat trades whose expiry time is in the future as current (continue countdown
    // even if admin already confirmed win/lose)
    activeTrades.value = allTrades.filter(trade => {
      if (!trade.expires_at) return false;
      const expiresAt = new Date(trade.expires_at).getTime();
      return expiresAt > now;
    });
    
    // Trades whose expiry time has passed go to history
    closedTrades.value = allTrades.filter(trade => {
      if (!trade.expires_at) return false;
      const expiresAt = new Date(trade.expires_at).getTime();
      return expiresAt <= now;
    });
    
    // Initialize countdowns for active trades based only on expires_at
    activeTrades.value.forEach(trade => {
      if (trade.expires_at) {
        const expiresAt = new Date(trade.expires_at).getTime();
        const remaining = Math.floor((expiresAt - now) / 1000);
        countdowns.value[trade.id] = Math.max(0, remaining);
      }
    });
    
    // Auto-show modal for the first current trade if none is open
    if (activeTrades.value.length > 0 && !showActiveTradeModal.value && !currentActiveTrade.value) {
      currentActiveTrade.value = activeTrades.value[0];
      showActiveTradeModal.value = true;
    }
    
    // Update current trade data (e.g. result set by admin) but keep modal open
    if (currentActiveTrade.value && showActiveTradeModal.value) {
      const updatedTrade = allTrades.find(t => t.id === currentActiveTrade.value.id);
      if (updatedTrade) {
        currentActiveTrade.value = updatedTrade;
      }
    }
  } catch (error) {
    console.error('Error loading contract trades:', error);
  }
};

const formatCountdown = (seconds) => {
  if (seconds <= 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString();
};

const estimatedPL = computed(() => {
  if (!currentActiveTrade.value) return 0;
  const profitRate = currentActiveTrade.value.profit_rate / 100;
  const amount = parseFloat(currentActiveTrade.value.amount);
  // Estimated P/L is the potential profit if win
  return amount * profitRate;
});

const updateCountdowns = () => {
  activeTrades.value.forEach(trade => {
    if (trade.expires_at) {
      const expiresAt = new Date(trade.expires_at).getTime();
      const now = Date.now();
      const remaining = Math.floor((expiresAt - now) / 1000);
      // Only allow countdown to go down to 0, not negative
      countdowns.value[trade.id] = Math.max(0, remaining);
      
      // If expired (countdown reached 0), reload trades after a delay
      if (remaining <= 0 && countdowns.value[trade.id] === 0) {
        // Reload after 2 seconds to check if trade completed
        setTimeout(() => {
          loadContractTrades();
        }, 2000);
      }
    }
  });
  
  // Update current active trade if modal is open
  if (currentActiveTrade.value && countdowns.value[currentActiveTrade.value.id] !== undefined) {
    // Ensure countdown doesn't go below 0
    if (countdowns.value[currentActiveTrade.value.id] < 0) {
      countdowns.value[currentActiveTrade.value.id] = 0;
    }
  }
};

// Watch for new active trades to auto-show modal
watch(() => activeTrades.value.length, (newLength, oldLength) => {
  if (newLength > 0 && !showActiveTradeModal.value) {
    currentActiveTrade.value = activeTrades.value[0];
    showActiveTradeModal.value = true;
  }
});

const refreshMarketData = async () => {
  const symbol = selectedSymbol.value.replace('/', '');
  await Promise.all([
    loadTicker(symbol),
    loadOrderBook(symbol),
  ]);
};

// WebSocket for real-time ticker updates
let tickerWs = null;
let wsReconnectTimer = null;
let wsBackoffMs = 1000;
const MAX_BACKOFF_MS = 30000;

const processTickerUpdate = (tickerData) => {
  if (!tickerData?.s) return;
  const symbol = tickerData.s;
  const currentSymbol = selectedSymbol.value.replace('/', '');
  if (symbol !== currentSymbol) return;
  
  if (ticker.value) {
    ticker.value.price = Number(tickerData.c) || ticker.value.price;
    ticker.value.priceChangePercent = Number(tickerData.P) || ticker.value.priceChangePercent;
    ticker.value.priceChange = Number(tickerData.p) || ticker.value.priceChange;
    ticker.value.volume = Number(tickerData.v) || ticker.value.volume;
    ticker.value.highPrice = Number(tickerData.h) || ticker.value.highPrice;
    ticker.value.lowPrice = Number(tickerData.l) || ticker.value.lowPrice;
  }
};

const connectWebSocket = () => {
  if (tickerWs?.readyState === WebSocket.OPEN) return;
  
  try {
    if (tickerWs) {
      tickerWs.onopen = null;
      tickerWs.onmessage = null;
      tickerWs.onerror = null;
      tickerWs.onclose = null;
      tickerWs.close();
    }
  } catch (e) {
    console.warn('[Contracts WS] Cleanup error:', e);
  }
  
  try {
    tickerWs = new WebSocket(BINANCE_WS_URL);
    
    tickerWs.onopen = () => {
      console.log('[Contracts WS] Connected');
      wsBackoffMs = 1000;
    };
    
    tickerWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) {
          data.forEach(processTickerUpdate);
        }
      } catch (e) {
        console.error('[Contracts WS] Parse error:', e);
      }
    };
    
    tickerWs.onerror = (e) => {
      console.error('[Contracts WS] Error:', e);
    };
    
    tickerWs.onclose = (e) => {
      console.warn('[Contracts WS] Closed:', e.code);
      tickerWs = null;
      scheduleReconnect();
    };
  } catch (e) {
    console.error('[Contracts WS] Setup error:', e);
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

// Store interval IDs for cleanup
let marketDataInterval = null;
let countdownInterval = null;
let tradesInterval = null;

onMounted(() => {
  loadMarketData();
  loadCoinList();
  connectWebSocket();
  loadContractTrades();
  
  // Real-time updates every 5 seconds - reduced from 2s to prevent browser overload
  let isRefreshing = false;
  let walletTick = 0;
  marketDataInterval = setInterval(async () => {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        // Only refresh orderbook (ticker is updated via WebSocket)
        const symbol = selectedSymbol.value.replace('/', '');
        await loadOrderBook(symbol);
        // Wallet balance does NOT need frequent polling (causes 429). Refresh every ~15s.
        walletTick = (walletTick + 1) % 3;
        if (walletTick === 0) {
          await loadWalletBalance();
        }
      } catch (error) {
        console.error('Error refreshing market data:', error);
      } finally {
        isRefreshing = false;
      }
    }
  }, 5000);
  
  // Update countdowns every second
  countdownInterval = setInterval(() => {
    updateCountdowns();
  }, 1000);
  
  // Reload contract trades every 5 seconds - reduced from 3s to prevent browser overload
  let isLoadingTrades = false;
  tradesInterval = setInterval(async () => {
    if (!isLoadingTrades) {
      isLoadingTrades = true;
      try {
        await loadContractTrades();
      } catch (error) {
        console.error('Error loading contract trades:', error);
      } finally {
        isLoadingTrades = false;
      }
    }
  }, 5000);
});

// Cleanup WebSocket and intervals on unmount
onUnmounted(() => {
  if (wsReconnectTimer) {
    clearTimeout(wsReconnectTimer);
    wsReconnectTimer = null;
  }
  
  if (marketDataInterval) {
    clearInterval(marketDataInterval);
    marketDataInterval = null;
  }
  
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  
  if (tradesInterval) {
    clearInterval(tradesInterval);
    tradesInterval = null;
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
});
</script>