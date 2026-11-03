import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Lock, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { api, errorMessage } from '../lib/api';
import { getStripe } from '../lib/stripe';
import { rememberOrder } from '../lib/orders';
import { formatPrice } from '../lib/format';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { Empty, ErrorView, Loading } from '../components/ui/StatusView';
import { CartLines } from '../components/shop/CartDrawer';
import { TestCards } from '../components/shop/TestCards';

const cssVar = (name) => `rgb(${getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim().split(/\s+/).join(',')})`;

// Stripe's form takes the page's own colours, type and square corners.
function appearance(dark) {
  return {
    theme: dark ? 'night' : 'stripe',
    variables: {
      colorPrimary: cssVar('accent'),
      colorBackground: cssVar('bg'),
      colorText: cssVar('ink'),
      colorTextSecondary: cssVar('muted'),
      colorDanger: cssVar('danger'),
      fontFamily: '"Albert Sans", system-ui, sans-serif',
      fontSizeBase: '17px',
      borderRadius: '0px',
      spacingUnit: '4px',
    },
    rules: {
      '.Input': { border: `1px solid ${cssVar('line')}`, boxShadow: 'none', padding: '14px 16px' },
      '.Input:focus': { borderColor: cssVar('accent'), boxShadow: `0 0 0 1px ${cssVar('accent')}` },
      '.Label': { fontWeight: '500', color: cssVar('ink') },
    },
  };
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function PaymentForm({ items, total }) {
  const stripe = useStripe();
  const elements = useElements();
  const cart = useCart();
  const notify = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (!EMAIL_RE.test(email.trim())) {
      setEmailError('Enter the email address the receipt should go to');
      return;
    }
    setEmailError('');
    setError('');
    setBusy(true);
    try {
      const { error: formError } = await elements.submit();
      if (formError) throw new Error(formError.message);

      const { data } = await api.post('/checkout/intent', { email: email.trim(), product_ids: items.map((i) => i.id) });
      const { error: payError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: data.client_secret,
        confirmParams: { receipt_email: email.trim(), return_url: `${window.location.origin}/checkout` },
        redirect: 'if_required',
      });
      if (payError) throw new Error(payError.message);
      if (paymentIntent?.status !== 'succeeded') throw new Error('The payment did not complete. Try again.');

      const { data: order } = await api.post('/checkout/confirm', { payment_intent_id: paymentIntent.id });
      rememberOrder(order);
      cart.clear();
      notify('Payment received');
      navigate(`/order/${order.id}`, { replace: true });
    } catch (err) {
      setError(err.response ? errorMessage(err) : err.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-8">
      <Field
        label="Email for the receipt"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={emailError}
        hint="The photographs are sent here as attachments."
      />
      <div>
        <PaymentElement onReady={() => setReady(true)} options={{ layout: 'tabs', wallets: { link: 'never', applePay: 'never', googlePay: 'never' } }} />
        {!ready && <Loading label="Loading the card form" className="min-h-[180px]" />}
      </div>
      {error && (
        <p role="alert" className="bg-danger/10 px-4 py-3 text-danger">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" loading={busy} disabled={!stripe || !ready} icon={Lock}>
        {busy ? 'Paying' : `Pay ${formatPrice(total)}`}
      </Button>
      <TestCards />
    </form>
  );
}

export default function Checkout() {
  const { items, total } = useCart();
  const { dark } = useTheme();
  const [stripe, setStripe] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    getStripe()
      .then(setStripe)
      .catch((err) => setLoadError(errorMessage(err, 'Could not load the payment form')));
  }, []);

  const amount = Math.round(total * 100);
  const options = useMemo(
    () => ({
      mode: 'payment',
      currency: 'usd',
      amount: Math.max(amount, 50),
      paymentMethodTypes: ['card'],
      appearance: appearance(dark),
      fonts: [{ cssSrc: 'https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500&display=swap' }],
    }),
    // the Elements group is remounted (see key below) when the theme changes; the amount updates in place
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dark],
  );

  if (!items.length) {
    return (
      <Empty icon={ShoppingBag} title="Your cart is empty" className="min-h-[70vh]" action={<Button to="/#photographs">Browse the photographs</Button>}>
        Add a photograph or two, then come back here to pay.
      </Empty>
    );
  }

  return (
    <section className="page-x grid gap-16 pb-8 pt-12 lg:grid-cols-12 lg:pt-20" aria-labelledby="checkout-title">
      <div className="lg:col-span-5">
        <h1 id="checkout-title" className="display text-head">Checkout</h1>
        <p className="mt-4 text-muted">
          {items.length} {items.length === 1 ? 'photograph' : 'photographs'}, delivered as soon as the payment goes through.
        </p>
        <div className="mt-12">
          <CartLines />
        </div>
        <div className="mt-8 flex items-baseline justify-between bg-surface px-5 py-5">
          <span>Total</span>
          <span className="num text-lead font-medium">{formatPrice(total)}</span>
        </div>
      </div>
      <div className="lg:col-span-6 lg:col-start-7">
        {loadError ? (
          <ErrorView message={loadError} onRetry={() => window.location.reload()} />
        ) : stripe ? (
          <Elements key={dark ? 'dark' : 'light'} stripe={stripe} options={options}>
            <AmountSync amount={amount} />
            <PaymentForm items={items} total={total} />
          </Elements>
        ) : (
          <Loading label="Loading the payment form" />
        )}
      </div>
    </section>
  );
}

// Keeps Stripe's deferred amount in step when photographs are removed from the cart on this page.
function AmountSync({ amount }) {
  const elements = useElements();
  useEffect(() => {
    if (elements && amount >= 50) elements.update({ amount });
  }, [elements, amount]);
  return null;
}
