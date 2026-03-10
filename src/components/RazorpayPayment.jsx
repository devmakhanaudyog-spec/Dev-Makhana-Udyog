import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function RazorpayPayment({ amount, onSuccess, onFailure, userData, orderId }) {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    const res = await loadRazorpayScript();

    if (!res) {
      toast.error('Razorpay SDK failed to load. Please check your internet connection.');
      setLoading(false);
      return;
    }

    try {
      // Create Razorpay order
      const { data } = await axios.post('/api/payments/razorpay/create-order', {
        amount,
        currency: 'INR',
        receipt: orderId || `receipt_${Date.now()}`
      });

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'Dev Mkahna Udyog',
        description: 'Order Payment',
        order_id: data.orderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResult = await axios.post('/api/payments/razorpay/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResult.data.success) {
              toast.success('Payment successful!');
              onSuccess({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                paymentMethod: 'Razorpay'
              });
            } else {
              toast.error('Payment verification failed');
              onFailure('Payment verification failed');
            }
          } catch (error) {
            toast.error('Payment verification failed');
            onFailure(error.message);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: userData.name,
          email: userData.email,
          contact: userData.phone
        },
        theme: {
          color: '#4F46E5'
        },
        modal: {
          ondismiss: function() {
            toast.error('Payment cancelled');
            onFailure('Payment cancelled by user');
            setLoading(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Razorpay error:', error);
      toast.error(error.response?.data?.error || 'Payment failed');
      onFailure(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Methods Display */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-center">
          <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" className="h-8" />
        </div>
        <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-center">
          <img src="https://img.icons8.com/color/48/000000/mastercard.png" alt="Mastercard" className="h-8" />
        </div>
        <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-center">
          <img src="https://img.icons8.com/color/48/000000/rupay.png" alt="RuPay" className="h-8" />
        </div>
        <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-center">
          <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.5 3h-15C3.67 3 3 3.67 3 4.5v15c0 .83.67 1.5 1.5 1.5h15c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5zm-7.5 14c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
          </svg>
        </div>
      </div>

      {/* Accepted Methods */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-blue-900 mb-2">✨ Accepted Payment Methods</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
          <div className="flex items-center gap-1">
            <span className="text-green-600">✓</span> UPI (Google Pay, PhonePe)
          </div>
          <div className="flex items-center gap-1">
            <span className="text-green-600">✓</span> Credit/Debit Cards
          </div>
          <div className="flex items-center gap-1">
            <span className="text-green-600">✓</span> Net Banking
          </div>
          <div className="flex items-center gap-1">
            <span className="text-green-600">✓</span> Wallets (Paytm, etc)
          </div>
        </div>
      </div>

      {/* Pay Button */}
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Loading Razorpay...</span>
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
          <span className="font-medium">Bank-grade security</span>
        </div>
        <span className="text-gray-300">•</span>
        <div className="text-xs text-gray-500">
          Powered by <span className="font-semibold text-blue-600">Razorpay</span>
        </div>
      </div>
    </div>
  );
}
