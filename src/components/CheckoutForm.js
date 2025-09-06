import React, { useState } from 'react';
import {
  useStripe,
  useElements,
  CardElement
} from '@stripe/react-stripe-js';
import axios from 'axios';
import TestCardInfo from './TestCardInfo';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#424770',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#9e2146',
      iconColor: '#9e2146'
    }
  }
};

const CheckoutForm = ({ product, email, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create payment intent
      const { data } = await axios.post('http://localhost:5003/create-payment-intent', {
        product_id: product.id,
        email: email
      });

      // Confirm payment
      const result = await stripe.confirmCardPayment(data.client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            email: email,
          },
        }
      });

      if (result.error) {
        setError(result.error.message);
        setProcessing(false);
      } else {
        // Payment succeeded
        await axios.post('http://localhost:5003/confirm-payment', {
          payment_intent_id: result.paymentIntent.id
        });
        
        setSucceeded(true);
        setProcessing(false);
        onSuccess(result.paymentIntent);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed');
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Complete Your Purchase</h3>
      
      <div className="mb-4 p-4 bg-gray-50 rounded">
        <p><strong>Product:</strong> {product.name}</p>
        <p><strong>Price:</strong> ${product.price}</p>
        <p><strong>Email:</strong> {email}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <TestCardInfo />
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card details
          </label>
          <div className="p-3 border border-gray-300 rounded-md">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {succeeded && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            Payment succeeded! Check your email for confirmation.
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!stripe || processing || succeeded}
            className={`flex-1 py-2 px-4 rounded font-medium ${
              !stripe || processing || succeeded
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {processing ? 'Processing...' : `Pay $${product.price}`}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;