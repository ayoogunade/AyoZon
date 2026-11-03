import { useEffect, useRef } from 'react';
import { Button } from './Button';

export function ConfirmDialog({ open, title, children, confirmLabel = 'Confirm', tone = 'danger', busy, onConfirm, onCancel }) {
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      className="w-[min(440px,calc(100vw-32px))] bg-bg p-0 text-ink shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop:bg-black/50"
    >
      <div className="p-6 sm:p-8">
        <h2 className="text-lead font-medium">{title}</h2>
        <div className="mt-3 text-body text-muted">{children}</div>
        <div className="mt-8 flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button variant={tone} size="sm" onClick={onConfirm} loading={busy}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
