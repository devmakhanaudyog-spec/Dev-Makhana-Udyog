
import React, { useEffect, useState, useRef } from "react";
import axios from "../../utils/api.js";

const SUBCATEGORY_OPTIONS = [
  "Plain Makhana",
  "Roasted Makhana",
  "Makhana Dessert",
  "Makhana Powder",
  "Makhana Shake",
  "Save On Bundles"
];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: 0,
    description: "",
    image: "",
    category: "Makhana",
    subCategory: "Plain Makhana"
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: 0,
    description: "",
    image: "",
    category: "Makhana",
    subCategory: "Plain Makhana"
  });
  const fileInputRef = useRef();

  useEffect(() => {
    axios
      .get("/api/admin/products")
      .then((r) => setProducts(r.data))
      .catch(() => setProducts([]));
  }, []);

  // Always show these products at the top in this order if present
  // Update: Use new product names as per database
  const orderedNames = [
    "Raw Makhana (Phool)",
    "Roasted Makhana",
    "Flavored Makhana"
  ];
  function getOrderedProducts(products) {
    const nameMap = {};
    products.forEach(p => {
      if (p.name) nameMap[p.name.trim().toLowerCase()] = p;
    });
    const ordered = orderedNames
      .map(name => nameMap[name.trim().toLowerCase()])
      .filter(Boolean);
    const rest = products.filter(
      p => !orderedNames.some(name => p.name && p.name.trim().toLowerCase() === name.trim().toLowerCase())
    );
    return [...ordered, ...rest];
  }

  async function create(e) {
    e.preventDefault();
    // Validate required fields
    if (!form.name.trim() || !form.price || !form.description.trim() || (!form.image && !imageFile)) {
      alert("All fields including image are required.");
      return;
    }
    let imageUrl = form.image;
    // Handle image upload if file selected
    if (imageFile) {
      const data = new FormData();
      data.append("file", imageFile);
      data.append("upload_preset", "makhana_uploads"); // Cloudinary preset or your backend
      try {
        const uploadRes = await axios.post("https://api.cloudinary.com/v1_1/dqg7u3r2a/image/upload", data);
        imageUrl = uploadRes.data.secure_url;
      } catch (err) {
        alert("Image upload failed");
        return;
      }
    }
    try {
      const res = await axios.post("/api/admin/products", { ...form, image: imageUrl });
      if (Array.isArray(res.data)) setProducts(res.data);
      else setProducts((old) => [...old, res.data]);
      setForm({
        name: "",
        price: 0,
        description: "",
        image: "",
        category: "Makhana",
        subCategory: "Plain Makhana"
      });
      setImageFile(null);
      setImagePreview("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Create error:", err);
      alert("Create failed");
    }
  }

  function startEdit(product) {
    setEditId(product._id);
    setEditForm({
      name: product.name || "",
      price: product.price || 0,
      description: product.description || "",
      image: product.image || "",
      category: product.category || "Makhana",
      subCategory: product.subCategory || "Plain Makhana"
    });
  }

  function cancelEdit() {
    setEditId(null);
    setEditForm({
      name: "",
      price: 0,
      description: "",
      image: "",
      category: "Makhana",
      subCategory: "Plain Makhana"
    });
  }

  async function saveEdit(id) {
    try {
      const res = await axios.put(`/api/admin/products/${id}`, editForm);
      setProducts((old) => old.map((p) => (p._id === id ? res.data : p)));
      cancelEdit();
    } catch (err) {
      console.error("Update error:", err);
      alert("Update failed");
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this product?")) return;
    const prev = products;
    setProducts(products.filter((p) => p._id !== id));
    try {
      await axios.delete(`/api/admin/products/${id}`);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed");
      setProducts(prev);
    }
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl mb-4">Admin - Products</h1>

      <form onSubmit={create} className="grid md:grid-cols-5 gap-2 mb-6 bg-white p-4 rounded-xl shadow">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Name"
          required
          className="p-2 border rounded"
        />
        <input
          value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          placeholder="Price"
          type="number"
          required
          className="p-2 border rounded"
        />
        <input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Description"
          required
          className="p-2 border rounded"
        />
        <select
          value={form.subCategory}
          onChange={e => setForm({ ...form, subCategory: e.target.value })}
          className="p-2 border rounded"
          required
        >
          {SUBCATEGORY_OPTIONS.map((sub) => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>
        <div className="flex flex-col items-center">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={e => {
              const file = e.target.files[0];
              setImageFile(file);
              if (file) {
                const reader = new FileReader();
                reader.onload = ev => setImagePreview(ev.target.result);
                reader.readAsDataURL(file);
              } else {
                setImagePreview("");
              }
            }}
            className="mb-1"
          />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded border" />
          )}
        </div>
        <button className="px-4 py-2 bg-black text-white rounded col-span-5 md:col-span-1">Add Product</button>
      </form>

      <ul>
        {getOrderedProducts(products).map((p) => (
          <li key={p._id} className="flex justify-between items-center border p-3 rounded mb-2 bg-white">
            {editId === p._id ? (
              <>
                <div className="flex flex-col gap-1">
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="p-1 border rounded mb-1"
                  />
                  <input
                    value={editForm.price}
                    type="number"
                    onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                    className="p-1 border rounded mb-1"
                  />
                  <input
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="p-1 border rounded mb-1"
                  />
                  <select
                    value={editForm.subCategory}
                    onChange={(e) => setEditForm({ ...editForm, subCategory: e.target.value })}
                    className="p-1 border rounded mb-1"
                  >
                    {SUBCATEGORY_OPTIONS.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(p._id)} className="text-green-600 mr-2">Save</button>
                  <button onClick={cancelEdit} className="text-gray-600">Cancel</button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div>₹{p.price}</div>
                  <div className="text-xs text-green-700 font-medium">{p.subCategory || 'Plain Makhana'}</div>
                  <div className="text-xs text-gray-500">{p.description}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(p)} className="text-blue-600 mr-2">Edit</button>
                  <button onClick={() => remove(p._id)} className="text-red-600">Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
