import React, { useState } from 'react';
export default function UsersTab({ users }) {
  const [q, setQ] = useState('');
  const ql = q.trim().toLowerCase();
  const filtered = !ql ? (users || []) : (users || []).filter(u => [u.name, u.email, u.phone].filter(Boolean).join(' ').toLowerCase().includes(ql));
  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search users..." className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Phone</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered && filtered.length > 0 ? filtered.map((user) => (
                <tr key={user._id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-6 py-3 font-semibold">{user.name}</td>
                  <td className="px-6 py-3">{user.email}</td>
                  <td className="px-6 py-3">{user.phone || 'N/A'}</td>
                  <td className="px-6 py-3">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Active</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No users</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
