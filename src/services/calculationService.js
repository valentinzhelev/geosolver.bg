import API_BASE_URL from '../config/api';
import { getApiLanguageHeaders } from '../utils/apiLanguage';

class CalculationService {
  // Save calculation
  static async saveCalculation(calculationData) {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/calculations`, {
        method: 'POST',
        headers: getApiLanguageHeaders({
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(calculationData)
      });
      
      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch {
          /* ignore */
        }
        const message = errorData.error || 'Failed to save calculation';
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        if (response.status === 403) {
          throw new Error(message || 'Calculation limit reached');
        }
        throw new Error(message);
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
        headers: getApiLanguageHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }),
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

  // Fetch single calculation (full input/result)
  static async getCalculationById(id) {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) throw new Error('Authentication required');

    const response = await fetch(`${API_BASE_URL}/calculations/${id}`, {
      headers: getApiLanguageHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch calculation');
    }

    return response.json();
  }

  // Fetch calculation statistics
  static async getCalculationStats() {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/calculations/stats`, {
        headers: getApiLanguageHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }),
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
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const url = `${API_BASE_URL}/calculations/limits`;
      
      console.log('API Debug - checkLimits:');
      console.log('  - API_BASE_URL:', API_BASE_URL);
      console.log('  - Full URL:', url);
      console.log('  - Token exists:', !!token);
      console.log('  - Token preview:', token ? token.substring(0, 20) + '...' : 'null');
      
      const headers = getApiLanguageHeaders({
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      });
      
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
