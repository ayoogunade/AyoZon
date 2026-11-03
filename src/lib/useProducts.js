import { useCallback, useEffect, useState } from 'react';
import { api, errorMessage } from './api';

// One place that loads the catalogue, shared by the shop and the admin.
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
      setStatus('ready');
    } catch (err) {
      setError(errorMessage(err, 'Could not load the photographs'));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { products, setProducts, status, error, reload };
}

export function useProduct(id) {
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let live = true;
    setStatus('loading');
    api
      .get(`/products/${id}`)
      .then(({ data }) => live && (setProduct(data), setStatus('ready')))
      .catch((err) => live && setStatus(err?.response?.status === 404 ? 'missing' : 'error'));
    return () => {
      live = false;
    };
  }, [id]);

  return { product, status };
}
