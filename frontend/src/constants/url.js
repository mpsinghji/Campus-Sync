// Backend URL Configuration
const LOCAL_URL = 'http://localhost:5000/';
const PRODUCTION_URL = 'https://campus-sync-ez7y.onrender.com/';

// Prioritize environment variable, then dynamic origin detection
export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? LOCAL_URL
    : PRODUCTION_URL);

if (import.meta.env.DEV) {
  console.log('Current hostname:', typeof window !== "undefined" ? window.location.hostname : "ssr");
  console.log('Using backend URL:', BACKEND_URL);
}