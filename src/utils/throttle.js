/**
 * Throttle function to limit how often a function can be called
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, delay) {
  let lastCall = 0;
  let timeoutId = null;
  
  return function (...args) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;
    
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // If enough time has passed, call immediately
    if (timeSinceLastCall >= delay) {
      lastCall = now;
      func.apply(this, args);
    } else {
      // Otherwise, schedule for later
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        func.apply(this, args);
      }, delay - timeSinceLastCall);
    }
  };
}

/**
 * Debounce function to delay execution until after wait time
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeoutId = null;
  
  return function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}
