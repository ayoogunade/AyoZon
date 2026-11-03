import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ImagePlus, Pencil, Receipt, Trash2 } from 'lucide-react';
import { api, errorMessage } from '../../lib/api';
import { useProducts } from '../../lib/useProducts';
import { formatDate, formatPrice } from '../../lib/format';
import { useToast } from '../../context/ToastContext';
import { Button, IconButton } from '../../components/ui/Button';
import { Photo } from '../../components/ui/Photo';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Empty, ErrorView, Loading } from '../../components/ui/StatusView';

function Figure({ label, value, note }) {
  return (
    <div>
      <dt className="text-small text-muted">{label}</dt>
      <dd className="num mt-1 text-[32px] font-medium leading-tight">{value}</dd>
      {note && <dd className="mt-1 truncate text-small text-muted">{note}</dd>}
    </div>
  );
}

const th = 'pb-3 text-left text-small font-medium text-muted';
const td = 'py-3 align-middle';

function PhotosTable({ products, sales, onDelete }) {
  if (!products.length) {
    return (
      <Empty icon={ImagePlus} title="No photographs in the shop" action={<Button to="/admin/photos/new">Add the first photograph</Button>}>
        Shoppers see an empty shop until you add one.
      </Empty>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse">
        <thead>
          <tr className="border-b border-line">
            <th className={th} colSpan={2}>Photograph</th>
            <th className={`${th} text-right`}>Price</th>
            <th className={`${th} text-right`}>Sold</th>
            <th className={th}><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-line/60 transition-colors hover:bg-surface/60">
              <td className={`${td} w-[72px] pr-4`}>
                <Photo src={p.image_url} alt="" className="h-14 w-14" />
              </td>
              <td className={td}>
                <Link to={`/admin/photos/${p.id}`} className="font-medium hover:text-accent">{p.name}</Link>
                <p className="text-small text-muted">Added {formatDate(p.created_at)}</p>
              </td>
              <td className={`${td} num text-right`}>{formatPrice(p.price)}</td>
              <td className={`${td} num text-right`}>{sales[p.id] || 0}</td>
              <td className={`${td} w-[96px] text-right`}>
                <div className="inline-flex">
                  <Link to={`/admin/photos/${p.id}`} aria-label={`Edit ${p.name}`} title="Edit" className="inline-flex h-10 w-10 items-center justify-center transition-colors hover:bg-surface">
                    <Pencil size={18} strokeWidth={1.75} />
                  </Link>
                  <IconButton label={`Delete ${p.name}`} icon={Trash2} onClick={() => onDelete(p)} className="hover:text-danger" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrdersTable({ orders }) {
  if (!orders.length) {
    return (
      <Empty icon={Receipt} title="No orders yet" className="min-h-[24vh]">
        Buy something with the test card <span className="num text-ink">4242 4242 4242 4242</span> and it shows up here.
      </Empty>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse">
        <thead>
          <tr className="border-b border-line">
            <th className={th}>Date</th>
            <th className={th}>Customer</th>
            <th className={th}>Photographs</th>
            <th className={`${th} text-right`}>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-line/60">
              <td className={`${td} whitespace-nowrap pr-6 text-small text-muted`}>{formatDate(o.created_at)}</td>
              <td className={`${td} pr-6`}>{o.email}</td>
              <td className={`${td} pr-6 text-small`}>{o.items.map((i) => i.name).join(', ')}</td>
              <td className={`${td} num text-right`}>{formatPrice(o.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Dashboard() {
  const { products, setProducts, status, error, reload } = useProducts();
  const [overview, setOverview] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const notify = useToast();

  const loadOverview = useCallback(() => {
    api.get('/admin/overview').then(({ data }) => setOverview(data)).catch(() => setOverview(null));
  }, []);
  useEffect(loadOverview, [loadOverview]);

  const best = useMemo(() => {
    if (!overview) return null;
    const [id, count] = Object.entries(overview.sales_by_product).sort((a, b) => b[1] - a[1])[0] || [];
    const p = products.find((x) => x.id === id);
    return p ? { name: p.name, count } : null;
  }, [overview, products]);

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await api.delete(`/admin/products/${deleting.id}`);
      setProducts((list) => list.filter((p) => p.id !== deleting.id));
      notify(`${deleting.name} was removed from the shop`);
      setDeleting(null);
      loadOverview();
    } catch (err) {
      notify(errorMessage(err, 'Could not delete it'), 'error');
    } finally {
      setBusy(false);
    }
  };

  if (status === 'loading') return <Loading />;
  if (status === 'error') return <ErrorView message={error} onRetry={reload} />;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 pt-10">
        <div>
          <h1 className="text-[28px] font-medium leading-tight">Overview</h1>
          <p className="mt-1 text-small text-muted">
            Test-mode sales{overview ? `, stored in ${overview.storage === 'mongo' ? 'MongoDB' : 'a local JSON file'}` : ''}.
          </p>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-6 bg-surface p-6 md:grid-cols-4">
        <Figure label="Revenue" value={overview ? formatPrice(overview.revenue) : '—'} />
        <Figure label="Orders" value={overview ? overview.order_count : '—'} />
        <Figure label="Photographs" value={products.length} />
        <Figure label="Best seller, sold" value={best ? best.count : 0} note={best ? best.name : 'No sales yet'} />
      </dl>

      <section className="mt-14" aria-labelledby="photos-title">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 id="photos-title" className="text-[20px] font-medium">Photographs</h2>
          <span className="num text-small text-muted">{products.length} in the shop</span>
        </div>
        <PhotosTable products={products} sales={overview?.sales_by_product || {}} onDelete={setDeleting} />
      </section>

      <section className="mt-14" aria-labelledby="orders-title">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 id="orders-title" className="text-[20px] font-medium">Recent orders</h2>
          {overview && <span className="num text-small text-muted">{overview.order_count} total</span>}
        </div>
        <OrdersTable orders={overview?.orders || []} />
      </section>

      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete ${deleting?.name || 'this photograph'}?`}
        confirmLabel="Delete"
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      >
        It comes off the shop and its file is deleted. Past orders keep their record.
      </ConfirmDialog>
    </>
  );
}
