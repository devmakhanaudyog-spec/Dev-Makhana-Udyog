import React, { useState, useCallback, useEffect } from 'react';
import { Eye, Trash2, Edit2, X, RefreshCw } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
// Map stored values to readable kg format
const getPostSampleQtyLabel = (value) => {
  const qtyMap = {
    'retail-small': '1-10 Kgs',
    'retail-medium': '10-50 Kgs',
    'below-100': '50-100 Kgs',
    'above-100': '100-500 Kgs',
    'above-500': '500-1000 Kgs',
    'above-1000': '1000+ Kgs'
  };
  return qtyMap[value] || value;
};


export default function BulkOrdersTab({ bulkOrders, loadData }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [localBulkOrders, setLocalBulkOrders] = useState(bulkOrders);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);

  // Sync local state with prop
  useEffect(() => {
    setLocalBulkOrders(bulkOrders);
  }, [bulkOrders]);

  // Auto-refresh bulk orders every 15 seconds (disabled by default)
  useEffect(() => {
    if (!autoRefreshEnabled) return;
    
    const pollInterval = setInterval(() => {
      loadData();
    }, 15000); // 15 seconds

    return () => clearInterval(pollInterval);
  }, [autoRefreshEnabled, loadData]);

  const handleStatusUpdate = useCallback(async (orderId, newStatus) => {
    if (!newStatus) return;
    setIsLoading(true);
    try {
      await axios.put(`/api/admin/bulk-orders/${orderId}`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      loadData();
      setEditingOrder(null);
    } catch (error) {
      console.error('Status update error:', error);
      toast.error(error.response?.data?.error || 'Failed to update status');
    } finally {
      setIsLoading(false);
    }
  }, [loadData]);

  const handleQuoteUpdate = useCallback(async (orderId, quotedPrice, adminNotes) => {
    setIsLoading(true);
    try {
      await axios.put(`/api/admin/bulk-orders/${orderId}`, { quotedPrice, adminNotes });
      toast.success('Quote and notes updated');
      loadData();
      setEditingOrder(null);
    } catch (error) {
      console.error('Quote update error:', error);
      toast.error('Failed to update quote');
    } finally {
      setIsLoading(false);
    }
  }, [loadData]);

  const handleDeleteOrder = useCallback(async (orderId) => {
    if (!window.confirm('Delete this bulk order request permanently?')) return;
    setIsLoading(true);
    try {
      await axios.delete(`/api/admin/bulk-orders/${orderId}`);
      toast.success('Bulk order deleted');
      loadData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete bulk order');
    } finally {
      setIsLoading(false);
    }
  }, [loadData]);

  const baseList = statusFilter === 'all' ? localBulkOrders : localBulkOrders.filter(o => o.status === statusFilter);
  const ql = q.trim().toLowerCase();
  const filteredOrders = !ql ? baseList : baseList.filter((o) => {
    const fields = [
      o.orderId,
      o.company,
      o.fullName,
      o.email,
      o.phone,
      o.makhanaType,
      o.monthlyVolume
    ].filter(Boolean).join(' ').toLowerCase();
    return fields.includes(ql);
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Bulk Orders Management</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => loadData()}
            title="Refresh bulk orders"
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
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Order ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Company</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Contact</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Product Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Monthly Vol.</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Immediate Order</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Date</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders && filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                    <td className="px-6 py-3 text-sm font-semibold text-slate-900">{order.orderId || `BULK-${order._id.slice(-6).toUpperCase()}`}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-slate-900">{order.company || order.fullName}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{order.email}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{order.makhanaType}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{order.monthlyVolume || '—'}</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{getPostSampleQtyLabel(order.postSampleQty) || '—'}</td>
                    <td className="px-6 py-3">
                      <select
                        value={order.status || 'Pending'}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        disabled={isLoading}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'Processing' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
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
                          title="Edit & Send Quote"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          disabled={isLoading}
                          className="p-2 hover:bg-red-100 rounded-lg transition text-red-600 disabled:opacity-50"
                          title="Delete Request"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-500">
                    No bulk orders found
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
              <h2 className="text-2xl font-bold text-slate-900">Bulk Order Details - {selectedOrder.orderId || `BULK-${selectedOrder._id.slice(-6).toUpperCase()}`}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-500 hover:text-slate-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Company & Contact Information */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Company & Contact Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Company Name</p>
                    <p className="font-semibold text-slate-900">{selectedOrder.company || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Contact Person</p>
                    <p className="font-semibold text-slate-900">{selectedOrder.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Email</p>
                    <p className="font-semibold text-slate-900">{selectedOrder.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Phone</p>
                    <p className="font-semibold text-slate-900">{selectedOrder.phone}</p>
                  </div>
                </div>
              </div>

              {/* Product & Requirement Details */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Product & Order Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Product Type</p>
                    <p className="font-semibold text-slate-900">{selectedOrder.makhanaType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Monthly Volume</p>
                    <p className="font-semibold text-slate-900">{selectedOrder.monthlyVolume}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Packaging Type</p>
                    <p className="font-semibold text-slate-900">{selectedOrder.packaging}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Immediate Order Quantity</p>
                    <p className="font-semibold text-slate-900">{selectedOrder.postSampleQty || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Delivery Address</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="col-span-2 md:col-span-3">
                    <p className="text-sm text-slate-600">Address Line 1</p>
                    <p className="font-semibold text-slate-900">{selectedOrder.addressLine1}</p>
                  </div>
                  <div className="col-span-2 md:col-span-3">
                    <p className="text-sm text-slate-600">Address Line 2</p>
                    <p className="font-semibold text-slate-900">{selectedOrder.addressLine2 || '—'}</p>
                  </div>
                  <div className="col-span-2 md:col-span-3">
                    <p className="text-sm text-slate-600">Landmark</p>
                    <p className="font-semibold text-slate-900">{selectedOrder.landmark || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">City</p>
                    <p className="font-semibold text-slate-900">{selectedOrder.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">District</p>
                    <p className="font-semibold text-slate-900">{selectedOrder.district}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">State</p>
                    <p className="font-semibold text-slate-900">{selectedOrder.state}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Pincode</p>
                    <p className="font-semibold text-slate-900">{selectedOrder.pincode}</p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Additional Information</h3>
                <div>
                  <p className="text-sm text-slate-600">Special Notes/Requirements</p>
                  <p className="font-semibold text-slate-900 whitespace-pre-wrap">{selectedOrder.notes || 'None'}</p>
                </div>
              </div>

              {/* Status & Quote */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Status & Quote</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Status</p>
                    <p className="font-semibold text-slate-900 capitalize">{selectedOrder.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Quoted Price</p>
                    <p className="font-semibold text-green-600">₹{selectedOrder.quotedPrice || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Created Date</p>
                    <p className="font-semibold text-slate-900">{new Date(selectedOrder.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  {selectedOrder.adminNotes && (
                    <div className="col-span-3">
                      <p className="text-sm text-slate-600">Admin Notes</p>
                      <p className="font-semibold text-slate-900 whitespace-pre-wrap">{selectedOrder.adminNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

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
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Edit Bulk Order</h2>
              <button onClick={() => setEditingOrder(null)} className="text-slate-500 hover:text-slate-700">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <select
                  value={editingOrder.status || 'pending'}
                  onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="pending">Pending</option>
                  <option value="quoted">Quoted</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Quoted Price (₹)</label>
                <input
                  type="number"
                  value={editingOrder.quotedPrice || ''}
                  onChange={(e) => setEditingOrder({ ...editingOrder, quotedPrice: parseFloat(e.target.value) })}
                  placeholder="Enter quoted price"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Admin Notes</label>
                <textarea
                  value={editingOrder.adminNotes || ''}
                  onChange={(e) => setEditingOrder({ ...editingOrder, adminNotes: e.target.value })}
                  placeholder="Add internal notes..."
                  rows="3"
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
                  onClick={() => handleQuoteUpdate(editingOrder._id, editingOrder.quotedPrice, editingOrder.adminNotes)}
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
