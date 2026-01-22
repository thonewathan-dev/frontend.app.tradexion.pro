import { ref, onUnmounted } from 'vue';
import { io } from 'socket.io-client';
import { useAuthStore } from '../stores/auth';
import { getApiUrl } from '../utils/config.js';
import api from '../utils/api.js';

let socket = null;
const isConnected = ref(false);
const messages = ref([]);
const conversation = ref(null);

export function useChat() {
  const authStore = useAuthStore();

  const connect = () => {
    if (socket?.connected) {
      return;
    }

    if (!authStore.accessToken) {
      console.error('Cannot connect to chat: No access token');
      return;
    }

    // Get WebSocket URL from API URL
    const apiUrl = getApiUrl();
    const wsUrl = apiUrl.replace('/api', '').replace('http://', 'ws://').replace('https://', 'wss://');

    socket = io(wsUrl, {
      auth: {
        token: authStore.accessToken,
      },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Chat connected');
      isConnected.value = true;
    });

    socket.on('disconnect', () => {
      console.log('Chat disconnected');
      isConnected.value = false;
    });

    socket.on('error', (error) => {
      console.error('Chat error:', error);
    });

    socket.on('new_message', (message) => {
      messages.value.push(message);
    });

    socket.on('joined_conversation', (data) => {
      console.log('Joined conversation:', data.conversationId);
    });
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      socket = null;
      isConnected.value = false;
    }
  };

  const loadConversation = async () => {
    try {
      const response = await api.get('/chat/conversation');
      conversation.value = response.data.conversation;
      return conversation.value;
    } catch (error) {
      console.error('Load conversation error:', error);
      throw error;
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await api.get(`/chat/conversation/${conversationId}/messages`);
      messages.value = response.data.messages;
      return messages.value;
    } catch (error) {
      console.error('Load messages error:', error);
      throw error;
    }
  };

  const joinConversation = (conversationId) => {
    if (socket && socket.connected) {
      socket.emit('join_conversation', conversationId);
    }
  };

  const sendMessage = (conversationId, message) => {
    if (socket && socket.connected) {
      socket.emit('send_message', { conversationId, message });
    } else {
      // Fallback to REST API if Socket.io is not connected
      return api.post('/chat/message', { conversationId, message });
    }
  };

  const initializeChat = async () => {
    try {
      connect();
      const conv = await loadConversation();
      if (conv) {
        joinConversation(conv.id);
        await loadMessages(conv.id);
      }
    } catch (error) {
      console.error('Initialize chat error:', error);
    }
  };

  onUnmounted(() => {
    disconnect();
  });

  return {
    isConnected,
    messages,
    conversation,
    connect,
    disconnect,
    loadConversation,
    loadMessages,
    joinConversation,
    sendMessage,
    initializeChat,
  };
}
