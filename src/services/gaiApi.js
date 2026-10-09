import API_BASE_URL from '../config/api';
import { getApiLanguageHeaders } from '../utils/apiLanguage';

/**
 * GAI V1 Project Geodetic Assistant API client. Read-only assistant: every call either reads persisted project
 * data through the server's grounded context layer, or manages the chat's own conversation/message records - never
 * a write to project/geodetic data itself.
 */
export class GaiApiError extends Error {
  constructor(status, body) {
    super((body && body.message) || 'Грешка при заявката.');
    this.name = 'GaiApiError';
    this.status = status;
    this.code = (body && body.code) || null;
  }
}

function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

async function request(path, { method = 'GET', body } = {}) {
  const token = getToken();
  const headers = getApiLanguageHeaders({
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(body ? { 'Content-Type': 'application/json' } : {}),
  });
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    // the browser's own network error text ("Failed to fetch") is English and meaningless to users
    throw new GaiApiError(0, { code: 'NETWORK_ERROR' });
  }
  let data = {};
  try {
    data = await response.json();
  } catch {
    /* non-JSON error body */
  }
  if (!response.ok) throw new GaiApiError(response.status, data);
  return data;
}

export const gaiApi = {
  createConversation: (projectId) => request('/gai/conversations', { method: 'POST', body: { projectId } }).then((r) => r.data),
  listConversations: (projectId) => request(`/gai/conversations?projectId=${encodeURIComponent(projectId)}`).then((r) => r.data),
  getConversation: (id) => request(`/gai/conversations/${id}`).then((r) => r.data),
  /** @returns {Promise<{message:object, evidence:Array}>} */
  sendMessage: (conversationId, text) => request(`/gai/conversations/${conversationId}/messages`, { method: 'POST', body: { text } }).then((r) => r.data),
  /** Context-aware starter questions (Bulgarian), built server-side from the project's real data. */
  getStarters: (projectId) => request(`/gai/starters?projectId=${encodeURIComponent(projectId)}`).then((r) => r.data),
};
