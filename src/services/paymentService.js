const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class PaymentService {
  // Вземане на история на плащанията
  static async getPaymentHistory(page = 1, limit = 10) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/payments?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch payment history');
      return await response.json();
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }

  // Вземане на статистики за плащания
  static async getPaymentStats() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/payments/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch payment stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw error;
    }
  }

  // Създаване на плащане
  static async createPayment(paymentData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });
      if (!response.ok) throw new Error('Failed to create payment');
      return await response.json();
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  // Обновяване на статус на плащане
  static async updatePaymentStatus(paymentId, status, failureReason = null) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
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
