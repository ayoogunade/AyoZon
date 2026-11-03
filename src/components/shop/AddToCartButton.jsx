import { Check, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { Button, IconButton } from '../ui/Button';

// Shared by the gallery tiles, the hero bar and the photograph page.
export function useAddToCart() {
  const cart = useCart();
  const notify = useToast();
  return (product) => {
    if (cart.has(product.id)) {
      cart.setOpen(true);
      return;
    }
    cart.add(product);
    notify(`${product.name} is in your cart`);
  };
}

export function AddToCartButton({ product, compact, className = '', ...props }) {
  const { has } = useCart();
  const addToCart = useAddToCart();
  const inCart = has(product.id);
  if (compact) {
    return (
      <IconButton
        label={inCart ? `${product.name} is in your cart` : `Add ${product.name} to cart`}
        icon={inCart ? Check : Plus}
        onClick={() => addToCart(product)}
        className={className}
        {...props}
      />
    );
  }
  return (
    <Button icon={inCart ? Check : Plus} variant={inCart ? 'secondary' : 'primary'} onClick={() => addToCart(product)} className={className} {...props}>
      {inCart ? 'In your cart' : 'Add to cart'}
    </Button>
  );
}
