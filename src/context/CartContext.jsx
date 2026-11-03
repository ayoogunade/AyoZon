import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { load, save } from '../lib/storage';

const CartContext = createContext(null);
const KEY = 'ayozon:cart';

// Digital photographs: each one is in the cart at most once.
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => load(KEY, []));
  const [open, setOpen] = useState(false);

  useEffect(() => save(KEY, items), [items]);

  const add = useCallback((p) => {
    setItems((prev) =>
      prev.some((i) => i.id === p.id)
        ? prev
        : [...prev, { id: p.id, name: p.name, price: p.price, image_url: p.image_url }],
    );
  }, []);
  const remove = useCallback((id) => setItems((prev) => prev.filter((i) => i.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);
  const has = useCallback((id) => items.some((i) => i.id === id), [items]);

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      total: items.reduce((sum, i) => sum + Number(i.price), 0),
      add,
      remove,
      clear,
      has,
      open,
      setOpen,
    }),
    [items, add, remove, clear, has, open],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
