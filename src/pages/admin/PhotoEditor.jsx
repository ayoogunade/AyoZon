import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ImageUp } from 'lucide-react';
import { api, assetUrl, errorMessage } from '../../lib/api';
import { formatPrice } from '../../lib/format';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { Empty, Loading } from '../../components/ui/StatusView';

const MAX_MB = 25;
const EMPTY = { name: '', price: '', description: '', credit: '' };

function ImagePicker({ preview, onFile, error }) {
  const input = useRef(null);
  const [over, setOver] = useState(false);

  const take = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return onFile(null, 'Choose an image file (JPG, PNG, GIF or WebP)');
    if (file.size > MAX_MB * 1024 * 1024) return onFile(null, `Images must be under ${MAX_MB} MB`);
    onFile(file);
  };

  return (
    <div>
      <span className="mb-2 block text-small font-medium">Photograph</span>
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          take(e.dataTransfer.files?.[0]);
        }}
        className={`group relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden transition-colors ${over ? 'bg-accent/15' : 'bg-surface hover:bg-surface-2'}`}
        aria-label={preview ? 'Replace the photograph' : 'Choose a photograph'}
      >
        {preview ? (
          <>
            <img src={preview} alt="" className="h-full w-full object-cover" />
            <span className="absolute inset-x-0 bottom-0 flex h-12 items-center justify-center gap-2 bg-bg text-small opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <ImageUp size={18} strokeWidth={1.75} aria-hidden="true" /> Replace
            </span>
          </>
        ) : (
          <span className="flex flex-col items-center gap-3 px-6 text-center text-muted">
            <ImageUp size={28} strokeWidth={1.5} aria-hidden="true" />
            <span>
              <span className="text-ink">Choose a file</span> or drop it here
            </span>
            <span className="text-small">JPG, PNG, GIF or WebP, up to {MAX_MB} MB</span>
          </span>
        )}
      </button>
      <input ref={input} type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="sr-only" tabIndex={-1} onChange={(e) => take(e.target.files?.[0])} />
      {error && <p className="mt-2 text-small text-danger">{error}</p>}
    </div>
  );
}

export default function PhotoEditor() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const notify = useToast();
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(editing ? 'loading' : 'ready');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;
    api
      .get(`/products/${id}`)
      .then(({ data }) => {
        setForm({ name: data.name, price: String(data.price), description: data.description, credit: data.credit || '' });
        setPreview(assetUrl(data.image_url));
        setStatus('ready');
      })
      .catch(() => setStatus('missing'));
  }, [editing, id]);

  // Free the object URL of a picked file when it is replaced.
  useEffect(() => () => preview.startsWith('blob:') && URL.revokeObjectURL(preview), [preview]);

  const set = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    if (errors[key]) setErrors({ ...errors, [key]: undefined });
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Give it a name';
    const price = Number(form.price);
    if (!form.price || Number.isNaN(price)) next.price = 'Enter a price';
    else if (price < 0.5) next.price = 'Stripe’s minimum is $0.50';
    if (!form.description.trim()) next.description = 'A sentence or two about the photograph';
    if (!editing && !file) next.image = 'Add the photograph itself';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const body = new FormData();
    Object.entries(form).forEach(([k, v]) => body.append(k, v.trim()));
    if (file) body.append('image', file);
    try {
      if (editing) await api.put(`/admin/products/${id}`, body);
      else await api.post('/admin/products', body);
      notify(editing ? 'Changes saved' : `${form.name.trim()} is in the shop`);
      navigate('/admin');
    } catch (err) {
      notify(errorMessage(err, 'Could not save'), 'error');
      setSaving(false);
    }
  };

  if (status === 'loading') return <Loading />;
  if (status === 'missing')
    return <Empty title="Photograph not found" action={<Button to="/admin" variant="secondary">Back to the overview</Button>} />;

  return (
    <div className="mx-auto max-w-5xl pt-10">
      <Link to="/admin" className="inline-flex items-center gap-2 text-small text-muted transition-colors hover:text-ink">
        <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" /> Overview
      </Link>
      <h1 className="mt-6 text-[28px] font-medium leading-tight">{editing ? `Edit ${form.name || 'photograph'}` : 'New photograph'}</h1>

      <form onSubmit={submit} noValidate className="mt-10 grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <ImagePicker
            preview={preview}
            error={errors.image}
            onFile={(f, problem) => {
              setErrors((x) => ({ ...x, image: problem }));
              if (f) {
                setFile(f);
                setPreview(URL.createObjectURL(f));
              }
            }}
          />
          {form.name && (
            <p className="mt-4 flex justify-between text-small">
              <span className="font-medium">{form.name}</span>
              <span className="num text-muted">{form.price ? formatPrice(form.price) : ''}</span>
            </p>
          )}
        </div>
        <div className="space-y-6">
          <Field label="Name" value={form.name} onChange={set('name')} error={errors.name} placeholder="First Frost" />
          <Field label="Price in US dollars" type="number" inputMode="decimal" step="0.01" min="0.5" value={form.price} onChange={set('price')} error={errors.price} placeholder="14.00" />
          <Field label="Description" textarea rows={5} value={form.description} onChange={set('description')} error={errors.description} hint="Shown on the photograph’s page. Say what is in the frame." />
          <Field label="Photo credit" value={form.credit} onChange={set('credit')} hint="Optional. Leave blank for your own work." />
          <div className="flex gap-3 pt-4">
            <Button type="submit" loading={saving}>
              {editing ? 'Save changes' : 'Add to the shop'}
            </Button>
            <Button to="/admin" variant="secondary">
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
