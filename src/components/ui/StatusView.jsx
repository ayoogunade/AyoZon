import { LoaderCircle } from 'lucide-react';
import { Button } from './Button';

// Loading, error and empty states share one shape so every screen handles them the same way.
export function Loading({ label = 'Loading', className = '' }) {
  return (
    <div className={`flex min-h-[40vh] items-center justify-center gap-3 text-muted ${className}`} role="status">
      <LoaderCircle size={20} strokeWidth={1.75} className="animate-spin" />
      <span className="text-small">{label}</span>
    </div>
  );
}

export function Empty({ icon: Icon, title, children, action, className = '' }) {
  return (
    <div className={`flex min-h-[40vh] flex-col items-center justify-center px-6 py-16 text-center ${className}`}>
      {Icon && <Icon size={28} strokeWidth={1.5} className="mb-5 text-muted" />}
      <h2 className="text-lead font-medium">{title}</h2>
      {children && <p className="mt-2 max-w-[40ch] text-body text-muted">{children}</p>}
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}

export function ErrorView({ message, onRetry }) {
  return (
    <Empty title="That didn't load" action={onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}>
      {message}
    </Empty>
  );
}
