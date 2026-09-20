import API_BASE_URL from '../config/api';
import { getApiLanguageHeaders, getApiErrorFallback } from '../utils/apiLanguage';
import { notifySurveyPointsChanged } from '../utils/surveyPointsEvents';

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

// Every successful mutation invalidates the shared SurveyPointsContext cache (QA-05): the next PointPicker use is fresh.
const mutating = (promise) =>
  promise.then((res) => {
    notifySurveyPointsChanged();
    return res;
  });

export const surveyPointsApi = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/points${q ? `?${q}` : ''}`);
  },
  create: (body) =>
    mutating(request('/points', { method: 'POST', body: JSON.stringify(body) })),
  importMany: (body) =>
    mutating(request('/points/import', { method: 'POST', body: JSON.stringify(body) })),
  update: (id, body) =>
    mutating(request(`/points/${id}`, { method: 'PUT', body: JSON.stringify(body) })),
  remove: (id) => mutating(request(`/points/${id}`, { method: 'DELETE' })),
};
