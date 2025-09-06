import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

let stripePromise;

export const getStripe = async () => {
  if (!stripePromise) {
    try {
      // Get publishable key from backend
      const { data } = await axios.get('http://localhost:5003/config');
      stripePromise = loadStripe(data.publishable_key);
    } catch (error) {
      console.error('Failed to load Stripe:', error);
      throw error;
    }
  }
  return stripePromise;
};