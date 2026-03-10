import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import toast from 'react-hot-toast';

// Load Stripe with proper key validation
const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

if (!publishableKey || publishableKey === 'pk_test_dummy' || !publishableKey.startsWith('pk_')) {
  console.error('❌ Invalid Stripe Publishable Key. Please check .env.local file.');
  console.error('Current key:', publishableKey);
}

const stripePromise = publishableKey && publishableKey.startsWith('pk_') 
  ? loadStripe(publishableKey)
  : null;

const CheckoutForm = ({ amount, onSuccess, onFailure, userData }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const { data } = await axios.post('/api/payments/stripe/create-intent', {
          amount,
          currency: 'inr',
          metadata: {
            name: userData.name,
            email: userData.email
          }
        });
        setClientSecret(data.clientSecret);
      } catch (error) {
        toast.error('Failed to initialize payment');
        onFailure(error.message);
      }
    };

    if (amount) {
      createPaymentIntent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, userData]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: userData.name,
            email: userData.email,
            phone: userData.phone
          }
        }
      });

      if (error) {
        toast.error(error.message);
        onFailure(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!');
        onSuccess({
          paymentId: paymentIntent.id,
          paymentMethod: 'Stripe'
        });
      }
    } catch (error) {
      toast.error('Payment failed');
      onFailure(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const cardStyle = {
    style: {
      base: {
        color: '#1a202c',
        fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        fontWeight: '500',
        '::placeholder': {
          color: '#a0aec0'
        },
        iconColor: '#667eea',
      },
      invalid: {
        color: '#e53e3e',
        iconColor: '#e53e3e'
      },
      complete: {
        color: '#38a169',
        iconColor: '#38a169'
      }
    },
    hidePostalCode: true
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Logos */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-700">Pay with Card</span>
        <div className="flex gap-2">
          <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" className="h-8" />
          <img src="https://img.icons8.com/color/48/000000/mastercard.png" alt="Mastercard" className="h-8" />
          <img src="https://img.icons8.com/color/48/000000/amex.png" alt="Amex" className="h-8" />
        </div>
      </div>

      {/* Card Input */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Information
        </label>
        <div className="p-4 border-2 border-gray-300 rounded-xl hover:border-indigo-400 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 transition-all duration-200 bg-white">
          <CardElement options={cardStyle} />
        </div>
      </div>

      {/* Test Card Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800 font-medium mb-1">🧪 Test Card</p>
        <p className="text-xs text-blue-600 font-mono">4242 4242 4242 4242 • Any CVV • Any Future Date</p>
      </div>

      {/* Pay Button */}
      <button
        type="submit"
        disabled={!stripe || processing || !clientSecret}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Pay ₹{amount?.toFixed(2)}</span>
          </>
        )}
      </button>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">256-bit SSL encrypted</span>
        </div>
        <span className="text-gray-300">•</span>
        <div className="text-xs text-gray-500">
          Powered by <span className="font-semibold text-indigo-600">Stripe</span>
        </div>
      </div>
    </form>
  );
};

export default function StripePayment({ amount, onSuccess, onFailure, userData }) {
  // Show error if Stripe is not properly configured
  if (!stripePromise) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
        <div className="text-red-600 text-lg font-bold mb-2">⚠️ Stripe Not Configured</div>
        <p className="text-red-700 text-sm mb-3">
          The Stripe publishable key is missing or invalid.
        </p>
        <div className="bg-red-100 rounded-lg p-3 text-left text-xs font-mono text-red-800">
          <p className="font-bold mb-1">To fix this:</p>
          <p>1. Check your <span className="font-bold">.env.local</span> file</p>
          <p>2. Ensure REACT_APP_STRIPE_PUBLISHABLE_KEY is set</p>
          <p>3. It should start with: <span className="font-bold">pk_test_</span> or <span className="font-bold">pk_live_</span></p>
          <p>4. Restart your frontend server</p>
        </div>
        <button
          onClick={() => onFailure('Stripe not configured properly')}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        amount={amount}
        onSuccess={onSuccess}
        onFailure={onFailure}
        userData={userData}
      />
    </Elements>
  );
}
