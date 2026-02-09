import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_ORIGIN } from '../../config/api';

const BASE_URL = API_ORIGIN;

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const getInitialToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');
  const getInitialRefreshToken = () => localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getInitialToken);
  const [refreshToken, setRefreshToken] = useState(getInitialRefreshToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize auth state on mount
  useEffect(() => {
    console.log('AuthContext useEffect token:', token);
    const savedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    const savedRefreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
    
    if (savedToken) {
      setToken(savedToken);
      setRefreshToken(savedRefreshToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch user info on mount if token exists
  useEffect(() => {
    console.log('AuthContext useEffect token:', token);
    if (token) {
      setLoading(true);
      fetch(`${BASE_URL}/api/auth/account`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (res.ok) {
            return res.json();
          } else {
            // Token is invalid, clear it
            console.warn('Invalid token, clearing auth state');
            setToken(null);
            setRefreshToken(null);
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('refreshToken');
            return Promise.reject(res);
          }
        })
        .then(data => {
          console.log('User data fetched:', data);
          setUser(data.user || data);
        })
        .catch((error) => {
          console.error('Error fetching user:', error);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setUser(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Google login function
  const loginWithGoogle = async (response, rememberMe = false) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check for valid response
      if (!response || !response.credential) {
        console.error('Invalid Google response:', response);
        setError('Невалиден отговор от Google.');
        return false;
      }

      console.log('Sending Google token to backend...');
      const result = await fetch(`${BASE_URL}/api/google-auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.credential }),
      });

      console.log('Backend response status:', result.status);
      const data = await result.json();
      console.log('Backend response data:', data);
      
      if (result.ok && data.token) {
        console.log('Google login successful, saving tokens...');
        setToken(data.token);
        setRefreshToken(data.refreshToken);
        
        // Store according to rememberMe
        if (rememberMe) {
          localStorage.setItem('token', data.token);
          if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('refreshToken');
          console.log('Tokens saved to localStorage');
        } else {
          sessionStorage.setItem('token', data.token);
          if (data.refreshToken) sessionStorage.setItem('refreshToken', data.refreshToken);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          console.log('Tokens saved to sessionStorage');
        }
        
        setUser(data.user);
        setError(null);
        console.log('User state updated:', data.user);
        return true;
      } else {
        const errorMsg = data.message || data.error || 'Грешка при Google вход.';
        console.error('Google login failed:', errorMsg);
        setError(errorMsg);
        return false;
      }
    } catch (e) {
      console.error('Google login exception:', e);
      setError(e.message || 'Грешка при връзка със сървъра.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password, rememberMe = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        setRefreshToken(data.refreshToken);
        // Store according to rememberMe
        if (rememberMe) {
          localStorage.setItem('token', data.token);
          if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('refreshToken');
        } else {
          sessionStorage.setItem('token', data.token);
          if (data.refreshToken) sessionStorage.setItem('refreshToken', data.refreshToken);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
        setUser(data.user);
        setError(null);
        return true;
      } else {
        setError(data.message || 'Грешка при вход.');
        setUser(null);
        setToken(null);
        setRefreshToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refreshToken');
        return false;
      }
    } catch (e) {
      setError('Грешка при връзка със сървъра.');
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name, email, password, repeatPassword, purpose) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, repeatPassword, purpose }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        setRefreshToken(data.refreshToken);
        // By default registration will store in localStorage
        localStorage.setItem('token', data.token);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refreshToken');
        setUser(data.user);
        setError(null);
        return true;
      } else {
        setError(data.message || 'Грешка при регистрация.');
        setUser(null);
        setToken(null);
        setRefreshToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refreshToken');
        return false;
      }
    } catch (e) {
      setError('Грешка при връзка със сървъра.');
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    if (refreshToken) {
      try {
        await fetch(`${BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {}
    }
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setError(null);
        return data.message || 'Изпратен е email за възстановяване на парола.';
      } else {
        setError(data.message || 'Грешка при заявка за нова парола.');
        return false;
      }
    } catch (e) {
      setError('Грешка при връзка със сървъра.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Refresh user (e.g. after billing update)
  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BASE_URL}/api/auth/account`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || data);
      }
    } catch (e) {
      console.error('Refresh user failed:', e);
    }
  }, [token]);

  // Change password function
  const changePassword = async (oldPassword, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setError(null);
        return true;
      } else {
        setError(data.message || 'Грешка при смяна на паролата.');
        return false;
      }
    } catch (e) {
      setError('Грешка при връзка със сървъра.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, loginWithGoogle, register, logout, forgotPassword, changePassword, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 