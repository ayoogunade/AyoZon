import { Link } from 'react-router-dom';
import { formatPrice } from '../../lib/format';
import { Photo } from '../ui/Photo';
import { AddToCartButton } from './AddToCartButton';

export function ProductTile({ product, imageClass = 'aspect-[4/5]', className = '', style }) {
  return (
    <article className={`group ${className}`} data-reveal style={style}>
      <Link to={`/photo/${product.id}`} className="block overflow-hidden" aria-label={`${product.name}, ${formatPrice(product.price)}`}>
        <Photo src={product.image_url} alt={product.name} className={imageClass} imgClassName="group-hover:scale-[1.03]" />
      </Link>
      <div className="mt-4 flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-body font-medium">
            <Link to={`/photo/${product.id}`} className="transition-colors hover:text-accent">
              {product.name}
            </Link>
          </h3>
          <p className="num text-muted">{formatPrice(product.price)}</p>
        </div>
        <AddToCartButton product={product} compact className="bg-surface hover:bg-surface-2" />
      </div>
    </article>
  );
}
