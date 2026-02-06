import API_BASE_URL from '../config/api';

class CalculationService {
  // Save calculation
  static async saveCalculation(calculationData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/calculations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(calculationData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save calculation');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving calculation:', error);
      throw error;
    }
  }

  // Fetch calculation history
  static async getCalculationHistory(page = 1, limit = 10, toolName = null) {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      let url = `${API_BASE_URL}/calculations?page=${page}&limit=${limit}`;
      if (toolName) url += `&toolName=${toolName}`;
      
      console.log('API Debug - getCalculationHistory:');
      console.log('  - API_BASE_URL:', API_BASE_URL);
      console.log('  - Full URL:', url);
      console.log('  - Token exists:', !!token);
      console.log('  - Token preview:', token ? token.substring(0, 20) + '...' : 'null');
      
      // If no token, return empty data instead of failing
      if (!token) {
        console.log('  - No token found, returning empty data');
        return {
          calculations: [],
          pagination: {
            current: 1,
            total: 0,
            totalItems: 0,
            hasNext: false,
            hasPrev: false
          }
        };
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('  - Response status:', response.status);
      console.log('  - Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('  - Error response:', errorText);
        // If 401, token might be invalid
        if (response.status === 401) {
          console.error('  - Unauthorized - token might be invalid');
        }
        throw new Error(`Failed to fetch calculation history: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('  - Response data:', data);
      console.log('  - Calculations count:', data.calculations?.length || 0);
      console.log('  - Pagination:', data.pagination);
      return data;
    } catch (error) {
      console.error('Error fetching calculation history:', error);
      console.error('Error details:', error.message);
      // Return empty data instead of throwing error
      return {
        calculations: [],
        pagination: {
          current: 1,
          total: 0,
          totalItems: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    }
  }

  // Fetch calculation statistics
  static async getCalculationStats() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/calculations/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch calculation stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching calculation stats:', error);
      throw error;
    }
  }

  // Check limits before calculation (24-hour limits)
  static async checkLimits() {
    try {
      const token = localStorage.getItem('token');
      const url = `${API_BASE_URL}/calculations/limits`;
      
      console.log('API Debug - checkLimits:');
      console.log('  - API_BASE_URL:', API_BASE_URL);
      console.log('  - Full URL:', url);
      console.log('  - Token exists:', !!token);
      console.log('  - Token preview:', token ? token.substring(0, 20) + '...' : 'null');
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Only add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        headers
      });
      
      console.log('  - Response status:', response.status);
      console.log('  - Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('  - Error response:', errorText);
        throw new Error('Failed to fetch calculation limits');
      }
      
      const result = await response.json();
      console.log('  - Response data:', result);
      
      return {
        canCalculate: result.canCalculate,
        used: result.used,
        limit: result.limit,
        unlimited: result.unlimited,
        periodStart: result.periodStart ? new Date(result.periodStart) : null,
        periodEnd: result.periodEnd ? new Date(result.periodEnd) : null
      };
    } catch (error) {
      console.error('Error checking limits:', error);
      return { canCalculate: false, used: 0, limit: 0, unlimited: false };
    }
  }
}

export default CalculationService;
