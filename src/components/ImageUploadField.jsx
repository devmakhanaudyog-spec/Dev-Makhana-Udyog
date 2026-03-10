import React, { useState } from 'react';

export default function ImageUploadField({ value, onChange, label = 'Product Image', name = 'image' }) {
  const [preview, setPreview] = useState(value || '');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    const token = localStorage.getItem('token');
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
        setPreview(data.url);
        onChange(data.url);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
      {preview && (
        <div className="mt-2">
          <img src={preview} alt="Preview" style={{ maxWidth: 180, maxHeight: 180, borderRadius: 8 }} />
        </div>
      )}
      {uploading && <div className="text-xs text-blue-600 mt-1">Uploading...</div>}
      <input type="hidden" name={name} value={preview} />
    </div>
  );
}
