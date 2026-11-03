import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ChevronDown, ImageOff } from 'lucide-react';
import { useProducts } from '../lib/useProducts';
import { useReveal } from '../lib/useReveal';
import { formatPrice } from '../lib/format';
import { assetUrl } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Photo } from '../components/ui/Photo';
import { Empty, ErrorView, Loading } from '../components/ui/StatusView';
import { ProductTile } from '../components/shop/ProductTile';
import { AddToCartButton } from '../components/shop/AddToCartButton';

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/* The fixed half of the first screen: the photographs themselves, crossfading. */
function HeroStage({ products }) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * Math.max(products.length, 1)));

  useEffect(() => {
    if (products.length < 2 || reduceMotion()) return undefined;
    let timer;
    const tick = () => {
      if (!document.hidden) setIndex((i) => (i + 1) % products.length);
    };
    timer = setInterval(tick, 6000);
    return () => clearInterval(timer);
  }, [products.length]);

  const current = products[index % products.length];
  if (!current) {
    return (
      <div className="flex h-full items-center justify-center bg-surface text-muted">
        <ImageOff size={28} strokeWidth={1.5} aria-hidden="true" />
      </div>
    );
  }
  return (
    <div className="relative h-full overflow-hidden bg-surface">
      {products.map((p, i) => (
        <img
          key={p.id}
          src={assetUrl(p.image_url)}
          alt={i === index ? p.name : ''}
          aria-hidden={i !== index}
          loading={i === index ? 'eager' : 'lazy'}
          className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[1600ms] ease-out ${
            i === index ? 'scale-100 opacity-100' : 'scale-[1.04] opacity-0'
          }`}
        />
      ))}
      <div className="absolute inset-x-0 bottom-0 flex h-16 items-center gap-4 bg-bg px-5" aria-live="polite">
        <Link to={`/photo/${current.id}`} className="min-w-0 flex-1 truncate text-small hover:text-accent">
          Showing <span className="font-medium">{current.name}</span>
        </Link>
        <span className="num text-small text-muted">{formatPrice(current.price)}</span>
        <AddToCartButton product={current} compact className="-mr-2" />
      </div>
    </div>
  );
}

function Hero({ products }) {
  const lowest = products.length ? Math.min(...products.map((p) => Number(p.price))) : null;
  return (
    <section className="page-x grid gap-3 pb-3 lg:grid-cols-2" aria-labelledby="hero-title">
      <div className="flex flex-col justify-between bg-surface p-6 sm:p-10 lg:min-h-[calc(100svh-112px)] lg:p-14">
        <div className="lg:pt-[12vh]">
          <h1 id="hero-title" className="display max-w-[11ch] text-display" data-reveal>
            Photographs of open land
          </h1>
          <p className="mt-6 max-w-[40ch] text-lead sm:mt-8" data-reveal style={{ '--i': 1 }}>
            Landscape photographs of fields, farms and weather, sold as full-resolution downloads. Pay once by card
            and the file is yours on the spot.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 sm:mt-10" data-reveal style={{ '--i': 2 }}>
            <Button href="#photographs" icon={ArrowDown}>
              See the photographs
            </Button>
            {lowest != null && (
              <span className="text-muted">
                {products.length} photographs, from <span className="num text-ink">{formatPrice(lowest)}</span>
              </span>
            )}
          </div>
        </div>
        <dl className="mt-12 grid grid-cols-3 gap-4 text-small lg:mt-16" data-reveal style={{ '--i': 3 }}>
          <div>
            <dt className="text-muted">Format</dt>
            <dd className="mt-1">Full-size JPEG</dd>
          </div>
          <div>
            <dt className="text-muted">Delivery</dt>
            <dd className="mt-1">Instant, plus email</dd>
          </div>
          <div>
            <dt className="text-muted">Payment</dt>
            <dd className="mt-1">Card, by Stripe</dd>
          </div>
        </dl>
      </div>
      <div className="h-[52svh] lg:sticky lg:top-[76px] lg:h-[calc(100svh-112px)]">
        <HeroStage products={products} />
      </div>
    </section>
  );
}

const SORTS = {
  newest: { label: 'Newest first', fn: () => 0 },
  'price-asc': { label: 'Price, low to high', fn: (a, b) => a.price - b.price },
  'price-desc': { label: 'Price, high to low', fn: (a, b) => b.price - a.price },
  name: { label: 'Name, A to Z', fn: (a, b) => a.name.localeCompare(b.name) },
};

// Rows alternate between a wide pair and a row of three, so the wall never reads as a uniform grid.
const PATTERN = [
  { span: 'lg:col-span-7', img: 'aspect-[4/5] sm:aspect-[4/3] lg:aspect-auto lg:h-[min(46vw,680px)]' },
  { span: 'lg:col-span-5', img: 'aspect-[4/5] lg:aspect-auto lg:h-[min(46vw,680px)]' },
  { span: 'lg:col-span-4', img: 'aspect-[4/5]' },
  { span: 'lg:col-span-4', img: 'aspect-[4/5]' },
  { span: 'lg:col-span-4', img: 'aspect-[4/5]' },
];

function Gallery({ products }) {
  const [sort, setSort] = useState('newest');
  const sorted = useMemo(() => [...products].sort(SORTS[sort].fn), [products, sort]);
  useReveal([sorted]);

  return (
    <section id="photographs" className="page-x scroll-mt-20 pt-32 lg:pt-44" aria-labelledby="gallery-title">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div data-reveal>
          <h2 id="gallery-title" className="display text-head">The photographs</h2>
          <p className="mt-3 text-muted">
            <span className="num">{products.length}</span> photographs. Select one to see it uncropped.
          </p>
        </div>
        <label className="relative inline-flex items-center" data-reveal style={{ '--i': 1 }}>
          <span className="sr-only">Sort photographs</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-11 cursor-pointer appearance-none bg-surface py-0 pl-4 pr-11 text-small text-ink transition-colors hover:bg-surface-2 focus:outline-none focus-visible:outline-2 focus-visible:outline-accent"
          >
            {Object.entries(SORTS).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown size={18} strokeWidth={1.75} className="pointer-events-none absolute right-3.5" aria-hidden="true" />
        </label>
      </div>
      <div className="grid gap-x-3 gap-y-12 sm:grid-cols-2 lg:grid-cols-12">
        {sorted.map((p, i) => {
          const slot = PATTERN[i % PATTERN.length];
          return <ProductTile key={p.id} product={p} imageClass={slot.img} className={slot.span} style={{ '--i': i % 3 }} />;
        })}
      </div>
    </section>
  );
}

const STEPS = [
  {
    when: 'Choosing',
    rows: [
      ['Open a photograph to see it uncropped', 'any time'],
      ['Add as many as you like to the cart', 'one click'],
    ],
  },
  {
    when: 'Paying',
    rows: [
      ['Enter an email for the receipt', '10 seconds'],
      ['Pay by card, handled by Stripe', 'under a minute'],
    ],
  },
  {
    when: 'Afterwards',
    rows: [
      ['Download each file from the order page', 'instant'],
      ['A copy arrives by email as attachments', 'a few minutes'],
    ],
  },
];

function HowItWorks() {
  return (
    <section id="how" className="mt-40 scroll-mt-16 bg-field text-field-ink lg:mt-56" aria-labelledby="how-title">
      <div className="page-x grid gap-12 py-24 lg:grid-cols-12 lg:py-32">
        <div className="lg:col-span-5" data-reveal>
          <h2 id="how-title" className="display text-head">How buying works</h2>
          <p className="mt-6 max-w-[34ch] text-lead">
            No account and no shipping. You leave with the files, and the email is a backup copy.
          </p>
        </div>
        <div className="lg:col-span-6 lg:col-start-7" data-reveal style={{ '--i': 1 }}>
          <div className="zigzag w-full max-w-[520px] bg-bg pb-10 text-ink">
            <div className="px-6 pt-8 sm:px-8">
              {STEPS.map((group) => (
                <div key={group.when} className="pt-6 first:pt-0">
                  <h3 className="font-semibold">{group.when}</h3>
                  <ul className="mt-2">
                    {group.rows.map(([what, time]) => (
                      <li key={what} className="flex items-baseline py-1.5 text-[16px]">
                        <span>{what}</span>
                        <span className="leader" aria-hidden="true" />
                        <span className="num shrink-0 text-muted">{time}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-8 flex h-12 items-center justify-between bg-ink px-6 text-[16px] text-bg sm:px-8">
              <span className="font-medium">Full-size photographs, yours to keep</span>
              <span className="num">about 2 min</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const QUESTIONS = [
  ['What exactly do I get?', 'The original JPEG at full resolution, the same file shown uncropped on each photograph’s page. Nothing is watermarked.'],
  ['Can I print it?', 'Yes. The files are large enough for prints up to about A3 at photo quality, and bigger for viewing at a distance.'],
  ['What can I use it for?', 'Personal use: your walls, your desktop, gifts. For commercial use, get in touch first.'],
  ['What if the email never arrives?', 'You don’t need it. The order page gives you a download button for every photograph, and it stays in this browser.'],
  ['Is my card really charged?', 'Not on this demo. It runs in Stripe’s test mode; use the test card shown at checkout.'],
];

function Questions({ products }) {
  const [tall, square] = [products[2] || products[0], products[4] || products[1]];
  return (
    <section id="questions" className="page-x mt-40 grid scroll-mt-20 gap-16 lg:mt-56 lg:grid-cols-12" aria-labelledby="questions-title">
      <div className="lg:col-span-5" data-reveal>
        <h2 id="questions-title" className="display text-head">Questions</h2>
        <dl className="mt-8 grid grid-cols-[6.5rem_1fr] gap-y-2 text-[18px]">
          <dt className="text-muted">Files</dt><dd>JPEG, up to 2400 px on the long side</dd>
          <dt className="text-muted">Delivery</dt><dd>Download on screen, then by email</dd>
          <dt className="text-muted">Price</dt><dd>One payment, no subscription</dd>
        </dl>
        <div className="mt-12 space-y-7">
          {QUESTIONS.map(([q, a]) => (
            <details key={q} className="group">
              <summary className="flex cursor-pointer items-center justify-between gap-6 text-[20px] transition-colors hover:text-accent">
                {q}
                <ChevronDown size={20} strokeWidth={1.75} className="shrink-0 transition-transform duration-300 group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="mt-3 max-w-[48ch] text-muted">{a}</p>
            </details>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center gap-6">
          <Button href="#photographs">Choose a photograph</Button>
          <Link to="/checkout" className="underline-offset-4 hover:underline">Go to your cart</Link>
        </div>
      </div>
      {tall && (
        <div className="relative pb-16 lg:col-span-6 lg:col-start-7" data-reveal style={{ '--i': 1 }}>
          <Link to={`/photo/${tall.id}`} className="block">
            <Photo src={tall.image_url} alt={tall.name} className="aspect-[3/4]" />
          </Link>
          {square && square.id !== tall.id && (
            <Link to={`/photo/${square.id}`} className="absolute bottom-0 left-0 block w-[38%] bg-bg p-[10px] sm:-left-10">
              <Photo src={square.image_url} alt={square.name} className="aspect-square" />
            </Link>
          )}
        </div>
      )}
    </section>
  );
}

export default function Home() {
  const { products, status, error, reload } = useProducts();
  useReveal([status]);

  if (status === 'loading') return <Loading label="Loading the photographs" className="min-h-[80vh]" />;
  if (status === 'error') return <ErrorView message={error} onRetry={reload} />;

  return (
    <>
      <Hero products={products} />
      {products.length ? (
        <Gallery products={products} />
      ) : (
        <Empty icon={ImageOff} title="No photographs yet">
          The shop is empty. Add photographs from the admin dashboard.
        </Empty>
      )}
      <HowItWorks />
      <Questions products={products} />
    </>
  );
}
