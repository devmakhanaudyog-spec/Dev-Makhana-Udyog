import React, { useState, useCallback, useEffect } from 'react';
import { Eye, Trash2, Edit2, X, RefreshCw } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function FreeSamplesTab({ freeSamples, loadData }) {
  const [selectedSample, setSelectedSample] = useState(null);
  const [editingSample, setEditingSample] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [localSamples, setLocalSamples] = useState(freeSamples);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);

  // Sync local state with prop
  useEffect(() => {
    setLocalSamples(freeSamples);
  }, [freeSamples]);

  // Auto-refresh samples every 15 seconds (disabled by default)
  useEffect(() => {
    if (!autoRefreshEnabled) return;
    
    const pollInterval = setInterval(() => {
      loadData();
    }, 15000); // 15 seconds

    return () => clearInterval(pollInterval);
  }, [autoRefreshEnabled, loadData]);

  const handleStatusUpdate = useCallback(async (sampleId, newStatus) => {
    if (!newStatus) return;
    setIsLoading(true);
    try {
      await axios.put(`/api/admin/free-samples/${sampleId}`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      loadData();
      setEditingSample(null);
    } catch (error) {
      console.error('Status update error:', error);
      toast.error(error.response?.data?.error || 'Failed to update status');
    } finally {
      setIsLoading(false);
    }
  }, [loadData]);

  const handleNotesUpdate = useCallback(async (sampleId, adminNotes, chargedAmount) => {
    setIsLoading(true);
    try {
      const payload = { adminNotes };
      if (typeof chargedAmount === 'number') payload.chargedAmount = chargedAmount;
      await axios.put(`/api/admin/free-samples/${sampleId}`, payload);
      toast.success('Notes updated');
      loadData();
      setEditingSample(null);
    } catch (error) {
      console.error('Notes update error:', error);
      toast.error('Failed to update notes');
    } finally {
      setIsLoading(false);
    }
  }, [loadData]);

  const handleDeleteSample = useCallback(async (sampleId) => {
    if (!window.confirm('Delete this free sample request permanently?')) return;
    setIsLoading(true);
    try {
      await axios.delete(`/api/admin/free-samples/${sampleId}`);
      toast.success('Sample request deleted');
      loadData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete sample request');
    } finally {
      setIsLoading(false);
    }
  }, [loadData]);

  const baseList = statusFilter === 'all' ? localSamples : localSamples.filter(s => s.status === statusFilter);
  const ql = q.trim().toLowerCase();
  const filteredSamples = !ql ? baseList : baseList.filter((s) => {
    const fields = [s.orderId, s.name, s.email, s.phone, s.makhanaType].filter(Boolean).join(' ').toLowerCase();
    return fields.includes(ql);
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Free Sample Requests</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => loadData()}
            title="Refresh samples"
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
            placeholder="Search samples..."
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
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Order ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Product Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Date</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSamples && filteredSamples.length > 0 ? (
                filteredSamples.map((sample) => (
                  <tr key={sample._id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                    <td className="px-6 py-3 text-sm font-semibold text-slate-900">{sample.orderId || `FS-${sample._id.slice(-6).toUpperCase()}`}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-slate-900">{sample.name}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{sample.email}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{sample.makhanaType}</td>
                    <td className="px-6 py-3">
                      <select
                        value={sample.status || 'Pending'}
                        onChange={(e) => handleStatusUpdate(sample._id, e.target.value)}
                        disabled={isLoading}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${
                          sample.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          sample.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                          sample.status === 'Processing' ? 'bg-purple-100 text-purple-800' :
                          sample.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
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
                      {new Date(sample.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedSample(sample)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition text-blue-600"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => setEditingSample(sample)}
                          className="p-2 hover:bg-amber-100 rounded-lg transition text-amber-600"
                          title="Edit Request"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteSample(sample._id)}
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
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    No sample requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sample Details Modal */}
      {selectedSample && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Free Sample Request - {selectedSample.orderId || `FS-${selectedSample._id.slice(-6).toUpperCase()}`}</h2>
              <button onClick={() => setSelectedSample(null)} className="text-slate-500 hover:text-slate-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Name</p>
                    <p className="font-semibold text-slate-900">{selectedSample.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Email</p>
                    <p className="font-semibold text-slate-900">{selectedSample.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Phone</p>
                    <p className="font-semibold text-slate-900">{selectedSample.phone}</p>
                  </div>
                  <div className="col-span-2 md:col-span-3">
                    <p className="text-sm text-slate-600">Company</p>
                    <p className="font-semibold text-slate-900">{selectedSample.company || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Product Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Product Type</p>
                    <p className="font-semibold text-slate-900">{selectedSample.makhanaType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Requirement</p>
                    <p className="font-semibold text-slate-900">{selectedSample.requirement || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Sample Package</p>
                    <p className="font-semibold text-slate-900">
                      {selectedSample.samplePackage === '650' && '₹650 (1x premium pack)'}
                      {selectedSample.samplePackage === '1000' && '₹1000 (2x premium packs)'}
                      {!['650','1000'].includes(selectedSample.samplePackage) && (selectedSample.samplePackage || '—')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Payment Method</p>
                    <p className="font-semibold text-slate-900 capitalize">{selectedSample.paymentMethod || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Delivery Address</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="col-span-2 md:col-span-3">
                    <p className="text-sm text-slate-600">Address Line 1</p>
                    <p className="font-semibold text-slate-900">{selectedSample.addressLine1}</p>
                  </div>
                  <div className="col-span-2 md:col-span-3">
                    <p className="text-sm text-slate-600">Address Line 2</p>
                    <p className="font-semibold text-slate-900">{selectedSample.addressLine2 || '—'}</p>
                  </div>
                  <div className="col-span-2 md:col-span-3">
                    <p className="text-sm text-slate-600">Landmark</p>
                    <p className="font-semibold text-slate-900">{selectedSample.landmark || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">City</p>
                    <p className="font-semibold text-slate-900">{selectedSample.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">District</p>
                    <p className="font-semibold text-slate-900">{selectedSample.district}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">State</p>
                    <p className="font-semibold text-slate-900">{selectedSample.state}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Pincode</p>
                    <p className="font-semibold text-slate-900">{selectedSample.pincode}</p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Additional Information</h3>
                <div>
                  <p className="text-sm text-slate-600">Message</p>
                  <p className="font-semibold text-slate-900 whitespace-pre-wrap">{selectedSample.message || 'None'}</p>
                </div>
              </div>

              {/* Status and Notes */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Status & Notes</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Status</p>
                    <p className="font-semibold text-slate-900 capitalize">{selectedSample.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Created Date</p>
                    <p className="font-semibold text-slate-900">{new Date(selectedSample.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  {selectedSample.adminNotes && (
                    <div className="col-span-2">
                      <p className="text-sm text-slate-600">Admin Notes</p>
                      <p className="font-semibold text-slate-900 whitespace-pre-wrap">{selectedSample.adminNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedSample(null)}
              className="w-full py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition mt-6"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Sample Modal */}
      {editingSample && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Edit Sample Request</h2>
              <button onClick={() => setEditingSample(null)} className="text-slate-500 hover:text-slate-700">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <select
                  value={editingSample.status || 'pending'}
                  onChange={(e) => setEditingSample({ ...editingSample, status: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Admin Notes</label>
                <textarea
                  value={editingSample.adminNotes || ''}
                  onChange={(e) => setEditingSample({ ...editingSample, adminNotes: e.target.value })}
                  placeholder="Add internal notes, tracking number, etc..."
                  rows="4"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Charged Amount (₹)</label>
                <input
                  type="number"
                  value={typeof editingSample.chargedAmount === 'number' ? editingSample.chargedAmount : ''}
                  onChange={(e) => setEditingSample({ ...editingSample, chargedAmount: parseFloat(e.target.value) })}
                  placeholder="Enter amount charged (optional)"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-slate-500 mt-1">Set delivery/handling amount if applicable. Included in revenue.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  onClick={() => setEditingSample(null)}
                  className="py-2 px-4 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleNotesUpdate(editingSample._id, editingSample.adminNotes, editingSample.chargedAmount)}
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
