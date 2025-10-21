const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class PlanService {
  // Вземане на всички планове
  static async getPlans() {
    try {
      const response = await fetch(`${API_BASE_URL}/plans`);
      if (!response.ok) throw new Error('Failed to fetch plans');
      return await response.json();
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw error;
    }
  }

  // Вземане на конкретен план
  static async getPlan(planId) {
    try {
      const response = await fetch(`${API_BASE_URL}/plans/${planId}`);
      if (!response.ok) throw new Error('Failed to fetch plan');
      return await response.json();
    } catch (error) {
      console.error('Error fetching plan:', error);
      throw error;
    }
  }

  // Вземане на текущ абонамент
  static async getCurrentSubscription() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/subscriptions/current`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch subscription');
      return await response.json();
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  }

  // Създаване на абонамент
  static async createSubscription(planId, billingCycle) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planId, billingCycle })
      });
      if (!response.ok) throw new Error('Failed to create subscription');
      return await response.json();
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  // Отмяна на абонамент
  static async cancelSubscription(subscriptionId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to cancel subscription');
      return await response.json();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }
}

export default PlanService;
