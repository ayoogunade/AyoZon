import { loadStripe } from '@stripe/stripe-js';
import { api } from './api';

let promise;

export const getStripe = () => {
  if (!promise) {
    promise = api.get('/config').then(({ data }) => loadStripe(data.publishable_key));
    promise.catch(() => {
      promise = undefined; // allow a retry
    });
  }
  return promise;
};
