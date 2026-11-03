import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const CARDS = [
  { number: '4242 4242 4242 4242', result: 'Pays straight away' },
  { number: '4000 0025 0000 3155', result: 'Asks for a 3D Secure check' },
  { number: '4000 0000 0000 0002', result: 'Is declined' },
];

// Stripe's published test cards, copyable with one tap.
export function TestCards() {
  const [copied, setCopied] = useState('');
  const copy = async (number) => {
    try {
      await navigator.clipboard.writeText(number.replace(/\s/g, ''));
      setCopied(number);
      setTimeout(() => setCopied(''), 1600);
    } catch {
      /* clipboard blocked: the number is still on screen */
    }
  };
  return (
    <div className="bg-surface p-5 sm:p-6">
      <h2 className="font-medium">Test cards</h2>
      <p className="mt-1 text-small text-muted">Any future expiry date, any CVC and any postcode.</p>
      <ul className="mt-4 space-y-1">
        {CARDS.map((c) => (
          <li key={c.number}>
            <button
              type="button"
              onClick={() => copy(c.number)}
              className="group -mx-2 flex w-[calc(100%+16px)] items-center gap-3 px-2 py-2 text-left transition-colors hover:bg-surface-2"
              aria-label={`Copy test card ${c.number}, which ${c.result.toLowerCase()}`}
            >
              <span className="num min-w-[13.5rem] font-medium tracking-wide">{c.number}</span>
              <span className="flex-1 text-small text-muted">{c.result}</span>
              {copied === c.number ? (
                <Check size={18} strokeWidth={1.75} className="text-accent" aria-hidden="true" />
              ) : (
                <Copy size={18} strokeWidth={1.75} className="opacity-50 transition-opacity group-hover:opacity-100" aria-hidden="true" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
