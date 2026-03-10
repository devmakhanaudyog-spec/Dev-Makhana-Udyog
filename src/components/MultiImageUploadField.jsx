import React, { useState } from 'react';

export default function MultiImageUploadField({ value = [], onChange, label = 'Product Images', name = 'images' }) {
  const [previews, setPreviews] = useState(value);
  const [uploading, setUploading] = useState(false);

  const handleFilesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const uploaded = [];
    const token = localStorage.getItem('token');
    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);
      try {
        const res = await fetch('/api/admin/images/upload-image', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });
        const data = await res.json();
        if (data.url) {
          uploaded.push(data.url);
        } else {
          console.error('Upload failed:', data.error);
        }
      } catch (err) {
        console.error('Upload error:', err);
      }
    }
    const next = [...previews, ...uploaded];
    setPreviews(next);
    onChange(next);
    setUploading(false);
  };

  const handleRemove = (url) => {
    const next = previews.filter((img) => img !== url);
    setPreviews(next);
    onChange(next);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      <input type="file" accept="image/*" multiple onChange={handleFilesChange} disabled={uploading} />
      <div className="flex gap-2 mt-2 flex-wrap">
        {previews.map((img, idx) => (
          <div key={idx} style={{ position: 'relative' }}>
            <img src={img} alt="Preview" style={{ maxWidth: 80, maxHeight: 80, borderRadius: 8 }} />
            <button type="button" onClick={() => handleRemove(img)} style={{ position: 'absolute', top: 2, right: 2, background: '#fff', borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 2 }}>✕</button>
          </div>
        ))}
      </div>
      {uploading && <div className="text-xs text-blue-600 mt-1">Uploading...</div>}
      <input type="hidden" name={name} value={JSON.stringify(previews)} />
    </div>
  );
}
