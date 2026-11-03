import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../lib/format';
import { Button, IconButton } from '../ui/Button';
import { Photo } from '../ui/Photo';
import { Empty } from '../ui/StatusView';

export function CartLines({ onNavigate }) {
  const { items, remove } = useCart();
  return (
    <ul className="space-y-5">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-4">
          <Link to={`/photo/${item.id}`} onClick={onNavigate} className="shrink-0">
            <Photo src={item.image_url} alt={item.name} className="h-20 w-20" />
          </Link>
          <div className="min-w-0 flex-1">
            <Link to={`/photo/${item.id}`} onClick={onNavigate} className="block truncate font-medium hover:text-accent">
              {item.name}
            </Link>
            <p className="text-small text-muted">Full-resolution JPEG</p>
          </div>
          <span className="num">{formatPrice(item.price)}</span>
          <IconButton label={`Remove ${item.name}`} icon={X} onClick={() => remove(item.id)} className="-mr-2" />
        </li>
      ))}
    </ul>
  );
}

export function CartDrawer() {
  const { open, setOpen, items, total } = useCart();
  const navigate = useNavigate();
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, setOpen]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Your cart">
      <div className="animate-fade-in absolute inset-0 bg-black/45" onClick={close} />
      <aside className="animate-drawer-in absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col bg-bg shadow-[-24px_0_64px_rgba(0,0,0,0.25)]">
        <div className="flex h-16 items-center justify-between px-6">
          <h2 className="text-lead font-medium">Your cart</h2>
          <IconButton label="Close cart" icon={X} onClick={close} className="-mr-2" />
        </div>
        {items.length === 0 ? (
          <Empty icon={ShoppingBag} title="Nothing here yet" className="flex-1" action={<Button variant="secondary" onClick={close} to="/#photographs">Browse the photographs</Button>}>
            Add a photograph and it waits here until you check out.
          </Empty>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <CartLines onNavigate={close} />
            </div>
            <div className="bg-surface px-6 py-6">
              <div className="mb-5 flex items-baseline justify-between">
                <span>Total</span>
                <span className="num text-lead font-medium">{formatPrice(total)}</span>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  close();
                  navigate('/checkout');
                }}
              >
                Check out
              </Button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
