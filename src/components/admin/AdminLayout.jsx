import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ExternalLink, LogOut, Plus } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Wordmark } from '../Wordmark';
import { ThemeToggle } from '../ThemeToggle';
import { Button, IconButton } from '../ui/Button';

const tab = ({ isActive }) =>
  `inline-flex h-10 items-center px-3 text-small transition-colors ${isActive ? 'bg-surface text-ink' : 'text-muted hover:text-ink'}`;

export function AdminLayout() {
  const { logout } = useAdmin();
  const navigate = useNavigate();
  return (
    <div className="min-h-svh">
      <header className="page-x flex h-16 items-center justify-between gap-4 bg-bg">
        <div className="flex items-center gap-8">
          <Wordmark to="/admin" suffix="Admin" />
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Admin">
            <NavLink to="/admin" end className={tab}>Overview</NavLink>
            <NavLink to="/" className={tab}>
              Shop <ExternalLink size={14} strokeWidth={1.75} className="ml-1.5" aria-hidden="true" />
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-1">
          <Button to="/admin/photos/new" size="sm" icon={Plus} className="mr-2">
            <span className="hidden sm:inline">New photograph</span>
            <span className="sm:hidden">New</span>
          </Button>
          <ThemeToggle />
          <IconButton
            label="Sign out"
            icon={LogOut}
            onClick={async () => {
              await logout();
              navigate('/');
            }}
          />
        </div>
      </header>
      <main id="main" className="page-x pb-24">
        <Outlet />
      </main>
    </div>
  );
}
