import { API_ORIGIN } from '../config/api';

const BASE_URL = API_ORIGIN;

export const googleAuthService = {
  // Initialize Google OAuth
  initializeGoogleAuth() {
    console.log('Initializing Google OAuth...');
    if (window.google) {
      console.log('Google script loaded, initializing...');
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      console.log('Google OAuth initialized with client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
    } else {
      console.log('Google script not loaded yet');
    }
  },

  // Handle Google OAuth response
  async handleCredentialResponse(response) {
    console.log('Google OAuth response received:', response);
    try {
      const result = await this.loginWithGoogle(response.credential);
      console.log('Google login result:', result);
      return result;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  },

  // Login with Google token
  async loginWithGoogle(token) {
    console.log('Attempting to login with Google token...');
    try {
      const response = await fetch(`${BASE_URL}/api/google-auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      console.log('Backend response status:', response.status);
      console.log('Backend response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error response:', errorData);
        throw new Error(errorData.message || 'Google login failed');
      }

      const data = await response.json();
      console.log('Backend success response:', data);
      return data;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  },

  // Render Google Sign-In button
  renderButton(elementId, options = {}) {
    console.log('Rendering Google Sign-In button...');
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
      console.log('Google Sign-In button rendered with callback');
    } else {
      console.log('Google script not available for button rendering');
    }
  },

  // Prompt Google Sign-In
  prompt() {
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  }
};
