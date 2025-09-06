// src/components/ProductList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';
import { getStripe } from '../utils/stripe';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buyingProduct, setBuyingProduct] = useState(null);
  const [email, setEmail] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5003/products');
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch products');
        setLoading(false);
      }
    };

    const initStripe = async () => {
      try {
        const stripe = await getStripe();
        setStripePromise(stripe);
      } catch (err) {
        console.error('Failed to initialize Stripe:', err);
      }
    };

    fetchProducts();
    initStripe();
  }, []);

  const handleBuyNow = (product) => {
    if (!email) {
      alert('Please enter your email');
      return;
    }

    if (!email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setShowCheckout(true);
  };

  const handlePaymentSuccess = (paymentIntent) => {
    alert('Payment successful! Check your email for confirmation and download instructions.');
    setEmail('');
    setBuyingProduct(null);
    setShowCheckout(false);
  };

  const handlePaymentCancel = () => {
    setShowCheckout(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  // Show checkout form if user is in checkout flow
  if (showCheckout && buyingProduct && stripePromise) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Elements stripe={stripePromise}>
          <CheckoutForm
            product={buyingProduct}
            email={email}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </Elements>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Available Photos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg shadow-lg p-4 flex flex-col">
            {product.image_url ? (
              <div className="w-full flex justify-center mb-4">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="max-w-full max-h-80 object-contain rounded-md"
                />
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
            <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
            <p className="text-gray-600 mb-4">{product.description}</p>
            <div className="flex flex-col gap-4">
              <span className="text-lg font-bold">${product.price}</span>
              {buyingProduct?.id === product.id ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="px-3 py-2 border rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button 
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex-1"
                      onClick={() => handleBuyNow(product)}
                    >
                      Proceed to Payment
                    </button>
                    <button 
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                      onClick={() => setBuyingProduct(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  onClick={() => setBuyingProduct(product)}
                >
                  Buy Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;