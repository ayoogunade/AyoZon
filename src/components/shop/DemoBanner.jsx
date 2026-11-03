import { CreditCard } from 'lucide-react';

export function DemoBanner() {
  return (
    <div className="page-x flex items-center justify-center gap-2 bg-ink py-2 text-center text-small text-bg">
      <CreditCard size={16} strokeWidth={1.75} className="shrink-0 opacity-80" aria-hidden="true" />
      <span>
        Demo shop. Payments run in Stripe test mode, so no card is ever charged.
      </span>
    </div>
  );
}
