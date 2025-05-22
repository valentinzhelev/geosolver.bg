import React, { createContext, useContext, useState, useEffect } from 'react';

const BASE_URL = 'https://geosolver-backend-production.up.railway.app';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user info on mount if token exists
  useEffect(() => {
    if (token) {
      setLoading(true);
      fetch(`${BASE_URL}/api/auth/account`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.ok ? res.json() : Promise.reject(res))
        .then(data => setUser(data.user))
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    } else {
      setUser(null);
    }
  }, [token]);

  // Login function
  const login = async (email, password) => {
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
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setError(null);
        return true;
      } else {
        setError(data.message || 'Грешка при вход.');
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        return false;
      }
    } catch (e) {
      setError('Грешка при връзка със сървъра.');
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
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
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setError(null);
        return true;
      } else {
        setError(data.message || 'Грешка при регистрация.');
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        return false;
      }
    } catch (e) {
      setError('Грешка при връзка със сървъра.');
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 