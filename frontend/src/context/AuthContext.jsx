import React, { createContext, useState, useEffect, useCallback } from 'react';
import {
  loginApi,
  registerApi,
  logoutApi,
  getMeApi,
  changePasswordApi
} from '../services/authService';
import { updateProfileApi } from '../services/userService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on application load or browser refresh
  const initAuth = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMeApi();
      if (data && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      // Unauthenticated or token expired
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await loginApi(email, password);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await registerApi(userData);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler — do NOT set loading=true here; that blocks ProtectedRoute
  // from redirecting. Clear user immediately so the route guard fires right away.
  const logout = async () => {
    setUser(null); // triggers ProtectedRoute → navigate to /login immediately
    try {
      await logoutApi(); // clear the HTTP-only cookie on the server
    } catch (err) {
      // Even if the API call fails the local session is already cleared
      console.error('Logout API error (session already cleared):', err);
    }
  };

  // Update profile handler
  const updateProfile = async (profileData) => {
    const data = await updateProfileApi(profileData);
    if (data && data.user) {
      setUser(data.user);
    }
    return data;
  };

  // Change password handler
  const changePassword = async (currentPassword, newPassword) => {
    return await changePasswordApi(currentPassword, newPassword);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshUser: initAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
