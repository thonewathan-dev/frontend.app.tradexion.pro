<template>
  <div class="min-h-screen">
    <!-- MobileNav hidden on AboutTradeXion page -->
    <div class="md:flex">
      <DesktopNav v-if="!isMobile" />

      <main class="flex-1 pb-4 md:pb-0">
        <!-- Header (aligned like Spot/Contract/Exchange) -->
        <div class="glass-card-no-hover border-b border-white/10 px-4 py-3 mb-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="$router.back()" class="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 class="text-lg font-bold text-white">About TradeXion</h1>
            </div>
          </div>
        </div>

        <div class="max-w-3xl mx-auto px-4 pb-4 space-y-5">
          <!-- Banner -->
          <img
            :src="bannerImg"
            alt="TradeXion"
            class="w-full max-h-40 md:max-h-56 object-cover rounded-2xl shadow-lg"
          />

          <!-- Content (no glass container, just text on background) -->
          <div class="space-y-4 text-sm text-white/80 leading-relaxed">
            <p class="text-base font-semibold text-white">
              TradeXion Exchange was established by a group of blockchain enthusiasts with a goal of providing complete
              financial services for the currencies of the future. We are dedicated to delivering safe, convenient, and
              diversified services to meet all crypto needs, including trading, investing, purchasing, staking, borrowing, and more.
            </p>

            <p>
              As blockchain and artificial intelligence technologies continue to develop, more and more users want to invest in digital
              assets. However, the entry threshold is often very high and beginners don’t know where to start. TradeXion Exchange
              advocates a low-threshold, low-cost, and easy-to-understand approach so that new users can take their first confident step
              and complete simple, fast investment operations.
            </p>

            <p>
              For experienced blockchain asset investors, TradeXion provides programmatic and systematic trading solutions, encouraging
              rational, professional, and data-driven decision making. We offer digital currency margin futures contracts with no
              expiration date—as long as there is sufficient margin in the account, positions can be held or closed at any time. Margin
              trading allows users to use leverage to amplify exposure, investing only margin instead of the full notional value.
            </p>

            <p>
              Spot investors can use TradeXion contract trading to easily hedge their holdings with only a small amount of capital.
              This makes it possible to control risk in volatile markets while still capturing better profit opportunities.
            </p>

            <p>
              TradeXion also provides multiple leverage options to match different trading styles—from conservative to aggressive.
              The combination of high leverage with low entry thresholds improves capital efficiency and makes trading more flexible
              and engaging, while always emphasizing risk management and user protection.
            </p>

            <p>
              The blockchain industry has just passed its first decade. Like previous technological waves such as the Internet and
              artificial intelligence, the early stages were full of speculation and bubbles that later burst. What follows is a phase
              of real, grounded development and the emergence of true industrial opportunities. TradeXion was born in this new phase
              and is committed to becoming a leading global digital asset financial service provider.
            </p>

            <p>
              Our mission is to make it easier for everyone to cross the blockchain threshold, so that a wider range of users can
              directly access blockchain and cryptocurrencies. We aim to provide more accessible, real-world application scenarios
              across many fields and help cultivate the soil and foundation for the next wave of practical blockchain adoption.
            </p>

            <p class="pt-2 border-t border-white/10 mt-2">
              Follow us and stay close to the investment trends of the blockchain era:
              <a
                href="https://www.tradexion.pro/"
                target="_blank"
                rel="noopener noreferrer"
                class="text-teal-300 hover:text-teal-200 underline underline-offset-2"
              >
                https://www.tradexion.pro/
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>

    <!-- Full website footer -->
    <SiteFooter />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import DesktopNav from '../components/DesktopNav.vue';
import SiteFooter from '../components/SiteFooter.vue';
import bannerImg from '@/assets/banners/banner.jpg';

const isMobile = computed(() => typeof window !== 'undefined' && window.innerWidth < 768);
</script>

