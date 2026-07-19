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

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    /* ignore */
  }

  if (!response.ok) {
    const msg =
      data.message ||
      data.detail ||
      data.error ||
      getApiErrorFallback(response.status);
    const err = new Error(msg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const surveyPointsApi = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/points${q ? `?${q}` : ''}`);
  },
  create: (body) =>
    request('/points', { method: 'POST', body: JSON.stringify(body) }),
  importMany: (body) =>
    request('/points/import', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) =>
    request(`/points/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id) => request(`/points/${id}`, { method: 'DELETE' }),
};
