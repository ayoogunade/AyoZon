import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ImageOff } from 'lucide-react';
import { useProduct, useProducts } from '../lib/useProducts';
import { useReveal } from '../lib/useReveal';
import { assetUrl } from '../lib/api';
import { formatPrice } from '../lib/format';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/Button';
import { Empty, ErrorView, Loading } from '../components/ui/StatusView';
import { ProductTile } from '../components/shop/ProductTile';
import { AddToCartButton } from '../components/shop/AddToCartButton';

function useImageSize(src) {
  const [size, setSize] = useState(null);
  useEffect(() => {
    if (!src) return undefined;
    const img = new Image();
    img.onload = () => setSize({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = assetUrl(src);
    return () => {
      img.onload = null;
    };
  }, [src]);
  return size;
}

function orientation(size) {
  if (!size) return '';
  const r = size.w / size.h;
  return r > 1.1 ? 'Landscape' : r < 0.9 ? 'Portrait' : 'Square';
}

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { product, status } = useProduct(id);
  const { products } = useProducts();
  const cart = useCart();
  const size = useImageSize(product?.image_url);
  const [loaded, setLoaded] = useState(false);
  useReveal([status, id]);

  useEffect(() => setLoaded(false), [id]);

  if (status === 'loading') return <Loading className="min-h-[80vh]" />;
  if (status === 'missing')
    return (
      <Empty icon={ImageOff} title="This photograph isn’t here" action={<Button to="/#photographs" variant="secondary">See all photographs</Button>}>
        It may have been taken down from the shop.
      </Empty>
    );
  if (status === 'error') return <ErrorView message="Could not load this photograph." onRetry={() => window.location.reload()} />;

  const more = products.filter((p) => p.id !== product.id).slice(0, 3);
  const buyNow = () => {
    cart.add(product);
    navigate('/checkout');
  };

  return (
    <>
      <section className="page-x grid gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]" aria-labelledby="photo-title">
        <div className="relative h-[62svh] bg-surface lg:sticky lg:top-[76px] lg:h-[calc(100svh-112px)]">
          {product.image_url ? (
            <img
              src={assetUrl(product.image_url)}
              alt={product.name}
              onLoad={() => setLoaded(true)}
              className={`h-full w-full object-contain p-4 transition-opacity duration-700 sm:p-8 lg:p-12 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted">
              <ImageOff size={28} strokeWidth={1.5} aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="flex flex-col py-8 lg:min-h-[calc(100svh-112px)] lg:px-12 lg:py-12">
          <Link to="/#photographs" className="inline-flex items-center gap-2 self-start text-small text-muted transition-colors hover:text-ink">
            <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" /> All photographs
          </Link>
          <div className="mt-12 lg:mt-[10vh]">
            <h1 id="photo-title" className="display text-head" data-reveal>
              {product.name}
            </h1>
            <p className="num mt-6 text-lead" data-reveal style={{ '--i': 1 }}>
              {formatPrice(product.price)}
            </p>
            <p className="mt-6 max-w-[46ch]" data-reveal style={{ '--i': 2 }}>
              {product.description}
            </p>
            <div className="mt-10 flex flex-wrap gap-3" data-reveal style={{ '--i': 3 }}>
              <Button onClick={buyNow} variant="ink">
                Buy now
              </Button>
              <AddToCartButton product={product} variant="secondary" />
            </div>
          </div>
          <dl className="mt-auto grid grid-cols-2 gap-x-6 gap-y-5 pt-16 text-small" data-reveal style={{ '--i': 4 }}>
            <div>
              <dt className="text-muted">File</dt>
              <dd className="mt-1">JPEG, full resolution</dd>
            </div>
            <div>
              <dt className="text-muted">Size</dt>
              <dd className="num mt-1">{size ? `${size.w} × ${size.h} px, ${orientation(size).toLowerCase()}` : '—'}</dd>
            </div>
            <div>
              <dt className="text-muted">Licence</dt>
              <dd className="mt-1">Personal use</dd>
            </div>
            <div>
              <dt className="text-muted">Photograph</dt>
              <dd className="mt-1">{product.credit || 'AyoZon'}</dd>
            </div>
          </dl>
        </div>
      </section>

      {more.length > 0 && (
        <section className="page-x pt-32 lg:pt-44" aria-labelledby="more-title">
          <h2 id="more-title" className="display mb-10 text-head" data-reveal>
            More photographs
          </h2>
          <div className="grid gap-x-3 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((p, i) => (
              <ProductTile key={p.id} product={p} style={{ '--i': i }} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
