import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loginAttempts, setLoginAttempts] = useState(0);
  const maxLoginAttempts = 5;

  const logout = React.useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setLoginAttempts(0);
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  const loadUser = React.useCallback(async () => {
    try {
      const res = await axios.get('/api/auth/me');
      setUser(res.data);
      setLoginAttempts(0);
    } catch (error) {
      // Handle rate limiting gracefully
      if (error.response?.status === 429) {
        console.warn('Rate limited on auth/me endpoint');
        return;
      }
      
      console.error('Load user error:', error);
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUser();
    } else {
      setLoading(false);
    }

    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        if (e.newValue) {
          setToken(e.newValue);
          axios.defaults.headers.common['Authorization'] = `Bearer ${e.newValue}`;
          loadUser();
        } else {
          setToken(null);
          setUser(null);
          delete axios.defaults.headers.common['Authorization'];
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [token, loadUser]);

  useEffect(() => {
    const interceptorId = axios.interceptors.request.use((config) => {
      const method = (config.method || '').toLowerCase();
      const needsAuth = ['post', 'put', 'patch', 'delete'].includes(method);
      const isAuthEndpoint = (config.url || '').startsWith('/api/auth');
      const hasToken = !!localStorage.getItem('token');

      if (needsAuth && !isAuthEndpoint && !hasToken) {
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?next=${next}`;
        return Promise.reject(new Error('Login required'));
      }
      return config;
    });
    return () => axios.interceptors.request.eject(interceptorId);
  }, []);

  const login = async (email, password) => {
    try {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
      
      const res = await axios.post('/api/auth/login', { email: email.toLowerCase(), password });
      const { token, ...userData } = res.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setLoginAttempts(0);
      
      return { success: true, user: userData };
    } catch (error) {
      if (error.response?.status === 429) {
        if (loginAttempts < maxLoginAttempts) {
          setLoginAttempts(prev => prev + 1);
          return { success: false, error: 'Too many login attempts. Please wait before retrying.' };
        }
        return { success: false, error: 'Too many login attempts. Try again later.' };
      }
      setLoginAttempts(0);
      const errorData = error.response?.data || {};
      return {
        success: false,
        error: errorData.error || 'Login failed',
        requiresOTP: !!errorData.requiresOTP,
        email: errorData.email || null,
        code: errorData.code || null
      };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
      
      const res = await axios.post('/api/auth/register', { name, email: email.toLowerCase(), password, phone });
      const { token, ...userData } = res.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    }
  };

  const updateProfile = async (data) => {
    try {
      const res = await axios.put('/api/auth/profile', data);
      setUser(res.data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Update failed' };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    setUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
