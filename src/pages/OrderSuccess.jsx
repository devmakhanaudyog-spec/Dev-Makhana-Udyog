import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

export default function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state?.orderData;

  useEffect(() => {
    if (!orderData) {
      navigate('/');
    }
  }, [orderData, navigate]);

  if (!orderData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Order Placed Successfully!
          </h1>
          
          <p className="text-gray-600 mb-8">
            Thank you for your order. We've received your order and will process it shortly.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">Order Number</span>
              <span className="font-bold">{orderData.orderNumber}</span>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-semibold">{orderData.paymentMethod}</span>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">Payment Status</span>
              <span className={`font-semibold ${orderData.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                {orderData.paymentStatus}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Amount</span>
              <span className="text-2xl font-bold text-pink-600">
                ₹{orderData.totalPrice?.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/profile')}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              <Package size={20} />
              View My Orders
              <ArrowRight size={20} />
            </button>
            
            <button
              onClick={() => navigate('/products')}
              className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Continue Shopping
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>What's next?</strong><br />
              We'll send you an email confirmation with your order details and tracking information once your order ships.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
