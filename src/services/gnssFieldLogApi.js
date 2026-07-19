import API_BASE_URL from '../config/api';
import { getApiLanguageHeaders, getApiErrorFallback } from '../utils/apiLanguage';

function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...getApiLanguageHeaders(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  let data = {};
  try {
    data = await response.json();
  } catch {
    /* ignore */
  }
  if (!response.ok) {
    const err = new Error(data.message || data.detail || data.error || getApiErrorFallback(response.status));
    err.status = response.status;
    throw err;
  }
  return data;
}

export const gnssFieldLogApi = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/gnss-field-log${q ? `?${q}` : ''}`);
  },
  create: (body) => request('/gnss-field-log', { method: 'POST', body: JSON.stringify(body) }),
  remove: (id) => request(`/gnss-field-log/${id}`, { method: 'DELETE' }),
  importMany: (entries) =>
    request('/gnss-field-log/import', { method: 'POST', body: JSON.stringify({ entries }) }),
};