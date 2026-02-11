/**
 * Browser cache utility for storing temporary data
 * Uses localStorage for persistent cache and memory cache for session data
 */

const MEMORY_CACHE = new Map();
const CACHE_PREFIX = 'TrustXGlobal_cache_';
const MAX_CACHE_SIZE = 50; // Maximum number of cached items

/**
 * Get cached data
 * @param {string} key - Cache key
 * @param {number} maxAge - Maximum age in milliseconds (default: 5 minutes)
 * @returns {any|null} Cached data or null if expired/not found
 */
export function getCache(key, maxAge = 5 * 60 * 1000) {
  try {
    // Check memory cache first (fastest)
    const memoryItem = MEMORY_CACHE.get(key);
    if (memoryItem) {
      if (Date.now() - memoryItem.timestamp < maxAge) {
        return memoryItem.data;
      }
      MEMORY_CACHE.delete(key);
    }

    // Check localStorage
    const stored = localStorage.getItem(CACHE_PREFIX + key);
    if (!stored) return null;

    const item = JSON.parse(stored);
    const age = Date.now() - item.timestamp;

    if (age > maxAge) {
      // Expired, remove it
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    // Update memory cache
    MEMORY_CACHE.set(key, item);

    return item.data;
  } catch (error) {
    console.warn('Cache get error:', error);
    return null;
  }
}

/**
 * Set cached data
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
 */
export function setCache(key, data, ttl = 5 * 60 * 1000) {
  try {
    const item = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    // Store in memory cache
    MEMORY_CACHE.set(key, item);

    // Store in localStorage
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));

    // Cleanup old cache if too large
    if (MEMORY_CACHE.size > MAX_CACHE_SIZE) {
      const firstKey = MEMORY_CACHE.keys().next().value;
      MEMORY_CACHE.delete(firstKey);
    }

    // Cleanup localStorage if too large
    cleanupOldCache();
  } catch (error) {
    // localStorage might be full, try to clean up
    if (error.name === 'QuotaExceededError') {
      console.warn('LocalStorage full, cleaning up...');
      clearOldCache();
      try {
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
          data,
          timestamp: Date.now(),
          ttl,
        }));
      } catch (e) {
        console.warn('Failed to cache after cleanup:', e);
      }
    } else {
      console.warn('Cache set error:', error);
    }
  }
}

/**
 * Remove cached data
 * @param {string} key - Cache key
 */
export function removeCache(key) {
  MEMORY_CACHE.delete(key);
  localStorage.removeItem(CACHE_PREFIX + key);
}

/**
 * Clear all cache
 */
export function clearCache() {
  MEMORY_CACHE.clear();
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Cleanup old cache entries
 */
function cleanupOldCache() {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    
    if (cacheKeys.length > MAX_CACHE_SIZE) {
      // Sort by timestamp and remove oldest
      const items = cacheKeys.map(key => {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          return { key, timestamp: item.timestamp };
        } catch {
          return { key, timestamp: 0 };
        }
      }).sort((a, b) => a.timestamp - b.timestamp);

      // Remove oldest items
      const toRemove = items.slice(0, items.length - MAX_CACHE_SIZE);
      toRemove.forEach(({ key }) => {
        localStorage.removeItem(key);
        MEMORY_CACHE.delete(key.replace(CACHE_PREFIX, ''));
      });
    }
  } catch (error) {
    console.warn('Cache cleanup error:', error);
  }
}

/**
 * Clear expired cache entries
 */
function clearOldCache() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          const age = Date.now() - item.timestamp;
          if (age > item.ttl) {
            localStorage.removeItem(key);
            MEMORY_CACHE.delete(key.replace(CACHE_PREFIX, ''));
          }
        } catch {
          // Invalid cache entry, remove it
          localStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.warn('Clear old cache error:', error);
  }
}

// Cleanup on load
if (typeof window !== 'undefined') {
  clearOldCache();
  
  // Cleanup every 10 minutes
  setInterval(clearOldCache, 10 * 60 * 1000);
}
