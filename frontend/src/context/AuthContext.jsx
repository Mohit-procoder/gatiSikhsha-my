import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('afip_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Load user data on startup
  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('afip_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data && res.data.data) {
          const { user: userData, school, student, team, evaluator, mentor, district, jury, state_jury } = res.data.data;
          setUser(userData);
          setRole(userData.role);
          setProfile({ school, student, team, evaluator, mentor, district, jury, state_jury });
        }
      } catch (err) {
        console.error('Session expired or invalid:', err);
        logout();
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password, targetRole = null) => {
    const res = await api.post('/auth/login', {
      email,
      password,
      role: targetRole,
    });

    if (res.data && res.data.data) {
      const { token: accessToken, user: userData, school, student, team, evaluator, mentor, district, jury, state_jury } = res.data.data;
      localStorage.setItem('afip_token', accessToken);
      localStorage.setItem('afip_user', JSON.stringify(userData));
      setToken(accessToken);
      setUser(userData);
      setRole(userData.role);
      setProfile({ school, student, team, evaluator, mentor, district, jury, state_jury });
      return userData;
    }
    throw new Error('Authentication failed');
  };

  const logout = () => {
    localStorage.removeItem('afip_token');
    localStorage.removeItem('afip_user');
    setToken(null);
    setUser(null);
    setRole(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data && res.data.data) {
        const { user: userData, school, student, team, evaluator, mentor, district, jury, state_jury } = res.data.data;
        setUser(userData);
        setRole(userData.role);
        setProfile({ school, student, team, evaluator, mentor, district, jury, state_jury });
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        profile,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
