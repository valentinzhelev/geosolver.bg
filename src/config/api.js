// API Configuration
const PRODUCTION_API_ORIGIN = 'https://geosolver-backend-production.up.railway.app';
const LOCAL_API_ORIGIN = 'http://localhost:5000';

function resolveApiOrigin() {
  // Local dev (npm start on :3000) → always use local backend, even if .env points to Railway
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return LOCAL_API_ORIGIN;
    }
    if (host.includes('geosolver.bg')) {
      return PRODUCTION_API_ORIGIN;
    }
  }

  const fromEnv = process.env.REACT_APP_API_URL?.replace(/\/api\/?$/, '');
  if (fromEnv) return fromEnv;

  return LOCAL_API_ORIGIN;
}

const API_ORIGIN = resolveApiOrigin();
const API_BASE_URL = `${API_ORIGIN}/api`;

console.log('API Configuration:');
console.log('  - REACT_APP_API_URL env var:', process.env.REACT_APP_API_URL);
console.log('  - API_ORIGIN:', API_ORIGIN);
console.log('  - Final API_BASE_URL:', API_BASE_URL);

export { API_ORIGIN };
export default API_BASE_URL;
