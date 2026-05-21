import API_BASE_URL from '../config/api';
import { getApiLanguageHeaders } from '../utils/apiLanguage';

class PaymentService {
  // Fetch payment history
  static async getPaymentHistory(page = 1, limit = 10) {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // If no token, return empty data
      if (!token) {
        return {
          payments: [],
          pagination: {
            current: 1,
            total: 0,
            hasNext: false,
            hasPrev: false
          }
        };
      }
      
      const response = await fetch(`${API_BASE_URL}/payments?page=${page}&limit=${limit}`, {
        headers: getApiLanguageHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        })
      });
      if (!response.ok) throw new Error('Failed to fetch payment history');
      return await response.json();
    } catch (error) {
      console.error('Error fetching payment history:', error);
      // Return empty data instead of throwing error
      return {
        payments: [],
        pagination: {
          current: 1,
          total: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    }
  }

  // Fetch payment stats
  static async getPaymentStats() {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/payments/stats`, {
        headers: getApiLanguageHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        })
      });
      if (!response.ok) throw new Error('Failed to fetch payment stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw error;
    }
  }

  // Create payment
  static async createPayment(paymentData) {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/payments`, {
        method: 'POST',
        headers: getApiLanguageHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(paymentData)
      });
      if (!response.ok) throw new Error('Failed to create payment');
      return await response.json();
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  // Update payment status
  static async updatePaymentStatus(paymentId, status, failureReason = null) {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/status`, {
        method: 'PUT',
        headers: getApiLanguageHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ status, failureReason })
      });
      if (!response.ok) throw new Error('Failed to update payment status');
      return await response.json();
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }
}

export default PaymentService;
