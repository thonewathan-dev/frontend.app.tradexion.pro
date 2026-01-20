/**
 * Cached API wrapper for faster loading
 * Automatically caches GET requests and returns cached data when available
 */

import api from './api.js';
import { getCache, setCache } from './cache.js';

/**
 * Make a cached API request
 * @param {string} url - API endpoint
 * @param {object} config - Axios config
 * @param {number} cacheTTL - Cache TTL in milliseconds
 * @returns {Promise} Axios response
 */
export async function cachedGet(url, config = {}, cacheTTL = 2000) {
  // Don't cache auth, wallet, orders, or contract endpoints
  if (url?.includes('/auth/') || 
      url?.includes('/wallet') || 
      url?.includes('/orders') || 
      url?.includes('/contract') ||
      url?.includes('/admin/')) {
    return api.get(url, config);
  }

  const cacheKey = `${url}_${JSON.stringify(config.params || {})}`;
  
  // Check cache first
  const cached = getCache(cacheKey, cacheTTL);
  if (cached) {
    // Return cached data immediately
    return Promise.resolve({
      data: cached,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { url, ...config },
      __cached: true,
    });
  }

  // Make actual request
  try {
    const response = await api.get(url, config);
    
    // Cache the response
    setCache(cacheKey, response.data, cacheTTL);
    
    return response;
  } catch (error) {
    // If request fails but we have stale cache, return it
    const staleCache = getCache(cacheKey, cacheTTL * 10); // Allow 10x TTL for stale data
    if (staleCache) {
      console.warn('Using stale cache due to request failure:', url);
      return Promise.resolve({
        data: staleCache,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url, ...config },
        __cached: true,
        __stale: true,
      });
    }
    
    throw error;
  }
}

// Export other methods without caching
export const cachedPost = api.post.bind(api);
export const cachedPut = api.put.bind(api);
export const cachedDelete = api.delete.bind(api);
export const cachedPatch = api.patch.bind(api);

export default {
  get: cachedGet,
  post: cachedPost,
  put: cachedPut,
  delete: cachedDelete,
  patch: cachedPatch,
};
