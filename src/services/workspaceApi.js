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
    const msg = data.message || data.detail || data.error || getApiErrorFallback(response.status);
    const err = new Error(msg);
    err.status = response.status;
    throw err;
  }

  return data;
}

export const workspaceApi = {
  list: () => request('/workspaces'),
  create: (name) => request('/workspaces', { method: 'POST', body: JSON.stringify({ name }) }),
  join: (inviteCode) => request('/workspaces/join', { method: 'POST', body: JSON.stringify({ inviteCode }) }),
  invite: (id, email, role = 'editor') =>
    request(`/workspaces/${id}/invite`, { method: 'POST', body: JSON.stringify({ email, role }) }),
  updateMemberRole: (id, userId, role) =>
    request(`/workspaces/${id}/members/${userId}`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  removeMember: (id, userId) => request(`/workspaces/${id}/members/${userId}`, { method: 'DELETE' }),
  listProjects: (id) => request(`/workspaces/${id}/projects`),
};
