import React, { useState } from 'react';
import ImageUploadField from '../ImageUploadField.jsx';
import MultiImageUploadField from '../MultiImageUploadField.jsx';
import { Edit2, Trash2, Plus, ToggleLeft, ToggleRight, X } from 'lucide-react';
import axios from '../../utils/api.js';
import toast from 'react-hot-toast';

export default function ProductsTab({ products, loadData }) {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ price: 0, originalPrice: 0, discount: 0, stock: 0, moq: '', active: true });
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    productId: '',
    price: '',
    originalPrice: '',
    description: '',
    category: 'Makhana',
    grade: '',
    popRate: '',
    moisture: '',
    packaging: '',
    use: '',
    moq: '',
    stock: 0,
    mainImage: '',
    images: '',
    active: true
  });

  const computeDiscount = (priceVal, originalVal) => {
    const priceNum = parseFloat(priceVal);
    const originalNum = parseFloat(originalVal);
    if (!originalNum || originalNum <= 0 || !priceNum || priceNum <= 0) return 0;
    const raw = Math.round((1 - priceNum / originalNum) * 100);
    return Math.max(0, Math.min(100, raw));
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      price: product.price,
      originalPrice: product.originalPrice || product.price || 0,
      discount: product.discount || computeDiscount(product.price, product.originalPrice || product.price),
      stock: product.stock,
      moq: product.moq || '',
      active: product.active !== false
    });
  };

  // Save only non-image fields
  const handleUpdateFields = async () => {
    try {
      await axios.put(`/api/admin/products/${editingId}`, {
        price: parseFloat(formData.price),
        originalPrice: parseFloat(formData.originalPrice) || undefined,
        discount: computeDiscount(formData.price, formData.originalPrice),
        stock: parseInt(formData.stock),
        moq: formData.moq,
        active: formData.active
      });
      toast.success('Product details updated');
      setEditingId(null);
      loadData();
    } catch (error) {
      toast.error('Failed to update product details');
    }
  };

  // Save only image fields
  const handleUpdateImage = async () => {
    try {
      await axios.put(`/api/admin/products/${editingId}`, {
        mainImage: formData.mainImage,
        images: Array.isArray(formData.images) ? formData.images : (formData.images ? formData.images.split(',').map(s => s.trim()).filter(Boolean) : [])
      });
      toast.success('Product image updated');
      setEditingId(null);
      loadData();
    } catch (error) {
      toast.error('Failed to update product image');
    }
  };

  const handleAddProduct = async () => {
    if (!addForm.name || !addForm.productId || !addForm.price) {
      toast.error('Name, Product ID, and Price are required');
      return;
    }

    const payload = {
      ...addForm,
      price: parseFloat(addForm.price),
      originalPrice: addForm.originalPrice ? parseFloat(addForm.originalPrice) : undefined,
      stock: parseInt(addForm.stock) || 0,
      images: addForm.images
        ? addForm.images.split(',').map(s => s.trim()).filter(Boolean)
        : [],
    };

    try {
      await axios.post('/api/admin/products', payload);
      toast.success('Product added');
      setAddOpen(false);
      setAddForm({
        name: '', productId: '', price: '', originalPrice: '', description: '', category: 'Makhana',
        grade: '', popRate: '', moisture: '', packaging: '', use: '', moq: '', stock: 0, mainImage: '', images: '', active: true
      });
      loadData();
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to add product';
      toast.error(msg);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`/api/admin/products/${productId}`);
      toast.success('Product deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Products Catalog</h1>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus size={20} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Product Name</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Image</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">SKU</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">MRP</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Discount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">MOQ</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Stock</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Category</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products && products.length > 0 ? (
                products.map((product) => (
                  <tr key={product._id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-3">
                      {product.mainImage ? (
                        <img src={product.mainImage} alt="Product" style={{ maxWidth: 60, maxHeight: 60, borderRadius: 8 }} />
                      ) : (
                        <span className="text-slate-400 text-xs">No image</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm font-semibold text-slate-900">{product.name}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{product.sku}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-green-600">₹{product.price?.toLocaleString()}</td>
                    <td className="px-6 py-3 text-sm text-slate-700">{product.originalPrice ? `₹${product.originalPrice.toLocaleString()}` : '—'}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-amber-700">{typeof product.discount === 'number' ? `${product.discount}%` : '—'}</td>
                    <td className="px-6 py-3 text-sm text-slate-700">{product.moq || '—'}</td>
                    <td className="px-6 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {product.active !== false ? 'In Store' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-600">{product.category}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition text-blue-600"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                          title="Delete"
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
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Edit Product</h2>
              <div className="space-y-4">
                <div>
                  <ImageUploadField
                    value={formData.mainImage}
                    onChange={(url) => setFormData({ ...formData, mainImage: url })}
                    label="Main Product Image"
                    name="mainImage"
                  />
                </div>
                <div>
                  <MultiImageUploadField
                    value={Array.isArray(formData.images) ? formData.images : []}
                    onChange={(imgs) => setFormData({ ...formData, images: imgs })}
                    label="Product Images (multiple)"
                    name="images"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Price *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => {
                        const nextPrice = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          price: nextPrice,
                          discount: computeDiscount(nextPrice, prev.originalPrice)
                        }));
                      }}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="899"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Original Price (MRP)</label>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => {
                        const nextOriginal = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          originalPrice: nextOriginal,
                          discount: computeDiscount(prev.price, nextOriginal)
                        }));
                      }}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="1299"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Discount % (auto)</label>
                    <input
                      type="number"
                      value={formData.discount}
                      readOnly
                      className="w-full px-4 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Stock</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">MOQ</label>
                    <input
                      type="text"
                      value={formData.moq}
                      onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
                      placeholder="e.g., 10 kg or 100 packs"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-700">Active</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, active: !formData.active })}
                    className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    {formData.active ? <ToggleRight className="text-emerald-600" /> : <ToggleLeft className="text-slate-400" />}
                    <span className="text-sm text-slate-800">{formData.active ? 'Visible & In Stock' : 'Hidden'}</span>
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateImage}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                    >
                      Save Image
                    </button>
                    <button
                      onClick={handleUpdateFields}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                    >
                      Save Details
                    </button>
                  </div>
                  <button
                    onClick={() => setEditingId(null)}
                    className="w-full py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {addOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 relative">
            <button
              onClick={() => setAddOpen(false)}
              className="absolute top-3 right-3 p-2 text-slate-500 hover:text-slate-800"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Add Product</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Name *</label>
                <input
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  placeholder="7 Suta Makhana"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Product ID / Slug *</label>
                <input
                  value={addForm.productId}
                  onChange={(e) => setAddForm({ ...addForm, productId: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  placeholder="7-suta"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Price *</label>
                <input
                  type="number"
                  value={addForm.price}
                  onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  placeholder="899"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Original Price (MRP)</label>
                <input
                  type="number"
                  value={addForm.originalPrice}
                  onChange={(e) => setAddForm({ ...addForm, originalPrice: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  placeholder="1299"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  rows={2}
                  placeholder="Short description"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Grade</label>
                <input
                  value={addForm.grade}
                  onChange={(e) => setAddForm({ ...addForm, grade: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  placeholder="Super Premium 16mm+"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Pop Rate</label>
                <input
                  value={addForm.popRate}
                  onChange={(e) => setAddForm({ ...addForm, popRate: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  placeholder="99%+"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Moisture</label>
                <input
                  value={addForm.moisture}
                  onChange={(e) => setAddForm({ ...addForm, moisture: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  placeholder="< 2.5%"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Packaging</label>
                <input
                  value={addForm.packaging}
                  onChange={(e) => setAddForm({ ...addForm, packaging: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  placeholder="1kg / 5kg nitrogen-flushed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Use Case</label>
                <input
                  value={addForm.use}
                  onChange={(e) => setAddForm({ ...addForm, use: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  placeholder="Retail, gifting"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">MOQ</label>
                <input
                  value={addForm.moq}
                  onChange={(e) => setAddForm({ ...addForm, moq: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  placeholder="50 kg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Stock</label>
                <input
                  type="number"
                  value={addForm.stock}
                  onChange={(e) => setAddForm({ ...addForm, stock: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  placeholder="100"
                />
              </div>
              <div>
                <ImageUploadField
                  value={addForm.mainImage}
                  onChange={(url) => setAddForm({ ...addForm, mainImage: url })}
                  label="Main Product Image"
                  name="mainImage"
                />
              </div>
              <div>
                <MultiImageUploadField
                  value={Array.isArray(addForm.images) ? addForm.images : []}
                  onChange={(imgs) => setAddForm({ ...addForm, images: imgs })}
                  label="Product Images (multiple)"
                  name="images"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-700">Active</span>
                <button
                  type="button"
                  onClick={() => setAddForm({ ...addForm, active: !addForm.active })}
                  className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  {addForm.active ? <ToggleRight className="text-emerald-600" /> : <ToggleLeft className="text-slate-400" />}
                  <span className="text-sm text-slate-800">{addForm.active ? 'Visible & In Stock' : 'Hidden'}</span>
                </button>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleAddProduct}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                Save Product
              </button>
              <button
                onClick={() => setAddOpen(false)}
                className="flex-1 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
