import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../utils/api';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const accessToken = ref(localStorage.getItem('accessToken') || null);
  const refreshToken = ref(localStorage.getItem('refreshToken') || null);

  const isAuthenticated = computed(() => {
    // If we have a token, consider authenticated (user will be loaded async)
    // This prevents auto-logout on page reload
    return !!accessToken.value;
  });

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      accessToken.value = response.data.accessToken;
      refreshToken.value = response.data.refreshToken;
      user.value = response.data.user;
      
      localStorage.setItem('accessToken', accessToken.value);
      localStorage.setItem('refreshToken', refreshToken.value);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const register = async (email, password) => {
    try {
      const response = await api.post('/auth/register', { email, password });
      return { 
        success: true, 
        data: response.data,
        emailVerified: response.data.emailVerified || false,
        otp: response.data.otp || null
      };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    }
  };

  const verifyEmail = async (email, code) => {
    try {
      await api.post('/auth/verify-email', { email, code });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Verification failed' };
    }
  };

  const loginWithPhone = async (phone) => {
    try {
      const response = await api.post('/auth/login/phone', { phone });
      accessToken.value = response.data.accessToken;
      refreshToken.value = response.data.refreshToken;
      user.value = response.data.user;
      
      localStorage.setItem('accessToken', accessToken.value);
      localStorage.setItem('refreshToken', refreshToken.value);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const logout = () => {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      user.value = response.data.user;
      return { success: true };
    } catch (error) {
      // Only logout if it's a 401 (unauthorized) - token is invalid
      // For other errors (network, etc.), keep the token and retry later
      if (error.response?.status === 401) {
        logout();
      }
      return { success: false };
    }
  };

  const refreshAccessToken = async () => {
    try {
      const response = await api.post('/auth/refresh', { refreshToken: refreshToken.value });
      accessToken.value = response.data.accessToken;
      refreshToken.value = response.data.refreshToken;
      localStorage.setItem('accessToken', accessToken.value);
      localStorage.setItem('refreshToken', refreshToken.value);
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  // Initialize: try to restore user if token exists (called after all functions are defined)
  const initialize = () => {
    if (accessToken.value) {
      fetchCurrentUser().catch(() => {
        // If fetch fails, tokens might be invalid, but don't clear immediately
        // Let the router guard handle it
      });
    }
  };

  // Call initialize after store is created
  initialize();

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    login,
    register,
    verifyEmail,
    loginWithPhone,
    logout,
    fetchCurrentUser,
    refreshAccessToken,
  };
});
