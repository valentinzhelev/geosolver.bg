import API_BASE_URL from '../config/api';
import { getApiLanguageHeaders } from '../utils/apiLanguage';

/**
 * Report / Document Engine V2.5 API client. The server resolves and renders everything from persisted
 * authoritative data; the client only identifies WHICH report to generate (type, project, optional source run id)
 * and, once generated, asks for the exact stored PDF.
 */
export class ReportsApiError extends Error {
  constructor(status, body) {
    super((body && body.message) || 'Грешка при заявката.');
    this.name = 'ReportsApiError';
    this.status = status;
    this.code = (body && body.code) || null;
  }
}

function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

async function request(path, { method = 'GET', body, raw = false } = {}) {
  const token = getToken();
  const headers = getApiLanguageHeaders({
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(body ? { 'Content-Type': 'application/json' } : {}),
  });
  const response = await fetch(`${API_BASE_URL}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (raw && response.ok) return response;
  let data = {};
  try {
    data = await response.json();
  } catch {
    /* non-JSON error body (e.g. a raw PDF response that failed) */
  }
  if (!response.ok) throw new ReportsApiError(response.status, data);
  return data;
}

export const reportsApi = {
  /** @param {{reportType:'POLAR_PROCESSING_REPORT'|'TRAVERSE_PROCESSING_REPORT'|'PROJECT_COORDINATE_LIST', projectId:string, sourceId?:string, documentNumber?:string}} opts */
  createReport: (opts) => request('/reports', { method: 'POST', body: opts }).then((r) => r.data),
  listReports: (projectId) => request(`/reports?projectId=${encodeURIComponent(projectId)}`).then((r) => r.data),
  getReport: (id) => request(`/reports/${id}`).then((r) => r.data),
  /** The PDF needs the Authorization header, so it is fetched and turned into an object URL (same pattern as
   *  captureApi.fetchImageObjectUrl for the review image). */
  async getFileObjectUrl(id) {
    const response = await request(`/reports/${id}/file`, { raw: true });
    return URL.createObjectURL(await response.blob());
  },
};
