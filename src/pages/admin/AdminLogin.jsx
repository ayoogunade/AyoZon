import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useProducts } from '../../lib/useProducts';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { Photo } from '../../components/ui/Photo';
import { Wordmark } from '../../components/Wordmark';

export default function AdminLogin() {
  const { isAdmin, checking, login } = useAdmin();
  const { products } = useProducts();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!checking && isAdmin) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const result = await login(form.username, form.password);
    setBusy(false);
    if (result.ok) navigate(location.state?.from || '/admin', { replace: true });
    else setError(result.message);
  };

  const cover = products[1] || products[0];
  return (
    <div className="grid min-h-svh gap-3 p-3 lg:grid-cols-2">
      <div className="hidden lg:block">
        <Photo src={cover?.image_url} alt={cover?.name || ''} className="h-full" eager />
      </div>
      <main id="main" className="flex flex-col bg-surface p-6 sm:p-12">
        <div className="flex items-center justify-between">
          <Wordmark />
          <Link to="/" className="inline-flex items-center gap-2 text-small text-muted transition-colors hover:text-ink">
            <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" /> Shop
          </Link>
        </div>
        <div className="mx-auto my-auto w-full max-w-[400px] py-16">
          <h1 className="display text-head">Admin sign-in</h1>
          <p className="mt-4 text-muted">Manage the photographs and see the orders.</p>
          <form onSubmit={submit} className="mt-10 space-y-6">
            <Field label="Username" name="username" autoComplete="username" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            <Field label="Password" name="password" type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            {error && <p role="alert" className="bg-danger/10 px-4 py-3 text-danger">{error}</p>}
            <Button type="submit" className="w-full" loading={busy}>
              Sign in
            </Button>
          </form>
          <p className="mt-8 bg-bg px-4 py-3 text-small text-muted">
            Demo login: <span className="text-ink">admin</span> / <span className="text-ink">admin123</span>
          </p>
        </div>
      </main>
    </div>
  );
}
