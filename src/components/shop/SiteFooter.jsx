import { Link } from 'react-router-dom';

export function SiteFooter() {
  return (
    <footer className="page-x mt-40 grid gap-2 pb-8 pt-6 text-small text-muted md:grid-cols-[1fr_auto_1fr] md:items-baseline md:gap-6">
      <p>AyoZon, landscape photographs as downloads</p>
      <nav className="flex flex-wrap gap-x-6 gap-y-1 text-ink" aria-label="Footer">
        <Link to="/#photographs" className="transition-colors hover:text-accent">Photographs</Link>
        <Link to="/checkout" className="transition-colors hover:text-accent">Cart</Link>
        <Link to="/admin" className="transition-colors hover:text-accent">Admin</Link>
      </nav>
      <p className="md:text-right">
        © {new Date().getFullYear()} · Demo photographs from Unsplash, credited on each page
      </p>
    </footer>
  );
}
