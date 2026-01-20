import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import { getCache, setCache } from './cache.js';
import { getApiUrl } from './config.js';

// Create axios instance - baseURL will be set dynamically in interceptor
const api = axios.create({
  baseURL: '', // Will be set dynamically
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token and refresh if needed
api.interceptors.request.use(
  async (config) => {
    // Always set baseURL dynamically at request time (ensures correct URL even after build)
    config.baseURL = getApiUrl();
    
    const authStore = useAuthStore();
    
    // Check cache for GET requests (except auth and user-specific endpoints)
    if (config.method === 'get' && 
        !config.url?.includes('/auth/') && 
        !config.url?.includes('/wallet') && 
        !config.url?.includes('/orders') && 
        !config.url?.includes('/contract') &&
        !config.url?.includes('/admin/')) {
      const cacheKey = `${config.url}_${JSON.stringify(config.params || {})}`;
      const cached = getCache(cacheKey, 2000); // 2 second cache for market data
      
      if (cached) {
        // Store cached data in config for response interceptor
        config.__cached = true;
        config.__cachedData = cached;
      }
    }
    
    // Check if token is about to expire (within 2 minutes) and refresh proactively
    if (authStore.accessToken) {
      try {
        // Decode token to check expiration (without verification)
        const tokenParts = authStore.accessToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const expirationTime = payload.exp * 1000; // Convert to milliseconds
          const currentTime = Date.now();
          const timeUntilExpiry = expirationTime - currentTime;
          
          // If token expires in less than 2 minutes, refresh it
          if (timeUntilExpiry < 120000 && authStore.refreshToken) {
            console.log('Token expiring soon, refreshing...');
            await authStore.refreshAccessToken();
          }
        }
      } catch (err) {
        // If token parsing fails, continue with current token
        console.warn('Token parsing error:', err);
      }
      
      if (authStore.accessToken) {
        config.headers.Authorization = `Bearer ${authStore.accessToken}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh, errors, and caching
api.interceptors.response.use(
  (response) => {
    // Return cached data immediately if available
    if (response.config.__cached && response.config.__cachedData) {
      return {
        ...response,
        data: response.config.__cachedData,
        __cached: true,
      };
    }
    
    // Cache GET responses (except auth endpoints)
    if (response.config.method === 'get' && !response.config.__cached && !response.config.url?.includes('/auth/') && !response.config.url?.includes('/wallet') && !response.config.url?.includes('/orders') && !response.config.url?.includes('/contract') && !response.config.url?.includes('/admin/')) {
      const cacheKey = `${response.config.url}_${JSON.stringify(response.config.params || {})}`;
      // Cache for different durations based on endpoint
      let ttl = 2000; // Default 2 seconds
      if (response.config.url?.includes('/market/ticker')) {
        ttl = 2000; // 2 seconds for tickers
      } else if (response.config.url?.includes('/market/klines')) {
        ttl = 3000; // 3 seconds for klines
      } else if (response.config.url?.includes('/market/orderbook')) {
        ttl = 1000; // 1 second for orderbook
      } else if (response.config.url?.includes('/market/trades')) {
        ttl = 1000; // 1 second for trades
      }
      setCache(cacheKey, response.data, ttl);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const authStore = useAuthStore();
      
      // Try to refresh the token
      if (authStore.refreshToken) {
        const refreshed = await authStore.refreshAccessToken();
        
        if (refreshed && authStore.accessToken) {
          // Retry the original request with new token
          originalRequest.baseURL = getApiUrl(); // Ensure baseURL is correct
          originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`;
          return api(originalRequest);
        }
      }
      
      // If refresh failed, logout user
      authStore.logout();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        config: error.config?.url,
      });
      // Don't reject immediately, might be temporary network issue
      // But log it for debugging
    }
    
    return Promise.reject(error);
  }
);

export default api;
