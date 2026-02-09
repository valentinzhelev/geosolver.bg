// API Configuration
const DEFAULT_API_ORIGIN = typeof window !== 'undefined' && window.location.hostname.includes('geosolver.bg')
  ? 'https://geosolver-backend-production.up.railway.app'
  : 'http://localhost:5000';

const API_ORIGIN = process.env.REACT_APP_API_URL?.replace('/api', '') || DEFAULT_API_ORIGIN;
const API_BASE_URL = `${API_ORIGIN}/api`;

console.log('API Configuration:');
console.log('  - REACT_APP_API_URL env var:', process.env.REACT_APP_API_URL);
console.log('  - API_ORIGIN:', API_ORIGIN);
console.log('  - Final API_BASE_URL:', API_BASE_URL);

export { API_ORIGIN };
export default API_BASE_URL;
