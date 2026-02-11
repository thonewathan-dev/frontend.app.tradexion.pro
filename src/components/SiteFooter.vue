<template>
  <footer class="w-full border-t border-gray-800 bg-[#0B0E11]">
    <div class="max-w-5xl mx-auto px-4 py-8 md:py-12 pb-safe">
      <div class="grid gap-8 md:grid-cols-3">
        <!-- Brand -->
        <div class="space-y-4">
          <router-link to="/" class="flex items-center gap-2 group transition-colors">
            <img :src="logoMarkUrl" alt="TrustXGlobal" class="w-7 h-7 object-contain" />
            <span class="font-semibold tracking-tight text-white group-hover:text-binance-yellow transition-colors">TrustXGlobal</span>
          </router-link>
          <div class="text-xs text-gray-500 font-medium">trustxglobal.site</div>
          <p class="text-sm text-gray-400 leading-relaxed max-w-xs">
            Secure and simple crypto trading experience. Market data on auth pages is for preview only.
          </p>
        </div>

        <!-- Links -->
        <div class="grid grid-cols-2 gap-8 md:col-span-2">
          <div>
            <div class="text-xs font-bold text-binance-yellow uppercase tracking-widest mb-4">Quick Links</div>
            <div class="flex flex-col gap-3">
              <router-link to="/" class="text-sm text-white/60 hover:text-binance-yellow transition-colors">Home</router-link>
              <router-link to="/login" class="text-sm text-white/60 hover:text-binance-yellow transition-colors">Log In</router-link>
              <router-link to="/register" class="text-sm text-white/60 hover:text-binance-yellow transition-colors">Create Account</router-link>
            </div>
          </div>

          <div>
            <div class="text-xs font-bold text-binance-yellow uppercase tracking-widest mb-4">Legal</div>
            <div class="flex flex-col gap-3">
              <router-link to="/terms-of-service" class="text-sm text-white/60 hover:text-binance-yellow transition-colors">
                Terms of Service
              </router-link>
              <router-link to="/privacy-policy" class="text-sm text-white/60 hover:text-binance-yellow transition-colors">
                Privacy Policy
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-12 pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="text-sm text-gray-500 font-medium">
          &copy; {{ year }} trustxglobal.site. All rights reserved.
        </div>
        <div class="text-sm text-gray-600 font-medium italic">
          Powered by TrustXGlobal
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
const logoMarkUrl = new URL('../assets/logo/Logo-Only.png', import.meta.url).href;
const year = new Date().getFullYear();
</script>


