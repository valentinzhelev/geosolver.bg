// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('🌐 API Configuration:');
console.log('  - REACT_APP_API_URL env var:', process.env.REACT_APP_API_URL);
console.log('  - Final API_BASE_URL:', API_BASE_URL);

export default API_BASE_URL;
