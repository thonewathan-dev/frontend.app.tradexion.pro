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
      isConnected.value = false;
    });

    socket.on('connect_error', (error) => {
      console.error('Chat connection error:', error);
      isConnected.value = false;
    });

    socket.on('new_message', (message) => {
      console.log('Received new_message event:', message);
      
      // Remove any optimistic message with the same content from the same sender
      const optimisticIndex = messages.value.findIndex(
        m => m.isOptimistic && 
        m.sender_id === message.sender_id && 
        m.message === message.message &&
        m.image_url === message.image_url
      );
      if (optimisticIndex !== -1) {
        messages.value.splice(optimisticIndex, 1);
        console.log('Removed optimistic message, replacing with real one');
      }
      
      // Only add if not already in messages
      const existingIndex = messages.value.findIndex(m => m.id === message.id);
      if (existingIndex === -1) {
        messages.value.push(message);
        console.log('Added new message to list');
        
        // If user sent message and conversation was closed, reopen it
        if (message.sender_role === 'user' && conversation.value && conversation.value.status === 'closed') {
          conversation.value.status = 'open';
        }
      } else {
        console.log('Message already exists, skipping');
      }
    });
    
    socket.on('chat_ended', () => {
      if (conversation.value) {
        conversation.value.status = 'closed';
      }
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

  const sendMessage = async (conversationId, message, imageUrl = null) => {
    if (socket && socket.connected) {
      console.log('Sending message via Socket.io:', { conversationId, message, imageUrl });
      try {
        socket.emit('send_message', { conversationId, message, imageUrl });
        // Message will be added via 'new_message' event, so we return immediately
        // Return a simple success object
        return { success: true, conversationId, message, imageUrl };
      } catch (error) {
        console.error('Socket emit error:', error);
        throw error;
      }
    } else {
      console.log('Socket not connected, using REST API fallback');
      // Fallback to REST API if Socket.io is not connected
      try {
        const response = await api.post('/chat/message', { conversationId, message, imageUrl });
        console.log('Message sent via REST API:', response.data);
        // Add message to local state if not already added
        if (response.data.message && !messages.value.find(m => m.id === response.data.message.id)) {
          messages.value.push(response.data.message);
        }
        return response.data.message;
      } catch (error) {
        console.error('REST API send error:', error);
        throw error;
      }
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
