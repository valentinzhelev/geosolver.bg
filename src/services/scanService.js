import API_BASE_URL from '../config/api';
import { getApiLanguageHeaders } from '../utils/apiLanguage';

export async function extractTaskInputFromImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/scan/extract-input`, {
    method: 'POST',
    headers: getApiLanguageHeaders(token ? { Authorization: `Bearer ${token}` } : {}),
    body: formData
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    let payload = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = null;
    }
    const message =
      payload?.error ||
      payload?.message ||
      (text && text.trim()) ||
      response.statusText ||
      'Failed to extract data';
    throw new Error(message);
  }

  return response.json();
}
