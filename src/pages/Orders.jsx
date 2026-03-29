
import React, { useEffect, useState, useRef } from "react";
import axios from "../utils/api.js";
import { useAuth } from "../context/AuthContext";



export default function Orders() {
    // Status selector state
    // Use capitalized status values to match backend and data
    const STATUS_OPTIONS = [
      { label: "All", value: "all" },
      { label: "Pending", value: "Pending" },
      { label: "Processing", value: "Processing" },
      { label: "Shipped", value: "Shipped" },
      { label: "Delivered", value: "Delivered" },
      { label: "Cancelled", value: "Cancelled" },
    ];
    const [selectedStatus, setSelectedStatus] = useState("all");
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [bulkOrders, setBulkOrders] = useState([]);
  const [bulkOrdersLoading, setBulkOrdersLoading] = useState(true);
  const [freeSamples, setFreeSamples] = useState([]);
  const [freeSamplesLoading, setFreeSamplesLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedBulkOrder, setSelectedBulkOrder] = useState(null);
  const [showBulkOrderModal, setShowBulkOrderModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'regular', 'bulk', 'sample'


  // Cancel regular order
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

  // Cancel bulk order
  const handleCancelBulkOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this bulk order?')) return;
    try {
      await axios.patch(`/api/bulk-orders/${orderId}/cancel`);
      setBulkOrders((prev) => prev.map((b) => b._id === orderId ? { ...b, status: 'cancelled' } : b));
      if (selectedBulkOrder && selectedBulkOrder._id === orderId) {
        setSelectedBulkOrder({ ...selectedBulkOrder, status: 'cancelled' });
      }
    } catch (e) {
      alert('Failed to cancel bulk order.');
    }
  };

  // Cancel free sample order
  const handleCancelFreeSample = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this free sample request?')) return;
    try {
      await axios.patch(`/api/free-samples/${orderId}/cancel`);
      setFreeSamples((prev) => prev.map((s) => s._id === orderId ? { ...s, status: 'cancelled' } : s));
      if (selectedSample && selectedSample._id === orderId) {
        setSelectedSample({ ...selectedSample, status: 'cancelled' });
      }
    } catch (e) {
      alert('Failed to cancel free sample request.');
    }
  };


  const fetchAllRef = useRef();
  const fetchAll = async () => {
    setOrdersLoading(true);
    setBulkOrdersLoading(true);
    setFreeSamplesLoading(true);
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
      setBulkOrdersLoading(false);
      setFreeSamplesLoading(false);
    }
  };
  fetchAllRef.current = fetchAll;

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => {
      if (fetchAllRef.current) fetchAllRef.current();
    }, 60000); // 60 seconds
    return () => clearInterval(interval);
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
          <p className="text-slate-600">Your session might be expired. Log in to view your orders.</p>
          <div className="flex flex-col gap-3">
            <a href="/login" className="w-full py-3 rounded-lg font-semibold bg-green-700 text-white hover:bg-green-800">Go to Login</a>
            <a href="/" className="w-full py-3 rounded-lg font-semibold border border-green-200 text-green-700 hover:bg-green-50">Back to Home</a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-green-50 to-white py-12 px-4">
      {/* Refresh Button */}
      <div className="max-w-4xl mx-auto mb-4 flex justify-end">
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2 rounded font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition disabled:opacity-60"
          disabled={ordersLoading || bulkOrdersLoading || freeSamplesLoading}
          title="Refresh orders"
        >
          <svg className={`w-5 h-5 ${ordersLoading || bulkOrdersLoading || freeSamplesLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5.635 19A9 9 0 1 1 19 5.635" /></svg>
          Refresh
        </button>
      </div>

      {/* Category Preview Cards */}
      <div className="max-w-4xl mx-auto mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Regular Orders Counter */}
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6 flex flex-col items-center cursor-pointer hover:shadow-xl transition min-w-0 w-full" onClick={() => setActiveTab('regular')}>
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-2">
            <span className="text-2xl font-bold text-green-700">{orders.length}</span>
          </div>
          <div className="text-lg font-semibold text-green-800">Regular Orders</div>
        </div>
        {/* Bulk Orders Counter */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 flex flex-col items-center cursor-pointer hover:shadow-xl transition min-w-0 w-full" onClick={() => setActiveTab('bulk')}>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-2">
            <span className="text-2xl font-bold text-blue-700">{bulkOrders.length}</span>
          </div>
          <div className="text-lg font-semibold text-blue-800">Bulk Orders</div>
        </div>
        {/* Free Sample Counter */}
        <div className="bg-white rounded-2xl shadow-lg border border-yellow-100 p-6 flex flex-col items-center cursor-pointer hover:shadow-xl transition min-w-0 w-full" onClick={() => setActiveTab('sample')}>
          <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center mb-2">
            <span className="text-2xl font-bold text-yellow-700">{freeSamples.length}</span>
          </div>
          <div className="text-lg font-semibold text-yellow-800">Free Sample Requests</div>
        </div>
      </div>
      {/* Tabbed View for All Orders in Category */}
      <div className="max-w-4xl mx-auto mb-8 flex flex-wrap gap-2 sm:gap-3 justify-center">
        <button className={`px-3 py-2 rounded font-semibold text-sm sm:text-base ${activeTab === 'summary' ? 'bg-green-700 text-white' : 'bg-green-50 text-green-700'}`} onClick={() => setActiveTab('summary')}>Summary</button>
        <button className={`px-3 py-2 rounded font-semibold text-sm sm:text-base ${activeTab === 'regular' ? 'bg-green-700 text-white' : 'bg-green-50 text-green-700'}`} onClick={() => setActiveTab('regular')}>Regular Orders</button>
        <button className={`px-3 py-2 rounded font-semibold text-sm sm:text-base ${activeTab === 'bulk' ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-700'}`} onClick={() => setActiveTab('bulk')}>Bulk Orders</button>
        <button className={`px-3 py-2 rounded font-semibold text-sm sm:text-base ${activeTab === 'sample' ? 'bg-yellow-700 text-white' : 'bg-yellow-50 text-yellow-700'}`} onClick={() => setActiveTab('sample')}>Free Samples</button>
      </div>
      {/* Status Selector Tabs (for all tabs) */}
      {(activeTab === 'regular' || activeTab === 'bulk' || activeTab === 'sample') && (
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex flex-wrap gap-2 md:gap-4 justify-center md:justify-start bg-white rounded-2xl shadow border border-green-100 p-3 md:p-4">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`px-4 py-2 rounded-full font-semibold transition-all text-sm md:text-base
                  ${selectedStatus === opt.value
                    ? "bg-green-700 text-white shadow-md"
                    : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"}
                `}
                onClick={() => setSelectedStatus(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black bg-opacity-40 px-2 py-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl"
              onClick={() => setShowOrderModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-4 text-green-800 border-b pb-2">Order Details</h3>
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

              {/* Cancel Button */}
              {selectedOrder.status !== 'cancelled' && (
                <button
                  className="mt-4 w-full px-4 py-2 rounded bg-red-100 text-red-700 font-semibold hover:bg-red-200"
                  onClick={() => handleCancelOrder(selectedOrder._id)}
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Tab Content */}
      <div className="max-w-4xl mx-auto space-y-8">
        {activeTab === 'summary' && (
          <div className="text-center text-slate-500 text-lg">Select a category above to view all orders in that category.</div>
        )}
        {activeTab === 'regular' && (
          <div className="bg-white rounded-xl shadow-md border border-green-100 p-6">
            <h2 className="text-2xl font-bold text-green-800 mb-4">All Regular Orders</h2>
            {ordersLoading ? (
              <p className="text-slate-600">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-slate-600">No orders yet.</p>
            ) : (
              <>
                <div className="space-y-3">
                  {orders
                    .filter(o => selectedStatus === 'all' ? true : o.status === selectedStatus)
                    .map((o) => (
                      <div key={o._id} className={`border rounded-lg p-4 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3 sm:gap-2 ${o.status === 'cancelled' ? 'border-red-100 bg-red-50' : 'border-green-50'}`}> 
                        <div className="min-w-0 flex-1 w-full sm:w-auto">
                          <p className="font-semibold text-gray-900 truncate">{o.orderNumber || o._id}</p>
                          <p className="text-sm text-slate-600">{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 min-w-0 w-full sm:w-auto justify-between sm:justify-end">
                          <p className={o.status === 'cancelled' ? "text-red-700 font-bold" : "text-green-700 font-bold"}>₹{(o.totalPrice || o.total || 0).toFixed(2)}</p>
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold capitalize ${
                            o.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            o.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            o.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                            o.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            o.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>{o.status}</span>
                          <div className="flex flex-row flex-wrap gap-2 w-full sm:w-auto justify-end">
                            <button
                              className="px-3 py-1 rounded bg-green-100 text-green-800 text-xs font-semibold hover:bg-green-200 whitespace-nowrap"
                              onClick={() => { setSelectedOrder(o); setShowOrderModal(true); }}
                            >
                              Details
                            </button>
                            {o.status !== 'cancelled' && (
                              <button
                                className="px-3 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 whitespace-nowrap"
                                onClick={() => handleCancelOrder(o._id)}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                {orders.filter(o => selectedStatus === 'all' ? true : o.status === selectedStatus).length === 0 && (
                  <div className="text-slate-600 py-4 text-center">No orders for selected status.</div>
                )}
              </>
            )}
          </div>
        )}
        {activeTab === 'bulk' && (
          <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">All Bulk Orders</h2>
            {bulkOrdersLoading ? (
              <p className="text-slate-600">Loading bulk orders...</p>
            ) : bulkOrders.length === 0 ? (
              <p className="text-slate-600">No bulk orders yet.</p>
            ) : (
              <div className="space-y-3">
                {bulkOrders
                  .filter(b => selectedStatus === 'all' ? true : b.status === selectedStatus)
                  .map((b) => (
                    <div key={b._id} className={`border rounded-lg p-4 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3 sm:gap-2 ${b.status === 'cancelled' ? 'border-red-100 bg-red-50' : 'border-blue-50'}`}> 
                      <div className="min-w-0 flex-1 w-full sm:w-auto">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-gray-900 truncate">
                            Order ID: <span className="text-blue-700">{b.orderId || b._id}</span>
                          </span>
                          <span className="text-sm text-slate-600">Makhana Type: <span className="font-medium text-gray-800">{b.makhanaType || '-'}</span></span>
                          <span className="text-sm text-slate-600">Date: <span className="text-gray-800">{new Date(b.createdAt).toLocaleDateString('en-IN')}</span></span>
                        </div>
                      </div>
                      <div className="flex flex-row flex-wrap sm:flex-col items-center sm:items-end gap-2 min-w-0 w-full sm:w-auto justify-between sm:justify-end">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold capitalize ${
                          b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          b.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          b.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                          b.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>{b.status}</span>
                        <div className="flex flex-row flex-wrap gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                          <button
                            className="px-3 py-1 rounded bg-blue-100 text-blue-800 text-xs font-semibold hover:bg-blue-200 whitespace-nowrap"
                            onClick={() => { setSelectedBulkOrder(b); setShowBulkOrderModal(true); }}
                          >
                            Details
                          </button>
                          {b.status !== 'cancelled' && (
                            <button
                              className="px-3 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 whitespace-nowrap"
                              onClick={() => handleCancelBulkOrder(b._id)}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'sample' && (
          <div className="bg-white rounded-xl shadow-md border border-yellow-100 p-6">
            <h2 className="text-2xl font-bold text-yellow-800 mb-4">All Free Sample Requests</h2>
            {freeSamplesLoading ? (
              <p className="text-slate-600">Loading free sample requests...</p>
            ) : freeSamples.length === 0 ? (
              <p className="text-slate-600">No free sample requests yet.</p>
            ) : (
              <div className="space-y-3">
                {freeSamples
                  .filter(s => selectedStatus === 'all' ? true : s.status === selectedStatus)
                  .map((s) => (
                    <div key={s._id} className={`border rounded-lg p-4 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3 sm:gap-2 ${s.status === 'cancelled' ? 'border-red-100 bg-red-50' : 'border-yellow-50'}`}> 
                      <div className="min-w-0 flex-1 w-full sm:w-auto">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-gray-900 truncate">
                            Order ID: <span className="text-yellow-700">{s.orderId || s._id}</span>
                          </span>
                          <span className="text-sm text-slate-600">Makhana Type: <span className="font-medium text-gray-800">{s.makhanaType || '-'}</span></span>
                          <span className="text-sm text-slate-600">Date: <span className="text-gray-800">{new Date(s.createdAt).toLocaleDateString('en-IN')}</span></span>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 min-w-0 w-full sm:w-auto justify-between sm:justify-end">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold capitalize ${
                          s.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          s.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          s.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                          s.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          s.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>{s.status}</span>
                        <div className="flex flex-row flex-wrap gap-2 w-full sm:w-auto justify-end">
                          <button
                            className="px-3 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold hover:bg-yellow-200 whitespace-nowrap"
                            onClick={() => { setSelectedSample(s); setShowSampleModal(true); }}
                          >
                            Details
                          </button>
                          {s.status !== 'cancelled' && (
                            <button
                              className="px-3 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 whitespace-nowrap"
                              onClick={() => handleCancelFreeSample(s._id)}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bulk Order Modal */}
      {showBulkOrderModal && selectedBulkOrder && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black bg-opacity-40 px-2 py-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl"
              onClick={() => setShowBulkOrderModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-2 text-blue-800">Bulk Order Details</h3>
            <div className="mb-2 text-xs text-slate-500 font-mono">
              Order ID: <span className="break-all">{selectedBulkOrder.orderId || `BULK-${selectedBulkOrder._id?.slice(-6)?.toUpperCase()}`}</span>
            </div>
            <div className="space-y-2 text-sm max-h-[60vh] overflow-y-auto pr-2">
              {Object.entries(selectedBulkOrder).map(([key, value]) => {
                if (["_id", "__v"].includes(key)) return null;
                if (key === "createdAt" || key === "updatedAt") {
                  return (
                    <div key={key}><span className="font-semibold">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span> {new Date(value).toLocaleString('en-IN')}</div>
                  );
                }
                if (typeof value === "object" && value !== null) {
                  if (Array.isArray(value)) {
                    return (
                      <div key={key}>
                        <span className="font-semibold">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                        <ul className="ml-4 list-disc">
                          {value.map((item, idx) => (
                            <li key={idx}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  } else {
                    return (
                      <div key={key}>
                        <span className="font-semibold">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                        <div className="ml-2">
                          {Object.entries(value).map(([k, v]) => (
                            <div key={k}><span className="capitalize">{k}:</span> {typeof v === 'object' ? JSON.stringify(v) : String(v)}</div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                }
                return (
                  <div key={key}><span className="font-semibold">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span> {String(value)}</div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Free Sample Modal */}
      {showSampleModal && selectedSample && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black bg-opacity-40 px-2 py-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl"
              onClick={() => setShowSampleModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-2 text-yellow-800">Free Sample Request Details</h3>
            <div className="mb-2 text-xs text-slate-500 font-mono">
              Order ID: <span className="break-all">{selectedSample.orderId || `FS-${selectedSample._id?.slice(-6)?.toUpperCase()}`}</span>
            </div>
            <div className="space-y-2 text-sm max-h-[60vh] overflow-y-auto pr-2">
              {Object.entries(selectedSample).map(([key, value]) => {
                if (["_id", "__v"].includes(key)) return null;
                if (key === "createdAt" || key === "updatedAt") {
                  return (
                    <div key={key}><span className="font-semibold">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span> {new Date(value).toLocaleString('en-IN')}</div>
                  );
                }
                if (typeof value === "object" && value !== null) {
                  if (Array.isArray(value)) {
                    return (
                      <div key={key}>
                        <span className="font-semibold">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                        <ul className="ml-4 list-disc">
                          {value.map((item, idx) => (
                            <li key={idx}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  } else {
                    return (
                      <div key={key}>
                        <span className="font-semibold">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                        <div className="ml-2">
                          {Object.entries(value).map(([k, v]) => (
                            <div key={k}><span className="capitalize">{k}:</span> {typeof v === 'object' ? JSON.stringify(v) : String(v)}</div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                }
                return (
                  <div key={key}><span className="font-semibold">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span> {String(value)}</div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
