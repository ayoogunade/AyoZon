import { useId } from 'react';

export function Field({ label, hint, error, textarea, className = '', ...props }) {
  const id = useId();
  const Tag = textarea ? 'textarea' : 'input';
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-small font-medium text-ink">
        {label}
      </label>
      <Tag id={id} className={`field-input ${textarea ? 'min-h-32 resize-y' : ''}`} aria-invalid={Boolean(error)} {...props} />
      {error ? (
        <p className="mt-2 text-small text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-2 text-small text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
