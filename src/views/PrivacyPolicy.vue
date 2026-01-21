<template>
  <div class="min-h-[100dvh] overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
    <!-- Top bar -->
    <div class="sticky top-0 z-10 glass-card-no-hover border-b border-white/10">
      <div class="max-w-3xl mx-auto px-4 h-14 flex items-center">
        <button
          @click="$router.back()"
          class="p-1.5 hover:bg-white/10 rounded-lg transition-colors mr-2"
        >
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h1 class="text-lg font-bold text-white">Privacy Policy</h1>
      </div>
    </div>

    <!-- Banner Image -->
    <div class="w-full">
      <img :src="bannerUrl" alt="Banner" class="w-full h-auto object-cover" />
    </div>

    <div class="max-w-3xl mx-auto px-4 py-6 pb-8 pb-safe space-y-6">
        <div>
          <p class="text-sm text-white/80 mb-4">
            Last updated: {{ new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
          </p>
        </div>

        <section>
          <h2 class="text-xl font-bold text-white mb-3">1. Introduction</h2>
          <p class="text-sm text-white/70 leading-relaxed mb-4">
            Welcome to TradeXion. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our trading platform.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-white mb-3">2. Information We Collect</h2>
          <p class="text-sm text-white/70 leading-relaxed mb-3">
            We collect information that you provide directly to us, including:
          </p>
          <ul class="list-disc list-inside text-sm text-white/70 space-y-2 ml-4">
            <li>Email address</li>
            <li>Phone number (if provided)</li>
            <li>Password (encrypted)</li>
            <li>Transaction history</li>
            <li>Account balance and wallet information</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-bold text-white mb-3">3. How We Use Your Information</h2>
          <p class="text-sm text-white/70 leading-relaxed mb-3">
            We use the information we collect to:
          </p>
          <ul class="list-disc list-inside text-sm text-white/70 space-y-2 ml-4">
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and manage your account</li>
            <li>Send you technical notices and support messages</li>
            <li>Detect, prevent, and address technical issues</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-bold text-white mb-3">4. Information Sharing</h2>
          <p class="text-sm text-white/70 leading-relaxed mb-4">
            We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
          </p>
          <ul class="list-disc list-inside text-sm text-white/70 space-y-2 ml-4">
            <li>To comply with legal obligations or court orders</li>
            <li>To protect our rights, privacy, safety, or property</li>
            <li>With your explicit consent</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-bold text-white mb-3">5. Data Security</h2>
          <p class="text-sm text-white/70 leading-relaxed mb-4">
            We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-white mb-3">6. Your Rights</h2>
          <p class="text-sm text-white/70 leading-relaxed mb-3">
            You have the right to:
          </p>
          <ul class="list-disc list-inside text-sm text-white/70 space-y-2 ml-4">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your account</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-bold text-white mb-3">7. Cookies and Tracking</h2>
          <p class="text-sm text-white/70 leading-relaxed mb-4">
            We use cookies and similar tracking technologies to improve your experience on our platform. You can control cookie preferences through your browser settings.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-white mb-3">8. Contact Us</h2>
          <p class="text-sm text-white/70 leading-relaxed mb-4">
            If you have any questions about this Privacy Policy, please contact us through our support channels.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-white mb-3">9. Changes to This Policy</h2>
          <p class="text-sm text-white/70 leading-relaxed mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </section>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
const bannerUrl = new URL('../assets/banners/bitcoin-banner.png', import.meta.url).href;
</script>
