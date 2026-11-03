import { useParams } from 'react-router-dom';
import { Download, Mail, MailX, Receipt } from 'lucide-react';
import { findOrder } from '../lib/orders';
import { downloadUrl } from '../lib/api';
import { formatDate, formatPrice } from '../lib/format';
import { Button } from '../components/ui/Button';
import { Photo } from '../components/ui/Photo';
import { Empty } from '../components/ui/StatusView';

export default function OrderPage() {
  const { id } = useParams();
  const order = findOrder(id);

  if (!order) {
    return (
      <Empty icon={Receipt} title="Order not found in this browser" className="min-h-[70vh]" action={<Button to="/" variant="secondary">Back to the shop</Button>}>
        Download links are kept in the browser that placed the order. The email copy has every file attached.
      </Empty>
    );
  }

  const MailIcon = order.email_sent ? Mail : MailX;
  return (
    <section className="page-x grid gap-16 pb-8 pt-12 lg:grid-cols-12 lg:pt-20" aria-labelledby="order-title">
      <div className="lg:col-span-5">
        <h1 id="order-title" className="display text-head">Thank you</h1>
        <p className="mt-6 max-w-[40ch] text-lead">
          Your {order.items.length === 1 ? 'photograph is' : 'photographs are'} ready. Download {order.items.length === 1 ? 'it' : 'them'} now.
        </p>
        <p className="mt-8 flex items-start gap-3 text-muted">
          <MailIcon size={20} strokeWidth={1.75} className="mt-1 shrink-0" aria-hidden="true" />
          <span>
            {order.email_sent
              ? <>A copy with the files attached is on its way to <span className="text-ink">{order.email}</span>.</>
              : <>The email copy to <span className="text-ink">{order.email}</span> could not be sent, so use the buttons here.</>}
          </span>
        </p>
        <dl className="mt-12 grid grid-cols-2 gap-6 bg-surface p-5 text-small">
          <div>
            <dt className="text-muted">Order</dt>
            <dd className="num mt-1 break-all">{order.id}</dd>
          </div>
          <div>
            <dt className="text-muted">Date</dt>
            <dd className="mt-1">{formatDate(order.created_at)}</dd>
          </div>
          <div>
            <dt className="text-muted">Paid</dt>
            <dd className="num mt-1">{formatPrice(order.total)}</dd>
          </div>
          <div>
            <dt className="text-muted">Status</dt>
            <dd className="mt-1">Paid, test mode</dd>
          </div>
        </dl>
      </div>

      <ul className="space-y-10 lg:col-span-6 lg:col-start-7">
        {order.items.map((item) => (
          <li key={item.product_id} className="grid grid-cols-[120px_1fr] items-center gap-6 sm:grid-cols-[180px_1fr]">
            <Photo src={item.image_url} alt={item.name} className="aspect-[4/5]" />
            <div>
              <h2 className="text-lead font-medium">{item.name}</h2>
              <p className="num mt-1 text-muted">{formatPrice(item.price)}</p>
              <Button href={downloadUrl(order, item.product_id)} icon={Download} variant="ink" size="sm" className="mt-5">
                Download
              </Button>
            </div>
          </li>
        ))}
        <li>
          <Button to="/#photographs" variant="secondary">
            Keep browsing
          </Button>
        </li>
      </ul>
    </section>
  );
}
