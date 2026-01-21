<template>
  <footer class="w-full border-t border-white/10 bg-black/10 backdrop-blur">
    <div class="max-w-5xl mx-auto px-4 py-4 md:py-6 pb-safe">
      <div class="grid gap-4 md:gap-8 md:grid-cols-3">
        <!-- Brand -->
        <div>
          <div class="flex items-center gap-2">
            <img :src="logoMarkUrl" alt="TradeXion" class="w-8 h-8 object-contain" />
            <div class="leading-tight">
              <div class="text-sm font-semibold text-white">TradeXion</div>
              <div class="text-xs text-white/60">tradexion.pro</div>
            </div>
          </div>
          <p class="mt-2 text-xs text-white/60 leading-relaxed">
            Secure and simple crypto trading experience. Market data on auth pages is for preview only.
          </p>
        </div>

        <!-- Links -->
        <div class="hidden md:grid grid-cols-2 gap-6 md:col-span-2">
          <div>
            <div class="text-xs font-semibold text-white/80 tracking-wide">Quick Links</div>
            <div class="mt-3 space-y-2 text-xs">
              <router-link to="/" class="block text-white/60 hover:text-white transition-colors">Home</router-link>
              <router-link to="/login" class="block text-white/60 hover:text-white transition-colors">Log In</router-link>
              <router-link to="/register" class="block text-white/60 hover:text-white transition-colors">Create Account</router-link>
            </div>
          </div>

          <div>
            <div class="text-xs font-semibold text-white/80 tracking-wide">Legal</div>
            <div class="mt-3 space-y-2 text-xs">
              <router-link to="/terms-of-service" class="block text-white/60 hover:text-white transition-colors">
                Terms of Service
              </router-link>
              <router-link to="/privacy-policy" class="block text-white/60 hover:text-white transition-colors">
                Privacy Policy
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-1.5">
        <div class="text-xs text-white/50">
          © {{ year }} tradexion.pro. All rights reserved.
        </div>
        <div class="text-xs text-white/40">
          Powered by TradeXion
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
const logoMarkUrl = new URL('../assets/logo/Logo-Only.png', import.meta.url).href;
const year = new Date().getFullYear();
</script>

