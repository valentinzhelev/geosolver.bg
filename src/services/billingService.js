import API_BASE_URL from '../config/api';
import { getApiLanguageHeaders } from '../utils/apiLanguage';

class BillingService {
  static async createCheckoutSession() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/billing/create-checkout-session`, {
      method: 'POST',
      headers: getApiLanguageHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({})
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const err = new Error(data.error || 'Failed to create checkout session');
      err.status = response.status;
      throw err;
    }
    return response.json();
  }

  static async createPortalSession() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/billing/create-portal-session`, {
      method: 'POST',
      headers: getApiLanguageHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || data.message || 'Failed to open billing portal');
    }
    return response.json();
  }

  static async getBillingSummary() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/billing/summary`, {
      headers: getApiLanguageHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || data.message || 'Failed to fetch billing summary');
    }
    return response.json();
  }
}

export default BillingService;
