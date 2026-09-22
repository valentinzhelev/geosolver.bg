import API_BASE_URL from '../config/api';
import { getApiLanguageHeaders } from '../utils/apiLanguage';
import { notifySurveyPointsChanged } from '../utils/surveyPointsEvents';

/**
 * Capture V2.1 API client. The server is the single source of truth for interpretation and validation: the client
 * only uploads, sends corrections / column choices, and asks for the explicit confirmation.
 */
export class CaptureApiError extends Error {
  constructor(status, body) {
    super((body && body.message) || 'Грешка при заявката.');
    this.name = 'CaptureApiError';
    this.status = status;
    this.code = (body && body.code) || null;
    this.conflicts = (body && body.conflicts) || null; // POINT_CONFLICTS
    this.errors = (body && body.errors) || null; // VALIDATION_ERRORS
    this.jobId = (body && body.jobId) || null;
  }
}

function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

async function request(path, { method = 'GET', body, formData, raw = false } = {}) {
  const token = getToken();
  const headers = getApiLanguageHeaders({
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(body ? { 'Content-Type': 'application/json' } : {}),
  });
  const response = await fetch(`${API_BASE_URL}${path}`, { method, headers, body: formData || (body ? JSON.stringify(body) : undefined) });
  if (raw && response.ok) return response;
  let data = {};
  try {
    data = await response.json();
  } catch {
    /* non-JSON error body */
  }
  if (!response.ok) {
    // the pro gate answers with { error, message } and no code
    throw new CaptureApiError(response.status, response.status === 402 ? { ...data, code: 'PRO_REQUIRED' } : data);
  }
  return data;
}

export const captureApi = {
  /** @param {'coordinate-table'|'field-notebook'} mode */
  createJob: (file, projectId, mode = 'coordinate-table') => {
    const form = new FormData();
    form.append('projectId', projectId);
    form.append('mode', mode);
    form.append('image', file);
    return request('/capture/jobs', { method: 'POST', formData: form }).then((r) => r.data);
  },
  getJob: (id) => request(`/capture/jobs/${id}`).then((r) => r.data),
  /** V2.2 Capture history: recent jobs for a project (summaries only). */
  listJobs: (projectId) => request(`/capture/jobs?projectId=${encodeURIComponent(projectId)}`).then((r) => r.data),
  /** @param {{edits?: {row:number,col:number,value:string|null}[], columns?: {index:number,semantic:string|null}[], baseRevision?: number}} body */
  patchJob: (id, body) => request(`/capture/jobs/${id}/cells`, { method: 'PATCH', body }).then((r) => r.data),
  // a confirmed capture creates SurveyPoints on the server: the shared points cache (PointPickers) must refresh
  confirmJob: (id) => request(`/capture/jobs/${id}/confirm`, { method: 'POST' }).then((r) => { notifySurveyPointsChanged(); return r; }),
  /** The review image needs the Authorization header, so it is fetched and turned into an object URL. */
  async fetchImageObjectUrl(path) {
    const response = await request(path.replace(/^\/api/, ''), { raw: true });
    return URL.createObjectURL(await response.blob());
  },
};
