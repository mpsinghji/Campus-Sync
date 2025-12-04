// Backend URL Configuration
const LOCAL_URL = 'http://localhost:5000/';
const PRODUCTION_URL = 'https://campus-sync-ez7y.onrender.com/';

// Use local URL only when running on localhost
export const BACKEND_URL = window.location.hostname === 'localhost' 
  ? LOCAL_URL 
  : PRODUCTION_URL;

// export const BACKEND_URL = PRODUCTION_URL;

// Log which URL is being used
console.log('Current hostname:', window.location.hostname);
console.log('Using backend URL:', BACKEND_URL);