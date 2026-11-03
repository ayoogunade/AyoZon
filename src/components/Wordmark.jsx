import { Link } from 'react-router-dom';

export function Wordmark({ to = '/', suffix }) {
  return (
    <Link to={to} className="group inline-flex items-baseline gap-3" aria-label="AyoZon home">
      <span className="display text-[34px] leading-none tracking-[0.01em] transition-colors duration-200 group-hover:text-accent">
        AyoZon
      </span>
      {suffix && <span className="text-small text-muted">{suffix}</span>}
    </Link>
  );
}
