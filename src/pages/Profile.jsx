import React, { useEffect, useState } from "react";
import axios from "../utils/api.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [bulkOrders, setBulkOrders] = useState([]);
  const [freeSamples, setFreeSamples] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  // Removed unused state variables for lint clean
  const navigate = useNavigate();

  // Cancel order handler
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await axios.patch(`/api/orders/${orderId}/cancel`);
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: 'cancelled' } : o));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: 'cancelled' });
      }
    } catch (e) {
      alert('Failed to cancel order.');
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setOrdersLoading(true);
      try {
        const [ordersRes, bulkRes, sampleRes] = await Promise.all([
          axios.get('/api/orders/my'),
          axios.get('/api/bulk-orders/my'),
          axios.get('/api/free-samples/my'),
        ]);
        setOrders(ordersRes.data || []);
        setBulkOrders(bulkRes.data || []);
        setFreeSamples(sampleRes.data || []);
      } catch (e) {
        setOrders([]);
        setBulkOrders([]);
        setFreeSamples([]);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 via-green-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-green-50 to-white flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-md border border-green-100 p-8 max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Please log in</h1>
          <p className="text-slate-600">Your session might be expired. Log in to view your profile.</p>
          <div className="flex flex-col gap-3">
            <a href="/login" className="w-full py-3 rounded-lg font-semibold bg-green-700 text-white hover:bg-green-800">Go to Login</a>
            <a href="/" className="w-full py-3 rounded-lg font-semibold border border-green-200 text-green-700 hover:bg-green-50">Back to Home</a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-green-50 to-white py-8 px-2 md:px-8 flex flex-col items-center">
      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl"
              onClick={() => setShowOrderModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4 text-green-800 border-b pb-2">Order Details</h3>
            <div className="space-y-3 text-sm max-h-[60vh] overflow-y-auto pr-2">
              
              {/* Order Number */}
              <div className="bg-green-50 p-3 rounded-lg">
                <span className="font-semibold text-green-800">Order Number:</span>
                <div className="font-mono text-lg">{selectedOrder.orderNumber}</div>
              </div>

              {/* Status */}
              <div>
                <span className="font-semibold">Status:</span>
                <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                  selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  selectedOrder.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                  selectedOrder.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                  selectedOrder.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedOrder.status}
                </span>
              </div>

              {/* Items */}
              <div>
                <span className="font-semibold">Items:</span>
                <ul className="ml-2 mt-2 space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <li key={idx} className="flex gap-2 items-start">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                      )}
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-gray-600">Qty: {item.quantity} × ₹{item.price}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Shipping Address */}
              <div>
                <span className="font-semibold">Shipping Address:</span>
                <div className="ml-2 mt-1 text-gray-700">
                  <div>{selectedOrder.shippingAddress?.name}</div>
                  <div>{selectedOrder.shippingAddress?.street}</div>
                  <div>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}</div>
                  <div>{selectedOrder.shippingAddress?.phone}</div>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <span className="font-semibold">Payment Method:</span> {selectedOrder.paymentMethod}
              </div>
              <div>
                <span className="font-semibold">Payment Status:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                  selectedOrder.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                  selectedOrder.paymentStatus === 'Failed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedOrder.paymentStatus}
                </span>
              </div>

              {/* Pricing */}
              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between"><span>Items Price:</span><span>₹{selectedOrder.itemsPrice?.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Shipping:</span><span>₹{selectedOrder.shippingPrice?.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax (GST):</span><span>₹{selectedOrder.taxPrice?.toFixed(2)}</span></div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600"><span>Discount:</span><span>-₹{selectedOrder.discountAmount?.toFixed(2)}</span></div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span><span className="text-green-700">₹{selectedOrder.totalPrice?.toFixed(2)}</span>
                </div>
              </div>

              {/* Tracking Number */}
              {selectedOrder.trackingNumber && (
                <div>
                  <span className="font-semibold">Tracking Number:</span>
                  <div className="font-mono bg-gray-50 p-2 rounded mt-1">{selectedOrder.trackingNumber}</div>
                </div>
              )}

              {/* Dates */}
              <div className="text-xs text-gray-500 space-y-1">
                <div>Ordered: {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}</div>
                {selectedOrder.deliveredAt && (
                  <div>Delivered: {new Date(selectedOrder.deliveredAt).toLocaleString('en-IN')}</div>
                )}
              </div>
              {selectedOrder.status !== 'cancelled' && (
                <button
                  className="mt-4 px-4 py-2 rounded bg-red-100 text-red-700 font-semibold hover:bg-red-200"
                  onClick={() => handleCancelOrder(selectedOrder._id)}
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <section className="w-full max-w-5xl flex flex-col md:flex-row gap-8 md:gap-12 mb-8">
        {/* Profile Card */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg border border-green-100 p-8 flex flex-col items-center md:items-start min-w-0">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-4 shadow-inner">
            <span className="text-4xl font-bold text-green-700">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1 text-center md:text-left tracking-tight">{user?.name || 'User'}</h1>
          <p className="text-slate-600 text-center md:text-left text-lg">{user?.email}</p>
          {user?.phone && <p className="text-slate-600 text-center md:text-left text-lg">{user.phone}</p>}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-base text-slate-700">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="font-semibold text-green-800">Role</p>
              <p>{user?.role || 'user'}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="font-semibold text-green-800">Member Since</p>
              <p>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'N/A'}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="font-semibold text-green-800">Total Orders</p>
              <p>{orders.length + bulkOrders.length + freeSamples.length}</p>
            </div>
            {user?.lastLogin && (
              <div className="bg-green-50 rounded-lg p-4">
                <p className="font-semibold text-green-800">Last Login</p>
                <p>{new Date(user.lastLogin).toLocaleString('en-IN')}</p>
              </div>
            )}
          </div>
          <div className="mt-8 flex flex-wrap gap-4 w-full justify-center md:justify-start">
            <button
              onClick={() => navigate('/orders')}
              className="px-6 py-3 rounded-lg font-semibold bg-green-700 text-white hover:bg-green-800 text-base shadow"
            >
              View My Orders
            </button>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="px-6 py-3 rounded-lg font-semibold border border-red-200 text-red-700 hover:bg-red-50 text-base shadow"
            >
              Logout
            </button>
          </div>
        </div>
        {/* Recent Orders Card */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg border border-green-100 p-8 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-green-800 tracking-tight">Recent Orders</h2>
            <a href="/orders" className="text-base font-semibold text-green-700 hover:text-green-800">See all</a>
          </div>
          {ordersLoading ? (
            <p className="text-slate-600">Loading orders...</p>
          ) : (orders.length + bulkOrders.length + freeSamples.length) === 0 ? (
            <p className="text-slate-600">No orders yet.</p>
          ) : (
            <>
              {/* Show 3 most recent orders across all types */}
              <div className="space-y-4">
                {[
                  ...orders.map(o => ({
                    ...o,
                    _type: 'regular',
                    _created: new Date(o.createdAt),
                  })),
                  ...bulkOrders.map(b => ({
                    ...b,
                    _type: 'bulk',
                    _created: new Date(b.createdAt),
                  })),
                  ...freeSamples.map(s => ({
                    ...s,
                    _type: 'sample',
                    _created: new Date(s.createdAt),
                  })),
                ]
                  .sort((a, b) => b._created - a._created)
                  .slice(0, 3)
                  .map((order) => (
                    <div key={order._id} className={`border rounded-lg p-4 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3 sm:gap-2 ${order.status === 'cancelled' ? 'border-red-100 bg-red-50' : 'border-green-50'}`}>
                      <div className="min-w-0 flex-1 w-full sm:w-auto">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            order._type === 'regular' ? 'bg-blue-100 text-blue-700' :
                            order._type === 'bulk' ? 'bg-purple-100 text-purple-700' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order._type === 'regular' ? 'Order' : order._type === 'bulk' ? 'Bulk' : 'Sample'}
                          </span>
                          <span className="font-semibold text-gray-900 truncate">{order.orderNumber || order.orderId || order._id}</span>
                        </div>
                        <p className="text-sm text-slate-600">{order._created.toLocaleDateString('en-IN')}</p>
                      </div>
                      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 min-w-0 w-full sm:w-auto justify-between sm:justify-end">
                        {order._type === 'regular' && (
                          <p className="text-green-700 font-bold">₹{(order.totalPrice || order.total || 0).toFixed(2)}</p>
                        )}
                        <p className={`text-sm ${order.status === 'cancelled' ? 'text-red-700' : 'text-slate-600'}`}>{order.status}</p>
                        <div className="flex flex-row flex-wrap gap-2 w-full sm:w-auto justify-end">
                          <button
                            className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                              order._type === 'regular' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                              order._type === 'bulk' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                              'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            }`}
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderModal(true);
                            }}
                          >
                            Details
                          </button>
                          {order.status !== 'cancelled' && (
                            <button
                              className="px-3 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 whitespace-nowrap"
                              onClick={() => handleCancelOrder(order._id)}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}