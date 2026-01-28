import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import api from '../utils/api';
import { getApiUrl } from '../utils/config.js';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const accessToken = ref(localStorage.getItem('accessToken') || null);
  const refreshToken = ref(localStorage.getItem('refreshToken') || null);
  const refreshInFlight = ref(null);

  const isAuthenticated = computed(() => {
    // If we have a token, consider authenticated (user will be loaded async)
    // This prevents auto-logout on page reload
    return !!accessToken.value;
  });

  const login = async (email, password, turnstileToken) => {
    try {
      if (!turnstileToken) {
        return { success: false, error: 'CAPTCHA verification required. Please complete the CAPTCHA.' };
      }
      
      const response = await api.post('/auth/login', { email, password, turnstileToken });
      accessToken.value = response.data.accessToken;
      refreshToken.value = response.data.refreshToken;
      user.value = response.data.user;
      
      localStorage.setItem('accessToken', accessToken.value);
      localStorage.setItem('refreshToken', refreshToken.value);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      
      // Provide more specific error messages
      if (error.response?.status === 401) {
        if (errorMessage.includes('CAPTCHA') || errorMessage.includes('captcha')) {
          return { success: false, error: 'CAPTCHA verification failed. Please try again.' };
        }
        if (errorMessage.includes('verified')) {
          return { success: false, error: 'Please verify your email before logging in.' };
        }
        return { success: false, error: 'Invalid email or password. Please check your credentials.' };
      }
      if (error.response?.status === 403) {
        if (errorMessage.includes('banned') || errorMessage.includes('suspended')) {
          return { success: false, error: 'Your account has been suspended. Please contact support.' };
        }
        if (errorMessage.includes('verified') || errorMessage.includes('Email not verified')) {
          return { success: false, error: 'Please verify your email before logging in. Check your inbox for the verification code.' };
        }
        return { success: false, error: errorMessage };
      }
      if (error.response?.status === 400) {
        return { success: false, error: errorMessage };
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const register = async (email, password, turnstileToken, inviteCode) => {
    try {
      const response = await api.post('/auth/register', { email, password, turnstileToken, inviteCode });
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

  const resendVerificationCode = async (email) => {
    try {
      await api.post('/auth/resend-verification', { email });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to resend verification code' };
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      await api.post('/auth/password/reset-request', { email });
      return { success: true };
    } catch (error) {
      const errorCode = error.response?.data?.error;
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to request password reset';
      return { success: false, error: errorCode || errorMessage, message: errorMessage };
    }
  };

  const verifyPasswordResetCode = async (email, code) => {
    try {
      await api.post('/auth/password/verify-code', { email, code });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Invalid or expired code' };
    }
  };

  const resetPassword = async (email, code, newPassword) => {
    try {
      await api.post('/auth/password/reset', { email, code, newPassword });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to reset password' };
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
      // Add timestamp to prevent caching
      const response = await api.get('/auth/me', {
        params: { _t: Date.now() }
      });
      // Force update by creating a new object reference
      user.value = { ...response.data.user };
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
      // Deduplicate concurrent refreshes (important when many requests fail at once)
      if (refreshInFlight.value) {
        return await refreshInFlight.value;
      }

      refreshInFlight.value = (async () => {
        // Use a direct axios call (no interceptors) to avoid refresh loops.
        const baseURL = getApiUrl();
        const response = await axios.post(
          `${baseURL}/auth/refresh`,
          { refreshToken: refreshToken.value },
          { headers: { 'Content-Type': 'application/json' } }
        );

        accessToken.value = response.data.accessToken;
        refreshToken.value = response.data.refreshToken;
        localStorage.setItem('accessToken', accessToken.value);
        localStorage.setItem('refreshToken', refreshToken.value);
        return true;
      })();

      return await refreshInFlight.value;
    } catch (error) {
      logout();
      return false;
    } finally {
      refreshInFlight.value = null;
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
    resendVerificationCode,
    requestPasswordReset,
    verifyPasswordResetCode,
    resetPassword,
    loginWithPhone,
    logout,
    fetchCurrentUser,
    refreshAccessToken,
  };
});
