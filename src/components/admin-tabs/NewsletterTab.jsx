import React, { useState } from 'react';
export default function NewsletterTab({ subscribers }) {
  const [q, setQ] = useState('');
  const ql = q.trim().toLowerCase();
  const filtered = !ql ? (subscribers || []) : (subscribers || []).filter(s => (s.email || '').toLowerCase().includes(ql));
  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Newsletter Subscribers</h1>
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search subscribers..." className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 font-semibold">Total Subscribers</p>
            <p className="text-3xl font-bold text-blue-900 mt-2">{subscribers?.length || 0}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 font-semibold">Active</p>
            <p className="text-3xl font-bold text-green-900 mt-2">{subscribers?.length || 0}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-600 font-semibold">This Month</p>
            <p className="text-3xl font-bold text-orange-900 mt-2">+0</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Subscribed Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered && filtered.length > 0 ? filtered.map((sub) => (
                <tr key={sub._id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-6 py-3 font-semibold">{sub.email}</td>
                  <td className="px-6 py-3">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Active</span>
                  </td>
                  <td className="px-6 py-3">{new Date(sub.createdAt).toLocaleDateString()}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-slate-500">No subscribers yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
