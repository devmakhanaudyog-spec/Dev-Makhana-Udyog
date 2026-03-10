import React, { useState } from 'react';
import axios from 'axios';
export default function MessagesTab({ messages, loadData }) {
  const [selected, setSelected] = useState(null);
  const [q, setQ] = useState('');
  const ql = q.trim().toLowerCase();
  const filtered = !ql ? (messages || []) : (messages || []).filter(m => [m.name, m.email, m.subject, m.message].filter(Boolean).join(' ').toLowerCase().includes(ql));
  async function handleDelete(msgId) {
    if (!window.confirm('Delete this message?')) return;
    try {
      await axios.delete(`/api/admin/messages/${msgId}`);
      if (typeof loadData === 'function') loadData();
    } catch (err) {
      alert('Delete failed');
    }
  }
  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Customer Messages</h1>
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search messages..." className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Phone</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Subject</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Message</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered && filtered.length > 0 ? filtered.map((msg) => (
                <tr key={msg._id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-6 py-3">{msg.name}</td>
                  <td className="px-6 py-3">{msg.email}</td>
                  <td className="px-6 py-3">{msg.phone || <span className='text-slate-400'>-</span>}</td>
                  <td className="px-6 py-3">{msg.subject}</td>
                  <td className="px-6 py-3">
                    <div className="text-slate-700 text-sm whitespace-pre-wrap break-words max-w-xl">
                      {msg.message}
                    </div>
                  </td>
                  <td className="px-6 py-3">{new Date(msg.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-3 text-right flex gap-2 justify-end">
                    <button
                      onClick={() => setSelected(msg)}
                      className="px-3 py-1.5 text-sm bg-slate-200 hover:bg-slate-300 rounded-lg"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(msg._id)}
                      className="px-3 py-1.5 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-lg"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No messages</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Message Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Message Details</h2>
              <button
                onClick={() => setSelected(null)}
                className="px-3 py-1.5 text-sm bg-slate-200 hover:bg-slate-300 rounded-lg"
              >
                Close
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="font-semibold text-slate-700">Name:</span> {selected.name}</div>
              <div><span className="font-semibold text-slate-700">Email:</span> {selected.email}</div>
              <div><span className="font-semibold text-slate-700">Phone:</span> {selected.phone || <span className='text-slate-400'>-</span>}</div>
              <div><span className="font-semibold text-slate-700">Subject:</span> {selected.subject}</div>
              <div><span className="font-semibold text-slate-700">Date:</span> {new Date(selected.createdAt).toLocaleString()}</div>
            </div>
            <div className="mt-4">
              <div className="text-slate-700 whitespace-pre-wrap break-words">
                {selected.message}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
