import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import axios from '../../utils/api.js';
import toast from 'react-hot-toast';

export default function CouponsTab({ coupons, loadData, loadCouponsData }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderValue: 0,
    maxDiscount: '',
    expiresAt: '',
    usageLimit: 0,
    active: true
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.code.trim()) {
      toast.error('Coupon code is required');
      return;
    }
    if (!form.discountValue) {
      toast.error('Discount value is required');
      return;
    }
    if (!form.expiresAt) {
      toast.error('Expiry date is required');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        code: form.code.toUpperCase(),
        description: form.description,
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        minOrderValue: parseFloat(form.minOrderValue) || 0,
        expiresAt: new Date(form.expiresAt),
        usageLimit: parseInt(form.usageLimit) || 0,
        active: form.active
      };

      if (form.maxDiscount && form.discountType === 'percentage') {
        payload.maxDiscount = parseFloat(form.maxDiscount);
      }

      await axios.post('/api/coupons', payload);
      toast.success('Coupon created successfully');
      setForm({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderValue: 0,
        maxDiscount: '',
        expiresAt: '',
        usageLimit: 0,
        active: true
      });
      setShowAddForm(false);
      if (typeof loadCouponsData === 'function') await loadCouponsData();
      else await loadData();
    } catch (error) {
      console.error('Create coupon error:', error);
      toast.error(error.response?.data?.error || 'Failed to create coupon');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Delete this coupon permanently?')) return;
    
    setIsLoading(true);
    try {
      await axios.delete(`/api/coupons/${couponId}`);
      toast.success('Coupon deleted successfully');
      if (typeof loadCouponsData === 'function') await loadCouponsData();
      else await loadData();
    } catch (error) {
      console.error('Delete coupon error:', error);
      toast.error('Failed to delete coupon');
    } finally {
      setIsLoading(false);
    }
  };

  const openEdit = (coupon) => {
    setEditingCoupon(coupon);
    setEditForm({
      code: coupon.code || '',
      description: coupon.description || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue ?? '',
      minOrderValue: coupon.minOrderValue ?? 0,
      maxDiscount: coupon.maxDiscount ?? '',
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0,10) : '',
      usageLimit: coupon.usageLimit ?? 0,
      active: !!coupon.active
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleUpdateCoupon = async (e) => {
    e.preventDefault();
    if (!editingCoupon?._id) return;
    setIsLoading(true);
    try {
      const payload = {
        code: editForm.code.toUpperCase(),
        description: editForm.description,
        discountType: editForm.discountType,
        discountValue: parseFloat(editForm.discountValue),
        minOrderValue: parseFloat(editForm.minOrderValue) || 0,
        usageLimit: parseInt(editForm.usageLimit) || 0,
        active: !!editForm.active
      };
      if (editForm.expiresAt) payload.expiresAt = new Date(editForm.expiresAt);
      if (editForm.discountType === 'percentage' && editForm.maxDiscount) {
        payload.maxDiscount = parseFloat(editForm.maxDiscount);
      } else {
        payload.maxDiscount = undefined;
      }
      await axios.put(`/api/coupons/${editingCoupon._id}`, payload);
      toast.success('Coupon updated');
      setEditingCoupon(null);
      setEditForm(null);
      if (typeof loadCouponsData === 'function') await loadCouponsData();
      else await loadData();
    } catch (error) {
      console.error('Update coupon error:', error);
      toast.error(error.response?.data?.error || 'Failed to update coupon');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Coupons & Discounts</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          <Plus size={20} />
          Add Coupon
        </button>
      </div>

      {/* Add Coupon Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900">Create New Coupon</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Coupon Code */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Coupon Code *</label>
              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleInputChange}
                placeholder="e.g., WELCOME20"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Description</label>
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleInputChange}
                placeholder="e.g., Welcome 20% off"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Discount Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Discount Type *</label>
              <select
                name="discountType"
                value={form.discountType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>

            {/* Discount Value */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Discount Value * {form.discountType === 'percentage' ? '(%)' : '(₹)'}
              </label>
              <input
                type="number"
                name="discountValue"
                value={form.discountValue}
                onChange={handleInputChange}
                placeholder={form.discountType === 'percentage' ? '20' : '500'}
                min="0"
                step={form.discountType === 'percentage' ? '0.1' : '1'}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Min Order Value */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Minimum Order Value (₹)</label>
              <input
                type="number"
                name="minOrderValue"
                value={form.minOrderValue}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Max Discount (for percentage) */}
            {form.discountType === 'percentage' && (
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Max Discount Cap (₹)</label>
                <input
                  type="number"
                  name="maxDiscount"
                  value={form.maxDiscount}
                  onChange={handleInputChange}
                  placeholder="e.g., 5000"
                  min="0"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Expiry Date *</label>
              <input
                type="date"
                name="expiresAt"
                value={form.expiresAt}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Usage Limit */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Usage Limit (0 = Unlimited)</label>
              <input
                type="number"
                name="usageLimit"
                value={form.usageLimit}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleInputChange}
                className="w-4 h-4 rounded"
              />
              <label className="text-sm font-semibold text-slate-900">Active</label>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Coupon'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-6 py-3 text-left text-sm font-semibold">Code</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Discount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Min Order</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Valid Until</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Usage</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {coupons && coupons.length > 0 ? coupons.map((coupon) => (
                <tr key={coupon._id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-6 py-3 font-semibold font-mono text-green-600">{coupon.code}</td>
                  <td className="px-6 py-3">
                    {coupon.discountType === 'percentage' 
                      ? `${coupon.discountValue}%` 
                      : `₹${coupon.discountValue}`}
                    {coupon.discountType === 'percentage' && coupon.maxDiscount && 
                      ` (max ₹${coupon.maxDiscount})`}
                  </td>
                  <td className="px-6 py-3">₹{coupon.minOrderValue || '0'}</td>
                  <td className="px-6 py-3">
                    {coupon.expiresAt 
                      ? new Date(coupon.expiresAt).toLocaleDateString() 
                      : 'No limit'}
                  </td>
                  <td className="px-6 py-3">
                    {coupon.usageLimit > 0 
                      ? `${coupon.usedCount || 0}/${coupon.usageLimit}` 
                      : `${coupon.usedCount || 0} (unlimited)`}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      coupon.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {coupon.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => openEdit(coupon)}
                      disabled={isLoading}
                      className="p-2 hover:bg-amber-100 rounded-lg transition text-amber-600 mr-2"
                      title="Edit Coupon"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCoupon(coupon._id)}
                      disabled={isLoading}
                      className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                      title="Delete Coupon"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">No coupons yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingCoupon && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Edit Coupon</h2>
              <button
                onClick={() => { setEditingCoupon(null); setEditForm(null); }}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateCoupon} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Coupon Code *</label>
                <input
                  type="text"
                  name="code"
                  value={editForm.code}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Description</label>
                <input
                  type="text"
                  name="description"
                  value={editForm.description}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Discount Type *</label>
                <select
                  name="discountType"
                  value={editForm.discountType}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Discount Value *</label>
                <input
                  type="number"
                  name="discountValue"
                  value={editForm.discountValue}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Minimum Order Value (₹)</label>
                <input
                  type="number"
                  name="minOrderValue"
                  value={editForm.minOrderValue}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              {editForm.discountType === 'percentage' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    name="maxDiscount"
                    value={editForm.maxDiscount}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Expiry Date *</label>
                <input
                  type="date"
                  name="expiresAt"
                  value={editForm.expiresAt}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Usage Limit (0 = Unlimited)</label>
                <input
                  type="number"
                  name="usageLimit"
                  value={editForm.usageLimit}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="active"
                  checked={!!editForm.active}
                  onChange={handleEditInputChange}
                  className="w-4 h-4 rounded"
                />
                <label className="text-sm font-semibold text-slate-900">Active</label>
              </div>

              <div className="md:col-span-2 flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => { setEditingCoupon(null); setEditForm(null); }}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {isLoading ? 'Updating...' : 'Update Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
