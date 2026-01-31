<template>
  <div class="min-h-[100dvh] overflow-hidden text-white">
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
        <h1 class="text-lg font-bold text-white">Terms of Service</h1>
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
          <h2 class="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
          <p class="text-sm text-white/70 leading-relaxed mb-4">
            By accessing or using TradeXion, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-white mb-3">2. Account Registration</h2>
          <p class="text-sm text-white/70 leading-relaxed mb-3">
            To use our services, you must:
          </p>
          <ul class="list-disc list-inside text-sm text-white/70 space-y-2 ml-4">
            <li>Provide accurate and complete registration information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Be at least 18 years old (or legal age in your jurisdiction)</li>
            <li>Comply with all applicable laws and regulations</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-bold text-white mb-3">3. Trading and Financial Services</h2>
          <p class="text-sm text-white/70 leading-relaxed mb-3">
            You acknowledge that:
          </p>
          <ul class="list-disc list-inside text-sm text-white/70 space-y-2 ml-4">
            <li>Cryptocurrency trading involves substantial risk of loss</li>
            <li>You are solely responsible for your trading decisions</li>
            <li>Past performance does not guarantee future results</li>
            <li>You should only trade with funds you can afford to lose</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-bold text-white mb-3">4. Prohibited Activities</h2>
          <p class="text-sm text-white/70 leading-relaxed mb-3">
            You agree not to:
          </p>
          <ul class="list-disc list-inside text-sm text-white/70 space-y-2 ml-4">
            <li>Violate any applicable laws or regulations</li>
            <li>Engage in fraudulent, manipulative, or deceptive activities</li>
            <li>Interfere with or disrupt the platform's operation</li>
            <li>Attempt to gain unauthorized access to any system or account</li>
            <li>Use the platform for money laundering or illegal purposes</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-bold text-white mb-3">5. Fees and Payments</h2>
          <p class="text-sm text-white/70 leading-relaxed mb-4">
            Transaction fees and other charges may apply to your use of our services. All fees are clearly disclosed before you complete a transaction. You are responsible for paying all applicable fees.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-white mb-3">6. Intellectual Property</h2>
          <p class="text-sm text-white/70 leading-relaxed mb-4">
            All content, features, and functionality of the platform, including but not limited to text, graphics, logos, and software, are owned by TradeXion and are protected by international copyright, trademark, and other intellectual property laws.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-white mb-3">7. Limitation of Liability</h2>
          <p class="text-sm text-white/70 leading-relaxed mb-4">
            To the maximum extent permitted by law, TradeXion shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or other intangible losses, resulting from your use of the platform.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-white mb-3">8. Indemnification</h2>
          <p class="text-sm text-white/70 leading-relaxed mb-4">
            You agree to indemnify and hold harmless TradeXion, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses arising out of your use of the platform or violation of these Terms.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-white mb-3">9. Account Suspension and Termination</h2>
          <p class="text-sm text-white/70 leading-relaxed mb-4">
            We reserve the right to suspend or terminate your account at any time, without prior notice, if you violate these Terms, engage in fraudulent activity, or for any other reason we deem necessary to protect the platform and its users.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-white mb-3">10. Changes to Terms</h2>
          <p class="text-sm text-white/70 leading-relaxed mb-4">
            We reserve the right to modify these Terms of Service at any time. Your continued use of the platform after such modifications constitutes your acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-white mb-3">11. Governing Law</h2>
          <p class="text-sm text-white/70 leading-relaxed mb-4">
            These Terms shall be governed by and construed in accordance with applicable laws, without regard to its conflict of law provisions.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-white mb-3">12. Contact Information</h2>
          <p class="text-sm text-white/70 leading-relaxed mb-4">
            If you have any questions about these Terms of Service, please contact us through our support channels.
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
