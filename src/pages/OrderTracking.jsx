import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from '../utils/api.js';
import { useNavigate } from 'react-router-dom';
import { Package, Download, Eye, RefreshCcw, Clock, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function OrderTracking() {
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [bulkOrders, setBulkOrders] = useState([]);
  const [freeSamples, setFreeSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all'); // New filter
  const [updatingId, setUpdatingId] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const hasToken = !!localStorage.getItem('token');
  const isLoggedIn = !!user || hasToken;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    const token = localStorage.getItem('token');
    // Ensure axios has the auth header even if context hasn't set it yet
    if (token && !axios.defaults.headers.common['Authorization']) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    try {
      // Fetch all three types of orders
      const [regularRes, bulkRes, sampleRes] = await Promise.all([
        axios.get('/api/orders/my', { headers }).catch(() => ({ data: [] })),
        axios.get('/api/bulk-orders/my', { headers }).catch(() => ({ data: [] })),
        axios.get('/api/free-samples/my', { headers }).catch(() => ({ data: [] }))
      ]);

      // Process regular orders
      const possibleLists = [
        regularRes.data,
        regularRes.data?.orders,
        regularRes.data?.data,
        regularRes.data?.results,
      ].filter(Array.isArray);
      const regularList = possibleLists[0] || [];
      
      // Process bulk orders
      const bulkList = Array.isArray(bulkRes.data) ? bulkRes.data : 
                      Array.isArray(bulkRes.data?.bulkOrders) ? bulkRes.data.bulkOrders :
                      Array.isArray(bulkRes.data?.data) ? bulkRes.data.data : [];
      
      // Process free samples
      const sampleList = Array.isArray(sampleRes.data) ? sampleRes.data :
                        Array.isArray(sampleRes.data?.samples) ? sampleRes.data.samples :
                        Array.isArray(sampleRes.data?.data) ? sampleRes.data.data : [];

      setOrders(regularList);
      setBulkOrders(bulkList);
      setFreeSamples(sampleList);
      setLastFetched(new Date());
    } catch (error) {
      const status = error.response?.status;
      const serverMsg = error.response?.data?.error || error.response?.data?.message;
      const msg = serverMsg || 'Failed to load orders';
      setFetchError(status ? `${status}: ${msg}` : msg);
      console.error('Orders fetch failed:', {
        status,
        data: error.response?.data,
        headers: error.config?.headers,
        url: error.config?.url
      });
      toast.error(msg);
      if (status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    if (authLoading) return;
    if (isLoggedIn) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, authLoading, fetchOrders]);

  // Refetch when tab regains focus to reflect newly placed orders
  useEffect(() => {
    const onFocus = () => {
      if (isLoggedIn && !loading) {
        fetchOrders();
      }
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [isLoggedIn, loading, fetchOrders]);

  const handleCancel = async (orderId) => {
    if (!orderId) return;
    const reason = 'User requested cancellation';
    setUpdatingId(orderId);
    try {
      await axios.put(`/api/orders/${orderId}/cancel`, { reason });
      // Update local state immediately
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: 'Cancelled', cancelReason: reason } : o)));
      toast.success('Order cancelled successfully');
      // Trigger admin panel real-time update via broadcast event
      window.dispatchEvent(new CustomEvent('orderCancelled', { detail: { orderId, status: 'Cancelled' } }));
    } catch (error) {
      const msg = error.response?.data?.error || 'Unable to cancel order';
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-700',
      'Processing': 'bg-blue-100 text-blue-700',
      'Shipped': 'bg-purple-100 text-purple-700',
      'Delivered': 'bg-green-100 text-green-700',
      'Cancelled': 'bg-red-100 text-red-700',
      'Returned': 'bg-orange-100 text-orange-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  // Combine all orders with type label
  const allOrders = useMemo(() => {
    const regular = orders.map(o => ({ ...o, orderType: 'Regular Order' }));
    const bulk = bulkOrders.map(o => ({ ...o, orderType: 'Bulk Order' }));
    const samples = freeSamples.map(o => ({ ...o, orderType: 'Free Sample' }));
    return [...regular, ...bulk, ...samples].sort((a, b) => 
      new Date(b.createdAt || b.requestDate || 0) - new Date(a.createdAt || a.requestDate || 0)
    );
  }, [orders, bulkOrders, freeSamples]);

  const filteredOrders = useMemo(() => {
    let filtered = allOrders;
    
    // Filter by order type
    if (orderTypeFilter !== 'all') {
      filtered = filtered.filter(o => o.orderType === orderTypeFilter);
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((o) => (o.status || '').toLowerCase() === statusFilter.toLowerCase());
    }
    
    return filtered;
  }, [allOrders, statusFilter, orderTypeFilter]);

  const summary = useMemo(() => {
    const total = allOrders.length;
    const delivered = allOrders.filter((o) => o.status === 'Delivered').length;
    const processing = allOrders.filter((o) => ['Pending', 'Processing'].includes(o.status)).length;
    const cancelled = allOrders.filter((o) => o.status === 'Cancelled').length;
    const totalSpend = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const regularCount = orders.length;
    const bulkCount = bulkOrders.length;
    const sampleCount = freeSamples.length;
    return { total, delivered, processing, cancelled, totalSpend, regularCount, bulkCount, sampleCount };
  }, [allOrders, orders, bulkOrders, freeSamples]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-emerald-50 via-green-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-green-50 to-white py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-green-800">Orders</h1>
            <p className="text-slate-600">Track, review, and manage all your purchases in one place.</p>
          </div>
          {isLoggedIn && (
            <div className="flex items-center gap-3">
              <button
                onClick={fetchOrders}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-green-200 text-green-700 rounded-lg hover:bg-green-50 disabled:opacity-60"
              >
                <RefreshCcw size={16} /> Refresh
              </button>
              {lastFetched && (
                <span className="text-sm text-gray-500">Updated {lastFetched.toLocaleTimeString('en-IN')}</span>
              )}
            </div>
          )}
        </div>

        {isLoggedIn && (
          <>
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div className="bg-white rounded-xl border border-green-100 p-4 shadow-sm">
                <div className="text-sm text-gray-500">Total Orders</div>
                <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
              </div>
              <div className="bg-white rounded-xl border border-green-100 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-500"><Clock size={14} /> In Progress</div>
                <div className="text-2xl font-bold text-blue-700">{summary.processing}</div>
              </div>
              <div className="bg-white rounded-xl border border-green-100 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle2 size={14} /> Delivered</div>
                <div className="text-2xl font-bold text-green-700">{summary.delivered}</div>
              </div>
              <div className="bg-white rounded-xl border border-green-100 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-500"><XCircle size={14} /> Cancelled</div>
                <div className="text-2xl font-bold text-red-700">{summary.cancelled}</div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 shadow-sm">
                <div className="text-sm text-blue-700 font-medium">Regular Orders</div>
                <div className="text-2xl font-bold text-blue-900">{summary.regularCount}</div>
              </div>
              <div className="bg-purple-50 rounded-xl border border-purple-200 p-4 shadow-sm">
                <div className="text-sm text-purple-700 font-medium">Bulk Orders</div>
                <div className="text-2xl font-bold text-purple-900">{summary.bulkCount}</div>
              </div>
              <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 shadow-sm">
                <div className="text-sm text-emerald-700 font-medium">Free Samples</div>
                <div className="text-2xl font-bold text-emerald-900">{summary.sampleCount}</div>
              </div>
            </div>
          </>
        )}

        <p className="text-slate-600 mb-6">Review your orders and see the latest status updates. This page only shows orders tied to your logged-in account.</p>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-green-800">My Orders {isLoggedIn ? '' : '(login to view)'}</h2>
        </div>

        {isLoggedIn && (
          <div className="bg-white rounded-lg shadow-sm border border-green-100 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Order Type</label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'Regular Order', 'Bulk Order', 'Free Sample'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setOrderTypeFilter(type)}
                      className={`px-3 py-1 rounded-full text-sm border ${orderTypeFilter === type ? 'bg-green-700 text-white border-green-700' : 'bg-white text-green-700 border-green-200 hover:bg-green-50'}`}
                    >
                      {type === 'all' ? 'All Types' : type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  {['all','Pending','Processing','Shipped','Delivered','Cancelled','Returned'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1 rounded-full text-sm border ${statusFilter === status ? 'bg-green-700 text-white border-green-700' : 'bg-white text-green-700 border-green-200 hover:bg-green-50'}`}
                    >
                      {status === 'all' ? 'All Statuses' : status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {fetchError && (
          <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
            {fetchError}
          </div>
        )}

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto" />
            <p className="text-slate-600 mt-3">Loading your orders...</p>
          </div>
        ) : (!isLoggedIn || allOrders.length === 0) ? (
          <div className="text-center py-12">
            <Package size={64} className="mx-auto text-green-200 mb-4" />
            <p className="text-slate-600 mb-6">{isLoggedIn ? 'No orders yet' : 'Login to view your order history'}</p>
            <a href="/products" className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800">
              Start Shopping
            </a>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package size={64} className="mx-auto text-green-200 mb-4" />
            <p className="text-slate-600 mb-6">No orders match your filters</p>
            <button 
              onClick={() => {
                setStatusFilter('all');
                setOrderTypeFilter('all');
              }}
              className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition border border-green-50">
                <div className="p-6 border-b">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">
                          {order.orderNumber || order.orderId || `ORD-${order._id.slice(-6).toUpperCase()}`}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          order.orderType === 'Regular Order' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          order.orderType === 'Bulk Order' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                          'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}>
                          {order.orderType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.createdAt || order.requestDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6 border-b">
                  {order.orderType === 'Bulk Order' ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Bulk Order - {order.makhanaType || 'Makhana'}</p>
                          <p className="text-sm text-gray-600">Post-sample Qty: {order.postSampleQty || '—'}</p>
                          <p className="text-sm text-gray-600">Monthly Volume: {order.monthlyVolume || '—'}</p>
                          <p className="text-sm text-gray-600">Packaging: {order.packaging || '—'}</p>
                          {order.company && <p className="text-sm text-gray-600">Company: {order.company}</p>}
                        </div>
                        {typeof order.quotedPrice === 'number' && (
                          <span className="font-semibold text-green-700">Quoted: ₹{Number(order.quotedPrice).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  ) : order.orderType === 'Free Sample' ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Free Sample Request</p>
                          <p className="text-sm text-gray-600">Name: {order.name || '—'}</p>
                          <p className="text-sm text-gray-600">Phone: {order.phone || '—'}</p>
                          {order.address && <p className="text-sm text-gray-600">Address: {order.address}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 line-through">₹199</p>
                          <p className="font-semibold text-emerald-700">Free</p>
                          {typeof order.chargedAmount === 'number' && order.chargedAmount > 0 && (
                            <p className="text-xs text-gray-600">Charged: ₹{Number(order.chargedAmount).toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <span className="font-semibold">₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="p-6 bg-green-50">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex gap-6">
                      {order.orderType === 'Regular Order' && (
                        <>
                          <div>
                            <p className="text-gray-600">Total Amount</p>
                            <p className="text-2xl font-bold text-green-700">₹{(order.totalPrice || 0).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Payment</p>
                            <p className="font-semibold text-gray-900">{order.paymentMethod || '—'} · {order.paymentStatus || 'Pending'}</p>
                          </div>
                        </>
                      )}
                      {order.orderType === 'Bulk Order' && (
                        <div>
                          <p className="text-gray-600">Order Details</p>
                          <p className="font-semibold text-gray-900">Post-sample Qty: {order.postSampleQty || '—'}</p>
                        </div>
                      )}
                      {order.orderType === 'Free Sample' && (
                        <div>
                          <p className="text-gray-600">Sample Request</p>
                          <p className="font-semibold text-gray-900"><span className="line-through text-gray-500">₹199</span> <span className="text-emerald-700">Free</span></p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 flex items-center gap-2"
                      >
                        <Eye size={18} />
                        Details
                      </button>
                      {order.orderType === 'Regular Order' && (
                        <button className="px-4 py-2 bg-white text-green-700 border border-green-200 rounded-lg hover:bg-green-50 flex items-center gap-2">
                          <Download size={18} />
                          Invoice
                        </button>
                      )}
                      {order.orderType === 'Regular Order' && ['Pending','Processing','Shipped'].includes(order.status) && (
                        <button
                          onClick={() => handleCancel(order._id)}
                          disabled={updatingId === order._id}
                          className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-60"
                        >
                          {updatingId === order._id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredOrders.length === 0 && (
              <div className="text-center py-10 text-gray-600">No orders in this status.</div>
            )}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Order Number</p>
                  <p className="font-semibold">
                    {selectedOrder.orderNumber || selectedOrder.orderId || `ORD-${selectedOrder._id.slice(-6).toUpperCase()}`}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Order Date</p>
                  <p className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Payment Method</p>
                  <p className="font-semibold">{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Payment Status</p>
                  <p className="font-semibold">{selectedOrder.paymentStatus}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Shipping Address</h3>
                <div className="text-sm text-gray-700">
                  <p>{selectedOrder.shippingAddress?.name}</p>
                  <p>{selectedOrder.shippingAddress?.street}</p>
                  <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}</p>
                  <p>{selectedOrder.shippingAddress?.phone}</p>
                </div>
              </div>

              {selectedOrder.trackingNumber && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Tracking Number</h3>
                  <p className="font-mono">{selectedOrder.trackingNumber}</p>
                </div>
              )}

              {selectedOrder.statusHistory && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Status History</h3>
                  <div className="space-y-2">
                    {(selectedOrder.statusHistory || []).slice().reverse().map((history, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="text-sm text-gray-600 w-32">
                          {new Date(history.timestamp).toLocaleString('en-IN')}
                        </div>
                        <div>
                          <p className="font-semibold">{history.status}</p>
                          {history.note && <p className="text-sm text-gray-600">{history.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
