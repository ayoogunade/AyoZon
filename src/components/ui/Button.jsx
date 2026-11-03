import { Link } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';

const variants = {
  primary: 'bg-accent text-accent-ink hover:bg-accent/90',
  ink: 'bg-ink text-bg hover:bg-ink/85',
  secondary: 'bg-surface text-ink hover:bg-surface-2',
  ghost: 'text-ink hover:bg-surface',
  danger: 'bg-danger text-white hover:bg-danger/90',
};
const sizes = {
  md: 'h-12 px-6 text-body',
  sm: 'h-10 px-4 text-small',
};

// One button shape for the whole app: square corners, flat fill.
export function Button({ to, href, variant = 'primary', size = 'md', loading, disabled, icon: Icon, className = '', children, ...props }) {
  const cls = `inline-flex select-none items-center justify-center gap-2 font-medium transition-[background-color,transform,opacity] duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`;
  const content = (
    <>
      {loading ? <LoaderCircle size={20} strokeWidth={1.75} className="animate-spin" /> : Icon && <Icon size={20} strokeWidth={1.75} />}
      {children}
    </>
  );
  if (to) return <Link to={to} className={cls} {...props}>{content}</Link>;
  if (href) return <a href={href} className={cls} {...props}>{content}</a>;
  return (
    <button className={cls} disabled={loading || disabled} {...props}>
      {content}
    </button>
  );
}

export function IconButton({ label, icon: Icon, className = '', badge, ...props }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`relative inline-flex h-10 w-10 items-center justify-center text-ink transition-[background-color,transform] duration-200 hover:bg-surface active:scale-95 ${className}`}
      {...props}
    >
      <Icon size={20} strokeWidth={1.75} />
      {badge ? (
        <span className="num absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[12px] font-semibold leading-none text-accent-ink">
          {badge}
        </span>
      ) : null}
    </button>
  );
}
