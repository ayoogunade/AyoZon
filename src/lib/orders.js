import { load, save } from './storage';

// Orders placed in this browser, so the order page and its downloads survive a refresh.
const KEY = 'ayozon:orders';

export const rememberOrder = (order) => save(KEY, [order, ...load(KEY, []).filter((o) => o.id !== order.id)].slice(0, 20));
export const findOrder = (id) => load(KEY, []).find((o) => o.id === id) || null;
