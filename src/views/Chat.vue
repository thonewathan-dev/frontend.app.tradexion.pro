<template>
  <div class="fixed inset-0 bg-dark flex flex-col overflow-hidden">
    <!-- Header - Fixed at top -->
    <div class="bg-[#181A20] border-b border-gray-800 px-4 py-3 flex-shrink-0 z-10">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button
            @click="router.back()"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <img :src="logoUrl" alt="TrustXGlobal" class="w-8 h-8 object-contain" />
          <div>
            <h3 class="text-gray-900 font-semibold text-sm">Customer Support</h3>
            <div class="flex items-center gap-1.5" v-if="isConnected">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span class="text-green-500 text-xs font-semibold">Online</span>
            </div>
            <p v-else class="text-red-500 text-xs">Connecting...</p>
          </div>
        </div>
        <button
          v-if="!chatEnded && hasUserMessages"
          @click="handleEndChat"
          :disabled="endingChat"
          class="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 hover:text-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span class="text-xs font-medium">End Chat</span>
        </button>
      </div>
    </div>

    <!-- Messages Area - Scrollable middle section -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3" style="min-height: 0; overflow-x: hidden;">
      <!-- Auto Bot Welcome Message with Menu Buttons -->
      <div v-if="messages.length === 0 && !loading && !chatEnded" class="flex flex-col items-center justify-center h-full py-6 px-4">
        <div class="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-3">
          <img :src="logoUrl" alt="TrustXGlobal" class="w-10 h-10 object-contain" />
        </div>
        <h3 class="text-gray-900 text-base font-semibold mb-1.5">Welcome to Customer Support</h3>
        <p class="text-gray-500 text-xs text-center max-w-sm mb-4">
          Hi! I'm your support assistant. How can I help you today?
        </p>
        
        <!-- Bot Menu Buttons -->
        <div class="w-full max-w-sm space-y-1.5">
          <button
            v-for="option in botMenuOptions"
            :key="option.id"
            @click="handleBotMenuClick(option)"
            class="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div class="flex items-center gap-2.5">
              <div :class="option.iconBg" class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                <component :is="option.iconComponent" class="w-4 h-4" />
              </div>
              <div class="flex-1">
                <div class="text-gray-900 text-xs font-medium">{{ option.label }}</div>
                <div class="text-gray-500 text-[10px]">{{ option.description }}</div>
              </div>
              <svg class="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>
      <div v-if="loading && messages.length === 0" class="flex flex-col items-center justify-center h-full py-12">
        <span class="loader"></span>
        <p class="text-gray-500 text-sm mt-4">Loading messages...</p>
      </div>
      <div
        v-for="message in messages"
        :key="message.id"
      >
        <!-- System Message (centered with actual lines) -->
        <div v-if="message.sender_role === 'system'" class="flex items-center justify-center my-6 px-4">
          <div class="flex-1 h-px bg-gray-300"></div>
          <div class="text-xs text-gray-500 text-center px-4 py-1 whitespace-nowrap">
            {{ message.message.replace(/-------------------/g, '').trim() }}
          </div>
          <div class="flex-1 h-px bg-gray-300"></div>
        </div>

        <!-- User/Admin Message -->
        <div
          v-else
          class="flex items-end gap-2"
          :class="(message.sender_role === 'user' || message.sender_id === authStore.user?.id) ? 'justify-end' : 'justify-start'"
        >
          <!-- Profile Icon with Logo (only for admin messages, on the LEFT) -->
          <div
            v-if="message.sender_role === 'admin' && message.sender_id !== authStore.user?.id"
            class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"
          >
            <img :src="logoUrl" alt="Admin" class="w-6 h-6 object-contain" />
          </div>
          
          <div
            class="max-w-[75%] rounded-xl px-4 py-2.5 shadow-sm transition-all duration-200 bg-gray-100 backdrop-blur-sm border border-gray-300 text-gray-900"
            :class="(message.sender_role === 'user' || message.sender_id === authStore.user?.id)
              ? 'animate-message-sent' 
              : 'animate-message-received'"
          >
            <!-- Image if present -->
            <div v-if="message.image_url" class="mb-2 rounded-lg overflow-hidden">
              <img 
                :src="getImageUrl(message.image_url)" 
                alt="Chat image" 
                class="max-w-full h-auto max-h-48 object-contain rounded-lg cursor-pointer"
                @click="openImageModal(message.image_url)"
              />
            </div>
            <!-- Message text -->
            <p v-if="message.message" class="text-sm whitespace-pre-wrap">{{ message.message }}</p>
            <p class="text-xs mt-1 opacity-70">
              {{ formatTime(message.created_at) }}
            </p>
          </div>

          <!-- Profile Icon (only for user messages, on the RIGHT) -->
          <div
            v-if="message.sender_role === 'user' || message.sender_id === authStore.user?.id"
            class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0"
          >
            <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Preview Before Sending -->
    <div
      v-if="imagePreview && imagePreview.preview"
      class="border-t border-gray-200 bg-dark/90 backdrop-blur-sm flex-shrink-0 px-4 py-3"
    >
      <div class="flex items-center gap-3">
        <div class="relative">
          <img :src="imagePreview.preview" alt="Preview" class="w-20 h-20 object-cover rounded-lg" />
          <button
            @click="cancelImagePreview"
            class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
          >
            <svg class="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="flex-1">
          <p class="text-gray-900 text-sm font-medium">Image ready to send</p>
          <p class="text-gray-500 text-xs">Click send to upload and send</p>
        </div>
        <button
          @click="sendImagePreview"
          :disabled="uploadingImage || loading"
          class="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-lg text-gray-900 text-sm font-medium transition-colors"
        >
          {{ uploadingImage ? 'Uploading...' : 'Send' }}
        </button>
      </div>
    </div>

    <!-- Input Area - Fixed at bottom (when chat is active) -->
    <div v-if="!chatEnded" class="border-t border-gray-200 bg-dark/90 backdrop-blur-sm flex-shrink-0 z-10">
      <div class="px-4 py-3">
        <form @submit.prevent="() => handleSend()" class="flex items-end gap-3">
          <div class="flex-1 relative">
            <input
              v-model="messageInput"
              type="text"
              placeholder="Type your message..."
              class="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-gray-100 transition-all duration-200 text-sm backdrop-blur-sm"
              :disabled="loading || endingChat"
            />
            <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleImageSelect"
              />
              <button
                type="button"
                @click="fileInput?.click()"
                class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Attach photo"
                :disabled="loading || endingChat"
              >
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
          <button
            type="submit"
            :disabled="(!messageInput.trim() && !uploadingImage) || loading || endingChat || uploadingImage"
            class="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg 
              v-if="!loading && !uploadingImage" 
              class="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <svg 
              v-else 
              class="w-6 h-6 animate-spin" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </form>
      </div>
    </div>

    <!-- Chat Ended Area - Fixed at bottom (replaces input when chat is ended) -->
    <div v-else class="border-t border-gray-200 bg-dark/90 backdrop-blur-sm flex-shrink-0 z-10">
      <div class="px-4 py-4">
        <div class="flex flex-col items-center gap-3">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 class="text-yellow-400 text-sm font-semibold">Chat Ended</h3>
          </div>
          <p class="text-gray-500 text-xs text-center mb-2">
            This conversation has been ended. You can start a new chat to continue.
          </p>
          <div class="flex gap-3 w-full">
            <button
              @click="router.back()"
              class="flex-1 px-4 py-2.5 rounded-full text-sm font-semibold bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <button
              @click="startNewChat"
              :disabled="loading"
              class="flex-1 px-4 py-2.5 rounded-full text-sm font-semibold bg-yellow-500 hover:bg-yellow-400 border border-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style="color: #000000 !important;"
            >
              {{ loading ? 'Starting...' : 'Start New Chat' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Preview Modal (for viewing sent images) -->
    <div
      v-if="selectedImage"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/80 backdrop-blur-sm"
      @click="selectedImage = null"
    >
      <div class="max-w-4xl max-h-[90vh] relative">
        <button
          @click="selectedImage = null"
          class="absolute -top-10 right-0 text-gray-900 hover:text-gray-300 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img :src="selectedImage" alt="Preview" class="max-w-full max-h-[90vh] object-contain rounded-lg" />
      </div>
    </div>

    <!-- End Chat Confirmation Modal -->
    <div
      v-if="showEndChatModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="showEndChatModal = false"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showEndChatModal = false"></div>
      
      <!-- Modal Content -->
      <div class="relative glass-card rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-in">
        <!-- Icon -->
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        <!-- Title -->
        <h3 class="text-gray-900 text-lg font-semibold text-center mb-2">End Chat?</h3>
        
        <!-- Message -->
        <p class="text-gray-600 text-sm text-center mb-6">
          Are you sure you want to end this chat? The chat will be marked as ended, but the conversation history will be preserved.
        </p>

        <!-- Buttons -->
        <div class="flex gap-3">
          <button
            @click="showEndChatModal = false"
            class="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-gray-900 text-sm font-medium transition-all duration-200"
          >
            Cancel
          </button>
          <button
            @click="confirmEndChat"
            :disabled="endingChat"
            class="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-gray-900 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg 
              v-if="endingChat" 
              class="w-4 h-4 animate-spin" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{{ endingChat ? 'Deleting...' : 'End Chat' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick, h } from 'vue';
import { useRouter } from 'vue-router';
import { useChat } from '../composables/useChat.js';
import { useAuthStore } from '../stores/auth.js';
import api from '../utils/api.js';
import { getApiUrl } from '../utils/config.js';

const logoUrl = new URL('../assets/logo/Logo-Only.png', import.meta.url).href;

const router = useRouter();
const authStore = useAuthStore();
const messageInput = ref('');
const loading = ref(false);
const endingChat = ref(false);
const messagesContainer = ref(null);
const showEndChatModal = ref(false);
const fileInput = ref(null);
const selectedImage = ref(null);
const uploadingImage = ref(false);
const imagePreview = ref(null);

// Icon components - using defineComponent for proper Vue 3 syntax
// Icon components - using render functions with h
const AccountIcon = {
  setup() {
    return () => h('svg', {
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24',
      class: 'w-5 h-5 text-blue-400'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
      })
    ])
  }
};

const WalletIcon = {
  setup() {
    return () => h('svg', {
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24',
      class: 'w-5 h-5 text-green-400'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
      })
    ])
  }
};

const TradingIcon = {
  setup() {
    return () => h('svg', {
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24',
      class: 'w-5 h-5 text-yellow-400'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
      })
    ])
  }
};

const SecurityIcon = {
  setup() {
    return () => h('svg', {
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24',
      class: 'w-5 h-5 text-purple-400'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
      })
    ])
  }
};

const QuestionIcon = {
  setup() {
    return () => h('svg', {
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24',
      class: 'w-5 h-5 text-orange-400'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
      })
    ])
  }
};

// Bot menu options
const botMenuOptions = [
  {
    id: 'account',
    label: 'Account Issues',
    description: 'Password, login, or account settings',
    iconComponent: AccountIcon,
    iconBg: 'bg-blue-500/20',
    message: 'I need help with my account'
  },
  {
    id: 'deposit',
    label: 'Deposit & Withdrawal',
    description: 'Questions about deposits or withdrawals',
    iconComponent: WalletIcon,
    iconBg: 'bg-green-500/20',
    message: 'I have a question about deposits or withdrawals'
  },
  {
    id: 'trading',
    label: 'Trading Support',
    description: 'Spot trading, contracts, or orders',
    iconComponent: TradingIcon,
    iconBg: 'bg-yellow-500/20',
    message: 'I need help with trading'
  },
  {
    id: 'security',
    label: 'Security & Safety',
    description: 'Account security and verification',
    iconComponent: SecurityIcon,
    iconBg: 'bg-purple-500/20',
    message: 'I have a security concern'
  },
  {
    id: 'other',
    label: 'Other Questions',
    description: 'General inquiries or other issues',
    iconComponent: QuestionIcon,
    iconBg: 'bg-orange-500/20',
    message: 'I have another question'
  }
];

const {
  isConnected,
  messages,
  conversation,
  connect,
  disconnect,
  initializeChat,
  sendMessage,
  joinConversation,
  loadMessages,
  loadConversation,
} = useChat();

// Computed property to check if chat is ended
const chatEnded = computed(() => {
  return conversation.value && (conversation.value.status === 'closed' || conversation.value.status === 'ended');
});

// Computed property to check if user has sent any messages in the CURRENT session
const hasUserMessages = computed(() => {
  // Find the index of the last "Start at" system message
  let lastStartIndex = -1;
  for (let i = messages.value.length - 1; i >= 0; i--) {
    if (messages.value[i].sender_role === 'system' && messages.value[i].message.includes('Start at')) {
      lastStartIndex = i;
      break;
    }
  }
  
  // If there's a "Start" message, check for user messages after it
  // Otherwise, check all messages
  const messagesToCheck = lastStartIndex >= 0 
    ? messages.value.slice(lastStartIndex + 1) 
    : messages.value;
    
  return messagesToCheck.some(msg => msg.sender_role === 'user' || msg.sender_id === authStore.user?.id);
});

// Initialize chat when component mounts
onMounted(async () => {
  connect();
  loading.value = true;
  try {
    await initializeChat();
    console.log('Chat initialized, conversation:', conversation.value);
    // Ensure we're connected and joined to the conversation
    if (conversation.value) {
      // Wait for socket connection if not connected yet
      if (!isConnected.value) {
        // Wait up to 3 seconds for connection
        let waitCount = 0;
        while (!isConnected.value && waitCount < 30) {
          await new Promise(resolve => setTimeout(resolve, 100));
          waitCount++;
        }
      }
      if (isConnected.value) {
        joinConversation(conversation.value.id);
      }
      // Reload messages to get latest
      await loadMessages(conversation.value.id);
    }
  } catch (error) {
    console.error('Failed to initialize chat:', error);
  } finally {
    loading.value = false;
  }
  
  await nextTick();
  // Use setTimeout to ensure DOM is fully updated before scrolling
  setTimeout(() => {
    scrollToBottom(false);
  }, 150);
});

onUnmounted(() => {
  disconnect();
});

const handleSend = async (imageUrl = null) => {
  // Prevent event object from being passed as imageUrl
  if (imageUrl && typeof imageUrl === 'object' && imageUrl.preventDefault) {
    imageUrl = null;
  }
  
  if (!messageInput.value.trim() && !imageUrl) {
    return;
  }

  // If no conversation exists, create one first
  if (!conversation.value) {
    loading.value = true;
    try {
      await initializeChat();
      // Wait a bit for conversation to be set
      await new Promise(resolve => setTimeout(resolve, 100));
      if (!conversation.value) {
        throw new Error('Failed to create conversation');
      }
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
      loading.value = false;
      alert('Failed to start conversation. Please try again.');
      return;
    }
    loading.value = false;
  }

  const message = messageInput.value.trim();
  messageInput.value = '';
  loading.value = true;

  // Optimistically add message immediately for better UX
  const tempMessage = {
    id: `temp-${Date.now()}-${Math.random()}`,
    conversation_id: conversation.value.id,
    sender_id: authStore.user?.id,
    sender_role: 'user',
    message: message || '',
    image_url: imageUrl || null,
    created_at: new Date().toISOString(),
    sender_email: authStore.user?.email || '',
    isOptimistic: true, // Mark as optimistic
  };
  
  // Add optimistic message immediately
  messages.value.push(tempMessage);
  await nextTick();
  scrollToBottom();

  try {
    // Try to send even if not connected (will use REST API fallback)
    const result = await sendMessage(conversation.value.id, message, imageUrl);
    console.log('Message sent successfully:', result);
    
    // Remove optimistic message and replace with real one when received
    // The 'new_message' event will add the real message, and we'll remove the optimistic one
    const optimisticIndex = messages.value.findIndex(m => m.id === tempMessage.id);
    if (optimisticIndex !== -1) {
      // Wait a bit for the real message to arrive via socket
      setTimeout(() => {
        const optimisticMsg = messages.value.find(m => m.id === tempMessage.id);
        if (optimisticMsg && optimisticMsg.isOptimistic) {
          // Real message didn't arrive, remove optimistic one
          const index = messages.value.findIndex(m => m.id === tempMessage.id);
          if (index !== -1) {
            messages.value.splice(index, 1);
          }
        }
      }, 2000);
    }
    
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error('Send message error:', error);
    // Remove optimistic message on error
    const optimisticIndex = messages.value.findIndex(m => m.id === tempMessage.id);
    if (optimisticIndex !== -1) {
      messages.value.splice(optimisticIndex, 1);
    }
    messageInput.value = message; // Restore message on error
    // Show error to user
    alert('Failed to send message: ' + (error.message || 'Unknown error'));
  } finally {
    loading.value = false;
  }
};

const scrollToBottom = (smooth = false) => {
  if (messagesContainer.value) {
    if (smooth) {
      messagesContainer.value.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: 'smooth'
      });
    } else {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  }
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

// Watch for new messages and scroll
watch(messages, () => {
  nextTick(() => {
    // Use setTimeout to ensure DOM is fully updated
    setTimeout(() => {
      scrollToBottom(true);
    }, 100);
  });
}, { deep: true });

// Watch for conversation changes and ensure we're joined to the room
watch(() => conversation.value?.id, (newId, oldId) => {
  if (newId && newId !== oldId && isConnected.value) {
    joinConversation(newId);
    console.log('Conversation changed, rejoining room:', newId);
  }
});

const handleEndChat = () => {
  if (!conversation.value) {
    return;
  }
  showEndChatModal.value = true;
};

const confirmEndChat = async () => {
  if (!conversation.value) {
    showEndChatModal.value = false;
    return;
  }

  endingChat.value = true;
  try {
    await api.delete(`/chat/conversation/${conversation.value.id}`);
    // Update conversation status locally - backend marks it as 'closed'
    if (conversation.value) {
      conversation.value.status = 'closed';
    }
    showEndChatModal.value = false;
    // Scroll to show the chat ended message
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error('End chat error:', error);
    showEndChatModal.value = false;
    alert('Failed to end chat. Please try again.');
  } finally {
    endingChat.value = false;
  }
};

const startNewChat = async () => {
  loading.value = true;
  try {
    // Clear current conversation and messages
    messages.value = [];
    conversation.value = null;
    
    // Initialize a new chat (this will create a new conversation)
    await initializeChat();
    
    // Ensure we're connected and joined to the new conversation
    if (conversation.value && isConnected.value) {
      joinConversation(conversation.value.id);
    }
    
    // Load messages for the new conversation
    if (conversation.value) {
      await loadMessages(conversation.value.id);
    }
    
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error('Failed to start new chat:', error);
    alert('Failed to start new chat. Please try again.');
  } finally {
    loading.value = false;
  }
};

const handleImageSelect = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }

  // Validate file size (10MB)
  if (file.size > 10 * 1024 * 1024) {
    alert('Image size must be less than 10MB');
    return;
  }

  // Store file and create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = {
      file: file,
      preview: e.target.result
    };
  };
  reader.readAsDataURL(file);
};

const cancelImagePreview = () => {
  imagePreview.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const sendImagePreview = async () => {
  if (!imagePreview.value || !imagePreview.value.file) return;

  uploadingImage.value = true;
  try {
    const formData = new FormData();
    formData.append('image', imagePreview.value.file);

    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/chat/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    
    // Send message with image
    await handleSend(data.imageUrl);
    
    // Clear preview
    imagePreview.value = null;
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  } catch (error) {
    console.error('Upload image error:', error);
    alert('Failed to upload image: ' + (error.message || 'Unknown error'));
  } finally {
    uploadingImage.value = false;
  }
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const apiUrl = getApiUrl();
  const baseUrl = apiUrl.replace('/api', '');
  return `${baseUrl}${imagePath}`;
};

const openImageModal = (imageUrl) => {
  selectedImage.value = getImageUrl(imageUrl);
};

const handleBotMenuClick = async (option) => {
  // Ensure conversation exists
  if (!conversation.value) {
    loading.value = true;
    try {
      await initializeChat();
      await new Promise(resolve => setTimeout(resolve, 100));
      if (!conversation.value) {
        throw new Error('Failed to create conversation');
      }
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
      loading.value = false;
      alert('Failed to start conversation. Please try again.');
      return;
    }
    loading.value = false;
  }

  // Ensure we're joined to the conversation room for real-time updates
  if (conversation.value && isConnected.value) {
    joinConversation(conversation.value.id);
  }

  // Send the bot menu message
  const message = option.message;
  
  // Optimistically add message immediately
  const tempMessage = {
    id: `temp-${Date.now()}-${Math.random()}`,
    conversation_id: conversation.value.id,
    sender_id: authStore.user?.id,
    sender_role: 'user',
    message: message,
    image_url: null,
    created_at: new Date().toISOString(),
    sender_email: authStore.user?.email || '',
    isOptimistic: true,
  };
  
  messages.value.push(tempMessage);
  await nextTick();
  scrollToBottom();

  loading.value = true;

  try {
    const result = await sendMessage(conversation.value.id, message);
    console.log('Bot menu message sent:', result);
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error('Failed to send bot menu message:', error);
    // Remove optimistic message on error
    const optimisticIndex = messages.value.findIndex(m => m.id === tempMessage.id);
    if (optimisticIndex !== -1) {
      messages.value.splice(optimisticIndex, 1);
    }
    alert('Failed to send message. Please try again.');
  } finally {
    loading.value = false;
  }
};
</script>
