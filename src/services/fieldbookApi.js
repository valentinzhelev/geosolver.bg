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

export const fieldbookPilotApi = {
  requestAccess: (message) =>
    request('/fieldbook-pilot/request', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
  getAccess: () => request('/fieldbook-pilot/me'),
  listRequestsAdmin: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/fieldbook-pilot/admin/list${q ? `?${q}` : ''}`);
  },
  reviewRequestAdmin: (id, body) =>
    request(`/fieldbook-pilot/admin/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  archiveRequestAdmin: (id) =>
    request(`/fieldbook-pilot/admin/${id}/archive`, { method: 'PATCH' }),
  deleteRequestAdmin: (id) =>
    request(`/fieldbook-pilot/admin/${id}`, { method: 'DELETE' }),
};

export const fieldbooksApi = {
  listProjects: () => request('/fieldbooks/projects'),
  createProject: (body) =>
    request('/fieldbooks/projects', { method: 'POST', body: JSON.stringify(body) }),
  updateProject: (id, body) =>
    request(`/fieldbooks/projects/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteProject: (id) =>
    request(`/fieldbooks/projects/${id}`, { method: 'DELETE' }),

  listBooks: (projectId) => request(`/fieldbooks/projects/${projectId}/books`),
  createBook: (projectId, body) =>
    request(`/fieldbooks/projects/${projectId}/books`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getBook: (id) => request(`/fieldbooks/books/${id}`),
  updateBook: (id, body) =>
    request(`/fieldbooks/books/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  calculateBook: (id, body = {}) =>
    request(`/fieldbooks/books/${id}/calculate`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  deleteBook: (id) => request(`/fieldbooks/books/${id}`, { method: 'DELETE' }),
  copyBook: (id) => request(`/fieldbooks/books/${id}/copy`, { method: 'POST' }),
};
