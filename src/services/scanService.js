import API_BASE_URL from '../config/api';

export async function extractTaskInputFromImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/scan/extract-input`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error || 'Failed to extract data');
  }

  return response.json();
}
