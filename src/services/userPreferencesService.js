const BASE_URL = 'https://geosolver-backend-production.up.railway.app';

export const userPreferencesService = {
  // Get user preferences
  async getUserPreferences(token) {
    try {
      const response = await fetch(`${BASE_URL}/api/user-preferences`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user preferences');
      }

      const data = await response.json();
      return data.userPreferences;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      // Return default preferences if there's an error
      return { showToolsInDevelopment: false };
    }
  },

  // Update user preferences
  async updateUserPreferences(token, preferences) {
    try {
      const response = await fetch(`${BASE_URL}/api/user-preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(preferences)
      });

      if (!response.ok) {
        throw new Error('Failed to update user preferences');
      }

      const data = await response.json();
      return data.userPreferences;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }
};
