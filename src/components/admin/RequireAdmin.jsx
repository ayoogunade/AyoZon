import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Loading } from '../ui/StatusView';

// Waits for the session check before deciding, so a refresh on /admin no longer bounces to the login page.
export function RequireAdmin() {
  const { isAdmin, checking } = useAdmin();
  const location = useLocation();
  if (checking) return <Loading className="min-h-svh" />;
  if (!isAdmin) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
