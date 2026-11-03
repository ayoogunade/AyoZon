import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, errorMessage } from '../lib/api';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api
      .get('/admin/status')
      .then(({ data }) => setIsAdmin(Boolean(data.is_admin)))
      .catch(() => setIsAdmin(false))
      .finally(() => setChecking(false));
  }, []);

  const login = useCallback(async (username, password) => {
    try {
      await api.post('/admin/login', { username, password });
      setIsAdmin(true);
      return { ok: true };
    } catch (err) {
      return { ok: false, message: errorMessage(err, 'Sign-in failed') };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/admin/logout');
    } finally {
      setIsAdmin(false);
    }
  }, []);

  return <AdminContext.Provider value={{ isAdmin, checking, login, logout }}>{children}</AdminContext.Provider>;
}

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside AdminProvider');
  return ctx;
};
