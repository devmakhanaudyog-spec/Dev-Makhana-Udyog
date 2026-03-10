import React, { useState, useCallback, useEffect } from 'react';
import { Eye, Trash2, Edit2, X, RefreshCw } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function OrdersTab({ orders, loadData }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [q, setQ] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localOrders, setLocalOrders] = useState(orders);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);

  // Sync local state with prop
  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  // Auto-refresh orders every 15 seconds (disabled by default to prevent crashes)
  useEffect(() => {
    if (!autoRefreshEnabled) return;
    
    const pollInterval = setInterval(() => {
      loadData();
    }, 15000); // 15 seconds

    return () => clearInterval(pollInterval);
  }, [autoRefreshEnabled, loadData]);

  // Listen for real-time cancellation events from customer side
  useEffect(() => {
    const handleOrderCancelled = (event) => {
      const { orderId, status } = event.detail;
      setLocalOrders((prev) => 
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
      toast.success('Order cancelled by customer');
    };

    window.addEventListener('orderCancelled', handleOrderCancelled);
    return () => window.removeEventListener('orderCancelled', handleOrderCancelled);
  }, []);

  const handleStatusUpdate = useCallback(async (orderId, newStatus) => {
    if (!newStatus) return;
    setIsLoading(true);
    try {
      await axios.put(`/api/admin/orders/${orderId}`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      loadData();
      setEditingOrder(null);
    } catch (error) {
      console.error('Status update error:', error);
      toast.error(error.response?.data?.error || 'Failed to update order status');
    } finally {
      setIsLoading(false);
    }
  }, [loadData]);

  const handleDeleteOrder = useCallback(async (orderId) => {
    if (!window.confirm('Delete this order permanently? This action cannot be undone.')) return;
    setIsLoading(true);
    try {
      await axios.delete(`/api/admin/orders/${orderId}`);
      toast.success('Order deleted successfully');
      loadData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.error || 'Failed to delete order');
    } finally {
      setIsLoading(false);
    }
  }, [loadData]);

  const baseList = statusFilter === 'all' ? localOrders : localOrders.filter(o => o.status === statusFilter);
  const ql = q.trim().toLowerCase();
  const filteredOrders = !ql ? baseList : baseList.filter((o) => {
    const customer = o.userId?.name || o.user?.name || '';
    const orderNum = o.orderNumber || o._id;
    const fields = [customer, orderNum].filter(Boolean).join(' ').toLowerCase();
    return fields.includes(ql);
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Orders Management</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => loadData()}
            title="Refresh orders"
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <RefreshCw size={20} className={autoRefreshEnabled ? 'text-green-600' : 'text-slate-400'} />
          </button>
          <label className="flex items-center gap-2 text-sm text-slate-600 px-3 py-2 border border-slate-300 rounded-lg">
            <input
              type="checkbox"
              checked={autoRefreshEnabled}
              onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
              className="rounded"
            />
            Auto-refresh
          </label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search orders..."
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Order ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Date</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders && filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                    <td className="px-6 py-3 text-sm font-semibold text-slate-900">
                      {order.orderNumber || `ORD-${order._id.slice(-6).toUpperCase()}`}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-600">
                      {order.userId?.name || order.user?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-3 text-sm font-semibold text-green-600">
                      ₹{order.totalPrice?.toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      <select
                        value={order.status || 'pending'}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        disabled={isLoading}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-slate-100 text-slate-800'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="returned">Returned</option>
                      </select>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition text-blue-600"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => setEditingOrder(order)}
                          className="p-2 hover:bg-amber-100 rounded-lg transition text-amber-600"
                          title="Edit Order"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          disabled={isLoading}
                          className="p-2 hover:bg-red-100 rounded-lg transition text-red-600 disabled:opacity-50"
                          title="Delete Order"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Order Details - {selectedOrder.orderNumber || (selectedOrder._id ? `ORD-${String(selectedOrder._id).slice(-6).toUpperCase()}` : '—')}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-500 hover:text-slate-700">
                <X size={24} />
              </button>
            </div>
            {selectedOrder && selectedOrder._id ? (
              <div className="space-y-6">
                {/* Customer Information */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Customer Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Name</p>
                      <p className="font-semibold text-slate-900">{selectedOrder.userId?.name || selectedOrder.user?.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Email</p>
                      <p className="font-semibold text-slate-900">{selectedOrder.userId?.email || selectedOrder.user?.email || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Phone</p>
                      <p className="font-semibold text-slate-900">{selectedOrder.userId?.phone || selectedOrder.user?.phone || selectedOrder.phone || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Product/Items Information */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Order Items</h3>
                  <div className="text-sm text-slate-900">
                    {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                      <table className="w-full mb-2">
                        <thead>
                          <tr>
                            <th className="text-left">Product</th>
                            <th className="text-left">Qty</th>
                            <th className="text-left">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.items.map((item, idx) => (
                            <tr key={idx}>
                              <td>{item.name || '—'}</td>
                              <td>{item.quantity || 1}</td>
                              <td>₹{item.price || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p>No items found</p>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Shipping Address</h3>
                  {typeof selectedOrder.shippingAddress === 'object' && selectedOrder.shippingAddress !== null ? (
                    <div className="text-sm text-slate-900 space-y-1">
                      {selectedOrder.shippingAddress.name && <div><span className="text-slate-600">Name: </span>{selectedOrder.shippingAddress.name}</div>}
                      {selectedOrder.shippingAddress.phone && <div><span className="text-slate-600">Phone: </span>{selectedOrder.shippingAddress.phone}</div>}
                      {selectedOrder.shippingAddress.line1 && <div><span className="text-slate-600">Address Line 1: </span>{selectedOrder.shippingAddress.line1}</div>}
                      {selectedOrder.shippingAddress.line2 && <div><span className="text-slate-600">Address Line 2: </span>{selectedOrder.shippingAddress.line2}</div>}
                      {selectedOrder.shippingAddress.city && <div><span className="text-slate-600">City: </span>{selectedOrder.shippingAddress.city}</div>}
                      {selectedOrder.shippingAddress.state && <div><span className="text-slate-600">State: </span>{selectedOrder.shippingAddress.state}</div>}
                      {selectedOrder.shippingAddress.pincode && <div><span className="text-slate-600">PIN Code: </span>{selectedOrder.shippingAddress.pincode}</div>}
                      {selectedOrder.shippingAddress.country && <div><span className="text-slate-600">Country: </span>{selectedOrder.shippingAddress.country}</div>}
                      {selectedOrder.shippingAddress.notes && <div><span className="text-slate-600">Notes: </span>{selectedOrder.shippingAddress.notes}</div>}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-900">{selectedOrder.shippingAddress || '—'}</p>
                  )}
                  {selectedOrder.phone && (
                    <div className="text-sm text-slate-900 mt-2"><span className="text-slate-600">Phone: </span>{selectedOrder.phone}</div>
                  )}
                  {selectedOrder.notes && (
                    <div className="text-sm text-slate-900 mt-2"><span className="text-slate-600">Order Notes: </span>{selectedOrder.notes}</div>
                  )}
                </div>

                {/* Status & Payment */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Status & Payment</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Status</p>
                      <p className="font-semibold text-slate-900 capitalize">{selectedOrder.status || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Total Amount</p>
                      <p className="font-semibold text-green-600">₹{typeof selectedOrder.totalPrice === 'number' ? selectedOrder.totalPrice.toLocaleString() : '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Order Date</p>
                      <p className="font-semibold text-slate-900">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString('en-IN') : '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Tracking & Notes */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Tracking & Notes</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Tracking ID</p>
                      <p className="text-sm text-slate-900">{selectedOrder.trackingId || 'Not provided yet'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Admin Notes</p>
                      <p className="text-sm text-slate-900">{selectedOrder.adminNotes || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-red-600 font-semibold py-8">Order data is missing or incomplete.</div>
            )}
            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition mt-6"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Edit Order</h2>
              <button onClick={() => setEditingOrder(null)} className="text-slate-500 hover:text-slate-700">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Order Status</label>
                <select
                  value={editingOrder.status || 'pending'}
                  onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="returned">Returned</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tracking ID (Optional)</label>
                <input
                  type="text"
                  value={editingOrder.trackingId || ''}
                  onChange={(e) => setEditingOrder({ ...editingOrder, trackingId: e.target.value })}
                  placeholder="e.g., TRK123456789"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  onClick={() => setEditingOrder(null)}
                  className="py-2 px-4 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStatusUpdate(editingOrder._id, editingOrder.status)}
                  disabled={isLoading}
                  className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
