import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Configure axios to include credentials
  axios.defaults.withCredentials = true;

  const checkAdminStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5003/admin/status');
      setIsAdmin(response.data.is_admin);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:5003/admin/login', {
        username,
        password,
      });
      setIsAdmin(true);
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:5003/admin/logout');
      setIsAdmin(false);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      setIsAdmin(false);
      return { success: false };
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const value = {
    isAdmin,
    loading,
    login,
    logout,
    checkAdminStatus,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};