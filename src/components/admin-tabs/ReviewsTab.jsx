import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ReviewsTab({ reviews, loadData }) {
  const handleApprove = async (reviewId) => {
    try {
      await axios.put(`/api/admin/reviews/${reviewId}`, { approved: true });
      toast.success('Review approved');
      loadData();
    } catch (error) {
      toast.error('Failed to approve review');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await axios.delete(`/api/admin/reviews/${reviewId}`);
      toast.success('Review deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const [q, setQ] = useState('');
  const ql = q.trim().toLowerCase();
  const filtered = !ql ? (reviews || []) : (reviews || []).filter(r => [
    r.product?.name,
    r.user?.name || r.name,
    r.email,
    r.comment,
    String(r.rating)
  ].filter(Boolean).join(' ').toLowerCase().includes(ql));
  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Product Reviews</h1>
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search reviews..." className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-6 py-3 text-left text-sm font-semibold">Product</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Reviewer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Rating</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Location</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered && filtered.length > 0 ? filtered.map((review) => (
                <tr key={review._id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-6 py-3 font-semibold">{review.product?.name || review.productId?.name || 'Product'}</td>
                  <td className="px-6 py-3">
                    <div className="font-semibold">{review.user?.name || review.userId?.name || review.name || 'Anonymous'}</div>
                    <div className="text-xs text-slate-500">{review.email}</div>
                    <div className="text-sm text-slate-700 line-clamp-2 mt-1">{review.comment}</div>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-yellow-500 font-semibold">★ {review.rating}</span>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-600">
                    {review.state || review.district ? `${review.state || ''}${review.state && review.district ? ', ' : ''}${review.district || ''}` : '—'}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      review.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {review.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {!review.approved && (
                        <button
                          onClick={() => handleApprove(review._id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-semibold"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No reviews</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
