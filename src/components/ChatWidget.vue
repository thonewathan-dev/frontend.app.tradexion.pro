<template>
  <div>
    <!-- Chat Button (Floating) -->
    <button
      v-if="!isOpen"
      @click="openChat"
      class="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg flex items-center justify-center z-50 transition-all"
      :class="{ 'animate-pulse': hasUnread }"
    >
      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <span
        v-if="hasUnread"
        class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold"
      >
        !
      </span>
    </button>

    <!-- Chat Window -->
    <div
      v-if="isOpen"
      class="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-[calc(100vw-2rem)] md:w-96 h-[calc(100vh-8rem)] md:h-[600px] glass-card rounded-xl shadow-2xl flex flex-col z-50"
    >
      <!-- Header -->
      <div class="glass-card-no-hover border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 10a6 6 0 00-12 0v3H5a2 2 0 00-2 2v1a2 2 0 002 2h3v-4H8v-4a4 4 0 118 0v4h-1v4h3a2 2 0 002-2v-1a2 2 0 00-2-2h-1v-3z" />
            </svg>
          </div>
          <div>
            <h3 class="text-white font-semibold text-sm">Customer Support</h3>
            <p class="text-white/60 text-xs" :class="{ 'text-green-400': isConnected, 'text-red-400': !isConnected }">
              {{ isConnected ? 'Online' : 'Connecting...' }}
            </p>
          </div>
        </div>
        <button
          @click="closeChat"
          class="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <svg class="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Messages -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3">
        <div v-if="messages.length === 0" class="text-center py-8">
          <p class="text-white/60 text-sm">No messages yet. Start a conversation!</p>
        </div>
        <div
          v-for="message in messages"
          :key="message.id"
          class="flex"
          :class="(message.sender_role === 'user' || message.sender_id === authStore.user?.id) ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-[75%] rounded-lg px-4 py-2"
            :class="(message.sender_role === 'user' || message.sender_id === authStore.user?.id)
              ? 'bg-blue-500 text-white' 
              : 'bg-white/10 text-white'"
          >
            <p class="text-sm whitespace-pre-wrap">{{ message.message }}</p>
            <p class="text-xs mt-1 opacity-70">
              {{ formatTime(message.created_at) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="border-t border-white/10 p-4">
        <form @submit.prevent="handleSend" class="flex gap-2">
          <input
            v-model="messageInput"
            type="text"
            placeholder="Type your message..."
            class="flex-1 px-4 py-2 glass-input rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
            :disabled="!isConnected"
          />
          <button
            type="submit"
            :disabled="!messageInput.trim() || loading"
            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium text-sm transition-colors"
          >
            {{ loading ? 'Sending...' : 'Send' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useChat } from '../composables/useChat.js';
import { useAuthStore } from '../stores/auth.js';

const authStore = useAuthStore();
const isOpen = ref(false);
const messageInput = ref('');
const loading = ref(false);
const hasUnread = ref(false);
const messagesContainer = ref(null);

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
} = useChat();

const openChat = async () => {
  isOpen.value = true;
  hasUnread.value = false;
  
  // Always try to initialize/load conversation when opening chat
  if (!conversation.value) {
    loading.value = true;
    try {
      await initializeChat();
      console.log('Chat initialized, conversation:', conversation.value);
      // Ensure we're connected and joined to the conversation
      if (conversation.value && isConnected.value) {
        joinConversation(conversation.value.id);
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      // Don't block the UI, user can still try to send (which will retry initialization)
    } finally {
      loading.value = false;
    }
  } else {
    // If conversation exists, make sure we're joined
    if (isConnected.value && conversation.value) {
      joinConversation(conversation.value.id);
    }
    // Reload messages to get latest
    if (conversation.value) {
      try {
        await loadMessages(conversation.value.id);
      } catch (error) {
        console.error('Failed to reload messages:', error);
      }
    }
  }
  
  await nextTick();
  scrollToBottom();
};

const closeChat = () => {
  isOpen.value = false;
};

const handleSend = async () => {
  if (!messageInput.value.trim()) {
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

  try {
    // Try to send even if not connected (will use REST API fallback)
    const result = await sendMessage(conversation.value.id, message);
    console.log('Message sent successfully:', result);
    // Message will be added via socket 'new_message' event automatically
    // For REST API fallback, it's already added in useChat
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error('Send message error:', error);
    messageInput.value = message; // Restore message on error
    // Show error to user
    alert('Failed to send message: ' + (error.message || 'Unknown error'));
  } finally {
    loading.value = false;
  }
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
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
    scrollToBottom();
    if (!isOpen.value) {
      hasUnread.value = true;
    }
  });
}, { deep: true });

onMounted(() => {
  connect();
});

onUnmounted(() => {
  disconnect();
});
</script>
