/**
 * Configuration utility for API URLs and environment detection
 */

/**
 * Get the API base URL
 * Detects production environment by hostname or environment variable
 * MUST be called at runtime, not at build time
 */
export function getApiUrl() {
  const DEFAULT_PROD_API = 'https://backend.trustxglobal.site/api';
  const DEFAULT_DEV_API = 'http://localhost:3000/api';

  // Build-time / SSR safety: never return localhost
  if (typeof window === 'undefined') {
    return DEFAULT_PROD_API;
  }

  const hostname = window.location.hostname;
  const runningOnLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  // In local dev (actual localhost), always use localhost backend
  if (runningOnLocalhost) {
    return DEFAULT_DEV_API;
  }

  // If VITE_API_URL is set, use it UNLESS it's accidentally pointing to localhost
  const configured = import.meta.env.VITE_API_URL;
  const configuredLooksLocal =
    typeof configured === 'string' &&
    (configured.includes('localhost') || configured.includes('127.0.0.1'));

  // On Railway/production domains, never allow localhost URLs
  const apiUrl = configured && !configuredLooksLocal ? configured : DEFAULT_PROD_API;

  // Log for debugging (only once)
  if (!window.__API_URL_LOGGED) {
    console.log('API Configuration:', {
      hostname,
      apiUrl,
      viteApiUrl: import.meta.env.VITE_API_URL,
      mode: import.meta.env.MODE,
      prodFlag: import.meta.env.PROD,
      runningOnLocalhost,
      configuredLooksLocal,
    });
    window.__API_URL_LOGGED = true;
  }

  return apiUrl;
}

/**
 * Get the current API URL (for use in axios baseURL)
 * This is evaluated at runtime, not at build time
 */
export const API_URL = getApiUrl();

