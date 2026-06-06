import { API_ORIGIN } from '../config/api';
import { getApiLanguageHeaders } from '../utils/apiLanguage';

const BASE_URL = API_ORIGIN;

export const googleAuthService = {
  // Initialize Google OAuth
  initializeGoogleAuth() {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    }
  },

  // Handle Google OAuth response
  async handleCredentialResponse(response) {
    try {
      return await this.loginWithGoogle(response.credential);
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  },

  // Login with Google token
  async loginWithGoogle(token) {
    try {
      const response = await fetch(`${BASE_URL}/api/google-auth/login`, {
        method: 'POST',
        headers: getApiLanguageHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Google login failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  },

  // Render Google Sign-In button
  renderButton(elementId, options = {}) {
    if (window.google) {
      window.google.accounts.id.renderButton(
        document.getElementById(elementId),
        {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          callback: options.callback || this.handleCredentialResponse.bind(this),
          ...options
        }
      );
    }
  },

  // Prompt Google Sign-In
  prompt() {
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  }
};
