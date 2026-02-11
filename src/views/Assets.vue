<template>
  <div class="min-h-screen">
    <MobileNav v-if="isMobile" />
    <div class="md:flex">
      <DesktopNav v-if="!isMobile" />
      <main class="flex-1 pb-16 md:pb-0">
        <!-- Header -->
        <!-- Profile Header -->
        <div class="bg-neutral-900 px-4 py-3 text-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <!-- Avatar -->
              <div class="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
                <svg class="w-5 h-5 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <div class="text-sm font-bold">{{ formatEmail(user?.email || user?.phone) }}</div>
                <div class="text-[10px] text-neutral-400 uppercase tracking-wider">ID: {{ user?.id || '---' }}</div>
              </div>
            </div>
            <!-- Stats Stack -->
            <div class="flex flex-col items-end gap-1">
              <!-- Credit Score -->
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-medium text-neutral-400">Credited Score:</span>
                <span class="text-[10px] font-bold text-white">{{ parseInt(user?.credited_score) || 0 }}</span>
              </div>
              <!-- VIP Level -->
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-medium text-neutral-400">VIP Level:</span>
                <span class="text-[10px] font-bold text-[#FCD535]">{{ user?.vip_level || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <!-- Asset Center -->
          <div class="bg-[#0f1115] p-6 relative overflow-hidden group shadow-2xl border-y border-neutral-800">
            <!-- Decorative Background Overlay -->
            <img src="/background shadow.png" alt="" class="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 object-contain pointer-events-none group-hover:scale-105 transition-transform duration-700 opacity-30" />
            
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-4">
                <div class="text-gray-400 text-xs font-semibold flex items-center gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  Asset Center (USDT)
                </div>
                <button
                  type="button"
                  class="p-1 rounded-full hover:bg-neutral-800 transition-colors"
                  @click="handleAssetInfo"
                >
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2z" />
                  </svg>
                </button>
              </div>
              
              <div class="text-white text-3xl md:text-4xl font-bold mb-6 tracking-tight flex items-baseline gap-2">
                <span v-if="!hasLoadedWallets" class="inline-block h-10 w-48 rounded bg-neutral-800 animate-pulse" />
                <template v-else>
                  <span class="text-xl text-gray-500 font-medium">&approx;</span>
                  {{ formatBalance(totalBalance) }}
                  <span class="text-sm text-gray-500 font-normal uppercase">USDT</span>
                </template>
              </div>

              <div class="flex items-center justify-between py-4 px-4 bg-neutral-800/50 rounded-xl border border-neutral-700/50 backdrop-blur-sm">
                <div class="flex-1 text-center">
                   <div class="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-1">Contract account</div>
                  <div class="text-white text-lg font-bold">
                    <span v-if="!hasLoadedWallets" class="inline-block h-5 w-20 rounded bg-neutral-700 animate-pulse" />
                    <span v-else>{{ formatBalance(contractBalance) }}</span>
                  </div>
                </div>
                <div class="w-px h-8 bg-neutral-700"></div>
                <div class="flex-1 text-center">
                   <div class="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-1">Spot account</div>
                  <div class="text-white text-lg font-bold">
                    <span v-if="!hasLoadedWallets" class="inline-block h-5 w-20 rounded bg-neutral-700 animate-pulse" />
                    <span v-else>{{ formatBalance(spotBalance) }}</span>
                  </div>
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
                <span class="text-gray-900 text-xs font-medium">Deposit</span>
              </button>
              <button
                @click="router.push('/withdraw')"
                class="flex-1 flex flex-col items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              >
                <img :src="withdrawIcon" alt="Withdraw" class="w-8 h-8 object-contain" />
                <span class="text-gray-900 text-xs font-medium">Withdraw</span>
              </button>
              <button
                @click="router.push('/transfer')"
                class="flex-1 flex flex-col items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              >
                <img :src="transferIcon" alt="Transfer" class="w-8 h-8 object-contain" />
                <span class="text-gray-900 text-xs font-medium">Transfer</span>
              </button>
            </div>
          </div>

          <!-- Menu Cards -->
          <div class="space-y-3 mt-1">
            <!-- Card 1: Accounts -->
            <div class="glass-card-no-hover rounded-lg overflow-hidden">
              <button
                class="w-full flex items-center justify-between px-3 py-3 border-b border-gray-200 transition-colors hover:bg-gray-50"
                @click="router.push('/flash-exchange')"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span class="text-gray-900 text-sm font-medium">Flash Exchange</span>
                </div>
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                class="w-full flex items-center justify-between px-3 py-3 border-b border-gray-200 transition-colors hover:bg-gray-50"
                @click="router.push('/spot-account')"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span class="text-gray-900 text-sm font-medium">Spot account</span>
                </div>
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                class="w-full flex items-center justify-between px-3 py-3 transition-colors hover:bg-gray-50"
                @click="router.push('/contract-account')"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span class="text-gray-900 text-sm font-medium">Contract account</span>
              </div>
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              </button>
            </div>

            <!-- Card 2: Services -->
            <div class="glass-card-no-hover rounded-lg overflow-hidden">
              <button
                class="w-full flex items-center justify-between px-3 py-3 border-b border-gray-200 transition-colors hover:bg-gray-50"
                @click="handleInviteFriends"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span class="text-gray-900 text-sm font-medium">Invite friends</span>
          </div>
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                class="w-full flex items-center justify-between px-3 py-3 border-b border-gray-200 transition-colors hover:bg-gray-50"
                @click="router.push('/about-TrustXGlobal')"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-gray-900 text-sm font-medium">About TrustXGlobal</span>
                </div>
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                class="w-full flex items-center justify-between px-3 py-3 transition-colors hover:bg-gray-50"
                @click="router.push('/chat')"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span class="text-gray-900 text-sm font-medium">Complaint suggestion</span>
              </div>
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              </button>
          </div>

            <!-- Card 3: Settings -->
            <div class="glass-card-no-hover rounded-lg overflow-hidden">
              <button
                class="w-full flex items-center justify-between px-3 py-3 border-b border-gray-200 transition-colors hover:bg-gray-50"
                @click="handleClientDownload"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                   <span class="text-gray-900 text-sm font-medium">Client Download</span>
                 </div>
                 <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                class="w-full flex items-center justify-between px-3 py-3 border-b border-gray-200 transition-colors hover:bg-gray-50"
                @click="router.push('/change-password')"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span class="text-gray-900 text-sm font-medium">Modify the password</span>
              </div>
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
                class="w-full flex items-center justify-between px-3 py-3 transition-colors hover:bg-gray-50"
                @click="router.push('/chat')"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 10a6 6 0 00-12 0v3H5a2 2 0 00-2 2v1a2 2 0 002 2h3v-4H8v-4a4 4 0 118 0v4h-1v4h3a2 2 0 002-2v-1a2 2 0 00-2-2h-1v-3z" />
                  </svg>
                  <span class="text-gray-900 text-sm font-medium">Customer Services</span>
        </div>
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <span class="text-gray-900 text-sm font-medium">Log out</span>
              </div>
            </button>
          </div>
        </div>

      </main>
    </div>

    <!-- Client Download Modal -->
    <div
      v-if="showDownloadModal"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-2 md:p-4 bg-black/80 backdrop-blur-sm"
      @click.self="showDownloadModal = false"
    >
      <div class="glass-card rounded-lg p-3 md:p-4 max-w-[90%] md:max-w-sm w-full shadow-2xl border border-gray-200 animate-slide-up max-h-[75vh] md:max-h-[85vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-2 md:mb-4">
          <h2 class="text-gray-900 font-semibold text-sm md:text-base">Download TrustXGlobal App</h2>
          <button
            @click="showDownloadModal = false"
            class="p-1 md:p-1.5 rounded"
          >
            <svg class="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-2 md:space-y-3">
          <!-- Already Installed -->
          <div v-if="isAppInstalled" class="p-2 md:p-3 bg-green-500/10 border border-green-500/20 rounded">
            <div class="flex items-center gap-1.5 md:gap-2">
              <svg class="w-4 h-4 md:w-5 md:h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="text-gray-900 font-medium text-xs md:text-sm">App Installed</p>
                <p class="text-gray-600 text-[10px] md:text-xs">TrustXGlobal is already installed on your device</p>
              </div>
            </div>
          </div>

          <!-- Android/Desktop Install -->
          <div v-if="!isIOSDevice && !isAppInstalled" class="space-y-1.5 md:space-y-2">
            <div class="p-2 md:p-3 bg-gray-50 rounded border border-gray-200">
              <div class="flex items-start gap-1.5 md:gap-2 mb-2 md:mb-3">
                <img src="/icon-192.png" alt="TrustXGlobal" class="w-10 h-10 md:w-12 md:h-12 rounded-lg flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <h3 class="text-gray-900 font-semibold text-xs md:text-sm">TrustXGlobal</h3>
                  <p class="text-gray-600 text-[10px] md:text-xs">Professional Trading Platform</p>
                </div>
              </div>
              <button
                v-if="deferredPrompt"
                @click="handleInstall"
                class="w-full px-2.5 py-1.5 md:px-3 md:py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-gray-900 rounded font-medium text-xs md:text-sm shadow-lg"
              >
                Install App
              </button>
              <div v-else class="p-1.5 md:p-2 bg-gray-50 rounded">
                <p class="text-gray-600 text-[10px] md:text-xs text-center">
                  Install option will appear automatically. Make sure you're using Chrome or Edge browser.
                </p>
              </div>
            </div>
            <div class="text-[10px] md:text-xs text-gray-500 text-center space-y-0.5">
              <p>For the best experience, install TrustXGlobal as an app</p>
              <p>Works offline â€¢ Faster loading â€¢ App-like experience</p>
            </div>
          </div>

          <!-- iOS Install Instructions -->
          <div v-if="isIOSDevice && !isAppInstalled" class="space-y-2 md:space-y-3">
            <div class="p-2 md:p-3 bg-gray-50 rounded border border-gray-200">
              <div class="flex items-start gap-1.5 md:gap-2 mb-2 md:mb-3">
                <img src="/icon-192.png" alt="TrustXGlobal" class="w-10 h-10 md:w-12 md:h-12 rounded-lg flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <h3 class="text-gray-900 font-semibold text-xs md:text-sm">TrustXGlobal</h3>
                  <p class="text-gray-600 text-[10px] md:text-xs">Professional Trading Platform</p>
                </div>
              </div>
              
              <div class="space-y-1.5 md:space-y-2 mb-2 md:mb-3">
                <div class="flex items-start gap-1.5 md:gap-2">
                  <div class="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span class="text-blue-400 font-bold text-[10px] md:text-xs">1</span>
                  </div>
                  <div class="flex-1">
                    <p class="text-gray-900 text-[10px] md:text-xs">Tap the <span class="font-semibold">Share</span> button</p>
                     <p class="text-gray-500 text-[9px] md:text-[10px] mt-0.5">Located at the bottom of Safari</p>
                  </div>
                </div>
                
                <div class="flex items-start gap-1.5 md:gap-2">
                  <div class="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span class="text-blue-400 font-bold text-[10px] md:text-xs">2</span>
                  </div>
                  <div class="flex-1">
                    <p class="text-gray-900 text-[10px] md:text-xs">Select <span class="font-semibold">"Add to Home Screen"</span></p>
                     <p class="text-gray-500 text-[9px] md:text-[10px] mt-0.5">Scroll down if needed</p>
                  </div>
                </div>
                
                <div class="flex items-start gap-1.5 md:gap-2">
                  <div class="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span class="text-blue-400 font-bold text-[10px] md:text-xs">3</span>
                  </div>
                  <div class="flex-1">
                    <p class="text-gray-900 text-[10px] md:text-xs">Tap <span class="font-semibold">"Add"</span></p>
                     <p class="text-gray-500 text-[9px] md:text-[10px] mt-0.5">The app will appear on your home screen</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Platform Info -->
          <div class="pt-1.5 md:pt-2 border-t border-gray-200">
             <p class="text-gray-500 text-[9px] md:text-[10px] text-center">
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
import { useI18n } from 'vue-i18n';
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
const { t } = useI18n();

const isMobile = computed(() => window.innerWidth < 768);
const user = computed(() => authStore.user);

const formatEmail = (email) => {
  if (!email) return 'User';
  const [localPart, domain] = email.split('@');
  if (!domain) return email;
  if (localPart.length <= 5) return email;
  return `${localPart.substring(0, 5)}......@${domain}`;
};

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
  // 1. Load from cache first
  const cached = localStorage.getItem('crypto_prices');
  if (cached) {
    try {
      const p = JSON.parse(cached);
      if (p.BTCUSDT) prices.value.BTCUSDT = p.BTCUSDT;
      if (p.ETHUSDT) prices.value.ETHUSDT = p.ETHUSDT;
    } catch (e) {
      console.error('Error parsing cached prices:', e);
    }
  }

  // 2. Fetch fresh prices
  try {
    const [btcRes, ethRes] = await Promise.all([
      api.get('/market/ticker/BTCUSDT'),
      api.get('/market/ticker/ETHUSDT'),
    ]);
    const parsePrice = (data) => parseFloat(data.price || data.lastPrice || data.close || 0);
    
    const newPrices = {
      BTCUSDT: parsePrice(btcRes.data),
      ETHUSDT: parsePrice(ethRes.data)
    };
    
    prices.value.BTCUSDT = newPrices.BTCUSDT;
    prices.value.ETHUSDT = newPrices.ETHUSDT;
    
    localStorage.setItem('crypto_prices', JSON.stringify(newPrices));
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
  const pwaInstall = document.querySelector('pwa-install');
  if (pwaInstall) {
    pwaInstall.showDialog(true);
  } else {
    console.error('PWA install component not found');
    showDownloadModal.value = true;
  }
};
    


// Listen for beforeinstallprompt event (Android/Desktop)
const handleBeforeInstallPrompt = (e) => {
  console.log('[PWA] beforeinstallprompt event fired!');
  e.preventDefault();
  deferredPrompt.value = e;
  console.log('[PWA] Deferred prompt stored');
};

// Listen for app installed event
const handleAppInstalled = () => {
  console.log('[PWA] App installed event fired');
  isInstalled.value = true;
  deferredPrompt.value = null;
  showSuccess('TrustXGlobal has been installed successfully!');
  showDownloadModal.value = false;
};

const handleAssetInfo = () => {
  showInfo(
    'Asset Center shows your total balance converted to USDT, combining both Spot and Contract accounts. For detailed breakdowns, open the Spot or Contract account pages.'
  );
};

const loadWallets = async () => {
  // 1. Load from cache first for immediate display
  const cached = localStorage.getItem('user_wallets');
  if (cached) {
    try {
      wallets.value = JSON.parse(cached);
      hasLoadedWallets.value = true;
    } catch (e) {
      console.error('Error parsing cached wallets:', e);
    }
  }

  // 2. Fetch fresh data
  try {
    if (!wallets.value.length) {
      loading.value = true;
    }
    const res = await api.get('/wallet');
    const newWallets = (res.data.wallets || []).map(w => ({
      ...w,
      account_type: w.account_type || 'spot',
    }));
    
    wallets.value = newWallets;
    localStorage.setItem('user_wallets', JSON.stringify(newWallets));
    hasLoadedWallets.value = true;
  } catch (e) {
    console.error('Error loading wallets:', e);
    // Only show error if we have no data at all
    if (!wallets.value.length) {
      showError('Failed to load wallets');
    }
    // Mark as loaded so we don't show skeleton forever
    hasLoadedWallets.value = true;
  } finally {
    loading.value = false;
  }
};

const loadWalletsSilently = async () => {
  try {
    const res = await api.get('/wallet');
    const newWallets = (res.data.wallets || []).map(w => ({
      ...w,
      account_type: w.account_type || 'spot',
    }));
    wallets.value = newWallets;
    localStorage.setItem('user_wallets', JSON.stringify(newWallets));
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
    // Non-blocking user fetch
    authStore.fetchCurrentUser().catch(() => {});
  } else {
    refreshUser();
  }
  
  // Parallel load for speed
  loadPrices();
  loadWallets();
  
  // Check PWA install status
  checkInstallStatus();
  
  // Debug: Check if app is already installed
  console.log('[PWA] Is app installed?', isInstalled.value);
  console.log('[PWA] Is iOS?', isIOSDevice.value);
  
  // Debug: Check manifest
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    console.log('[PWA] Service Worker registered:', !!registration);
  }
  
  // Debug: Check if manifest is accessible
  try {
    const manifestResponse = await fetch('/manifest.json');
    const manifest = await manifestResponse.json();
    console.log('[PWA] Manifest loaded:', manifest);
    console.log('[PWA] Manifest icons:', manifest.icons);
  } catch (error) {
    console.error('[PWA] Error loading manifest:', error);
  }
  
  // Listen for beforeinstallprompt (Chrome/Edge)
  // Note: This event only fires if:
  // 1. App is not already installed
  // 2. User has engaged with the site (interacted)
  // 3. App meets PWA criteria (manifest + service worker)
  // 4. Served over HTTPS (or localhost)
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  console.log('[PWA] beforeinstallprompt listener added');
  
  // Listen for app installed
  window.addEventListener('appinstalled', handleAppInstalled);
  console.log('[PWA] appinstalled listener added');
  
  // Check if prompt might be available but event already fired
  // (This can happen if event fires before listener is added)
  setTimeout(() => {
    if (!deferredPrompt.value && !isInstalled.value && !isIOSDevice.value) {
      console.log('[PWA] No deferred prompt after 2 seconds. Possible reasons:');
      console.log('[PWA] - App already installed');
      console.log('[PWA] - User needs to interact with site more');
      console.log('[PWA] - Manifest or service worker issues');
      console.log('[PWA] - Not served over HTTPS');
    }
  }, 2000);
  
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

/* usdt-card-bg style removed for white theme */
</style>
