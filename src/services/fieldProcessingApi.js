import API_BASE_URL from '../config/api';
import { getApiLanguageHeaders } from '../utils/apiLanguage';
import { notifySurveyPointsChanged } from '../utils/surveyPointsEvents';

/**
 * Field Processing V2.4.1 API client. The server resolves station/orientation, runs every formula and persists the
 * authoritative result; the client only starts a run and, once reviewed, asks for the explicit "Създай точки" save.
 */
export class FieldProcessingApiError extends Error {
  constructor(status, body) {
    super((body && body.message) || 'Грешка при заявката.');
    this.name = 'FieldProcessingApiError';
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
  const response = await fetch(`${API_BASE_URL}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  let data = {};
  try {
    data = await response.json();
  } catch {
    /* non-JSON error body */
  }
  if (!response.ok) throw new FieldProcessingApiError(response.status, data);
  return data;
}

export const fieldProcessingApi = {
  /** @param {string} fieldObservationSetId @param {'zenith'|'vertical'|null} [verticalAngleConvention] */
  createRun: (fieldObservationSetId, verticalAngleConvention = null) =>
    request('/field-processing', { method: 'POST', body: { fieldObservationSetId, verticalAngleConvention } }).then((r) => r.data),
  getRun: (id) => request(`/field-processing/${id}`).then((r) => r.data),
  listRuns: (fieldObservationSetId) => request(`/field-processing?fieldObservationSetId=${encodeURIComponent(fieldObservationSetId)}`).then((r) => r.data),
  // creating points changes the project's SurveyPoints: the shared points cache (PointPickers) must refresh
  createPoints: (runId) => request(`/field-processing/${runId}/create-points`, { method: 'POST' }).then((r) => { notifySurveyPointsChanged(); return r; }),
};
