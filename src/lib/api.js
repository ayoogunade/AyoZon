import axios from 'axios';

// Same-origin in development (Vite proxies /api). Set VITE_API_URL when the API lives elsewhere.
const base = import.meta.env.VITE_API_URL || '';

export const api = axios.create({ baseURL: `${base}/api`, withCredentials: true });

export const assetUrl = (path) => (path && path.startsWith('/') ? `${base}${path}` : path);

export const errorMessage = (err, fallback = 'Something went wrong') =>
  err?.response?.data?.error || (err?.request && !err?.response ? 'Cannot reach the server' : fallback);

export const downloadUrl = (order, productId) =>
  `${base}/api/orders/${order.id}/download/${productId}?token=${encodeURIComponent(order.token)}`;
