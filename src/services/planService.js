import API_BASE_URL from '../config/api';

class PlanService {
  // Fetch all plans
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

  // Fetch specific plan
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

  // Fetch current subscription
  static async getCurrentSubscription() {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No token available');
      }
      
      const response = await fetch(`${API_BASE_URL}/subscriptions/current`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // If 404, user has no subscription (this is OK, not an error)
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch subscription');
      }
      
      return await response.json();
    } catch (error) {
      // Don't log as error if it's just "no subscription" case
      if (error.message === 'No token available' || error.message.includes('404')) {
        console.log('No subscription found (this is OK)');
        return null;
      }
      console.error('Error fetching subscription:', error);
      throw error;
    }
  }

  // Create subscription
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

  // Cancel subscription
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
