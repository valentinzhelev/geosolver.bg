import API_BASE_URL from '../config/api';
import { getApiLanguageHeaders } from '../utils/apiLanguage';

/**
 * Field Sessions (Теренна сесия) API client. Entries are sent as RAW TEXT exactly as typed; the server interprets,
 * validates and confirms them (nothing here parses a number, computes anything or decides a status).
 * Same fetch/auth/error conventions as reportsApi.js / gaiApi.js - no new wrapper pattern.
 */
export class FieldSessionsApiError extends Error {
  constructor(status, body) {
    super((body && body.message) || 'Грешка при заявката.');
    this.name = 'FieldSessionsApiError';
    this.status = status;
    this.code = (body && body.code) || null;
    this.errors = (body && body.errors) || null; // located validation errors of a refused confirm
    this.summary = (body && body.summary) || null;
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
    throw new FieldSessionsApiError(0, { code: 'NETWORK_ERROR' }); // the browser's English "Failed to fetch" is never shown
  }
  let data = {};
  try {
    data = await response.json();
  } catch {
    /* non-JSON error body */
  }
  if (!response.ok) throw new FieldSessionsApiError(response.status, data);
  return data;
}

export const fieldSessionsApi = {
  /** @returns {Promise<{sessions: object[], attachedCaptureJobIds: string[], legacyFieldBooks: {total:number, active:number}}>} */
  list: (projectId) => request(`/field-sessions?projectId=${encodeURIComponent(projectId)}`).then((r) => ({
    sessions: r.data || [],
    attachedCaptureJobIds: r.attachedCaptureJobIds || [],
    legacyFieldBooks: r.legacyFieldBooks || { total: 0, active: 0 },
  })),
  get: (id) => request(`/field-sessions/${id}`).then((r) => r.data),
  create: (body) => request('/field-sessions', { method: 'POST', body }).then((r) => r.data),
  /** PATCH: any of the optional metadata fields and/or `setups`, with the revision the edit was based on. */
  update: (id, body) => request(`/field-sessions/${id}`, { method: 'PATCH', body }).then((r) => r.data),
  submit: (id) => request(`/field-sessions/${id}/submit`, { method: 'POST', body: {} }).then((r) => r.data),
  /** @returns {Promise<{data: object, alreadyConfirmed: boolean}>} */
  confirm: (id) => request(`/field-sessions/${id}/confirm`, { method: 'POST', body: {} }).then((r) => ({ data: r.data, alreadyConfirmed: !!r.alreadyConfirmed })),
  /** Multi-page notebooks: add a page (a Field Notebook capture) at the end, or at `position` (0-based). */
  attachPage: (id, captureJobId, { position, baseRevision } = {}) => request(`/field-sessions/${id}/pages`, {
    method: 'POST',
    body: { captureJobId, ...(position !== undefined ? { position } : {}), ...(baseRevision !== undefined ? { baseRevision } : {}) },
  }).then((r) => r.data),
  /** Detach a page (the capture itself is never deleted). */
  detachPage: (id, pageId, baseRevision) => request(`/field-sessions/${id}/pages/${encodeURIComponent(pageId)}${baseRevision !== undefined ? `?baseRevision=${baseRevision}` : ''}`, { method: 'DELETE' }).then((r) => r.data),
  /** Set the page order: exactly the current page ids, in the new order. Never re-runs OCR. */
  reorderPages: (id, pageIds, baseRevision) => request(`/field-sessions/${id}/pages/reorder`, {
    method: 'PATCH',
    body: { pageIds, ...(baseRevision !== undefined ? { baseRevision } : {}) },
  }).then((r) => r.data),
  attachCapture: (id, captureJobId) => request(`/field-sessions/${id}/attach-capture`, { method: 'POST', body: { captureJobId } }).then((r) => r.data),
  revise: (id) => request(`/field-sessions/${id}/revise`, { method: 'POST', body: {} }).then((r) => r.data),
  remove: (id) => request(`/field-sessions/${id}`, { method: 'DELETE' }).then(() => true),
};
