import { useState, useEffect } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { userPreferencesService } from '../services/userPreferencesService';

export const useUserPreferences = () => {
  const { user, token } = useAuth();
  const [preferences, setPreferences] = useState({
    showToolsInDevelopment: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (user && token) {
        try {
          setLoading(true);
          setError(null);
          const userPrefs = await userPreferencesService.getUserPreferences(token);
          setPreferences(userPrefs);
        } catch (err) {
          console.error('Error loading user preferences:', err);
          setError('Failed to load preferences');
          // Keep default preferences
        } finally {
          setLoading(false);
        }
      }
    };

    loadPreferences();
  }, [user, token]);

  // Update a specific preference
  const updatePreference = async (key, value) => {
    if (!user || !token) {
      // If user is not logged in, just update locally
      setPreferences(prev => ({ ...prev, [key]: value }));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const updatedPrefs = await userPreferencesService.updateUserPreferences(token, {
        [key]: value
      });
      setPreferences(updatedPrefs);
    } catch (err) {
      console.error('Error updating user preferences:', err);
      setError('Failed to update preferences');
      // Revert the change if update fails
      setPreferences(prev => ({ ...prev }));
    } finally {
      setLoading(false);
    }
  };

  // Toggle tools in development
  const toggleToolsInDevelopment = async () => {
    await updatePreference('showToolsInDevelopment', !preferences.showToolsInDevelopment);
  };

  return {
    preferences,
    loading,
    error,
    updatePreference,
    toggleToolsInDevelopment,
    showToolsInDevelopment: preferences.showToolsInDevelopment
  };
};
