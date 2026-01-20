/**
 * Image caching utility for faster image loading
 */

const IMAGE_CACHE = new Map();
const MAX_IMAGE_CACHE = 100;

/**
 * Preload and cache an image
 * @param {string} src - Image source URL
 * @returns {Promise<string>} Resolves with the image URL
 */
export function cacheImage(src) {
  // Return cached version if available
  if (IMAGE_CACHE.has(src)) {
    return Promise.resolve(IMAGE_CACHE.get(src));
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      // Try to store in browser cache using canvas
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        // Convert to blob URL for caching
        canvas.toBlob((blob) => {
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            IMAGE_CACHE.set(src, blobUrl);
            
            // Limit cache size
            if (IMAGE_CACHE.size > MAX_IMAGE_CACHE) {
              const firstKey = IMAGE_CACHE.keys().next().value;
              const oldUrl = IMAGE_CACHE.get(firstKey);
              if (oldUrl && oldUrl.startsWith('blob:')) {
                URL.revokeObjectURL(oldUrl);
              }
              IMAGE_CACHE.delete(firstKey);
            }
          }
          resolve(src);
        }, 'image/png');
      } catch (error) {
        // Fallback to original src
        IMAGE_CACHE.set(src, src);
        resolve(src);
      }
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`));
    };
    
    // Set crossOrigin for CORS images
    if (src.startsWith('http')) {
      img.crossOrigin = 'anonymous';
    }
    
    img.src = src;
  });
}

/**
 * Get cached image URL
 * @param {string} src - Image source URL
 * @returns {string|null} Cached URL or null
 */
export function getCachedImage(src) {
  return IMAGE_CACHE.get(src) || null;
}

/**
 * Preload multiple images
 * @param {string[]} sources - Array of image sources
 * @returns {Promise<void>}
 */
export function preloadImages(sources) {
  return Promise.allSettled(
    sources.map(src => cacheImage(src).catch(() => {}))
  );
}

/**
 * Clear image cache
 */
export function clearImageCache() {
  IMAGE_CACHE.forEach((url) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });
  IMAGE_CACHE.clear();
}
