import { Link, NavLink } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAdmin } from '../../context/AdminContext';
import { Wordmark } from '../Wordmark';
import { ThemeToggle } from '../ThemeToggle';
import { IconButton } from '../ui/Button';

const link = 'text-small text-ink/80 transition-colors duration-200 hover:text-ink';

export function SiteHeader() {
  const { count, setOpen } = useCart();
  const { isAdmin } = useAdmin();
  return (
    <header className="page-x sticky top-0 z-40 flex h-16 items-center justify-between bg-bg">
      <Wordmark />
      <nav className="flex items-center gap-1 sm:gap-6" aria-label="Main">
        <Link to="/#photographs" className={`${link} hidden sm:inline`}>Photographs</Link>
        <Link to="/#how" className={`${link} hidden sm:inline`}>How it works</Link>
        <Link to="/#questions" className={`${link} hidden md:inline`}>Questions</Link>
        {isAdmin && (
          <NavLink to="/admin" className={`${link} hidden sm:inline`}>Dashboard</NavLink>
        )}
        <div className="flex items-center">
          <ThemeToggle />
          <IconButton label={`Cart, ${count} ${count === 1 ? 'photograph' : 'photographs'}`} icon={ShoppingBag} badge={count || null} onClick={() => setOpen(true)} />
        </div>
      </nav>
    </header>
  );
}
