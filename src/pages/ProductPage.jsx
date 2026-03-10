import React, {useEffect,useState} from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/api.js";

function addToCart(product, qty=1){
  try {
    const cartData = localStorage.getItem("cart") || "[]";
    const cart = JSON.parse(cartData);
    const cartArr = Array.isArray(cart) ? cart : [];
    const idx = cartArr.findIndex(i=>i._id===product._id);
    if(idx>=0) cartArr[idx].qty += qty; else cartArr.push({...product, qty});
    localStorage.setItem("cart", JSON.stringify(cartArr));
  } catch (e) {
    console.error("Error updating cart:", e);
  }
}

export default function ProductPage(){
  const { id } = useParams();
  const [product,setProduct]=useState(null);
  const nav = useNavigate();
  useEffect(()=>{ axios.get(`/api/products/${id}`).then(r=>setProduct(r.data)).catch(()=>setProduct(null)); },[id]);
  if(!product) return <div className="p-6">Loading...</div>;
  // Gallery logic: use images array if available, fallback to mainImage/image
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.mainImage || product.image || '/placeholder.png'];

  return (
    <main className="max-w-5xl mx-auto p-6 grid md:grid-cols-2 gap-6">
      <div>
        <div className="flex gap-2 mb-4 flex-wrap">
          {images.map((img, idx) => (
            <img key={idx} src={img} alt={product.name} className="w-32 h-32 object-cover rounded border" />
          ))}
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-xl font-bold text-brand">₹{product.price ?? "-"}</span>
          {product.originalPrice ? (
            <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
          ) : null}
          {product.discount ? (
            <span className="ml-2 text-green-600 text-sm font-semibold">-{product.discount}%</span>
          ) : null}
        </div>
        <p className="mt-4">{product.description}</p>
        <div className="mt-6 flex gap-3">
          <button onClick={()=>{ addToCart(product); nav('/cart'); }} className="px-4 py-2 border rounded">Add to cart</button>
          <button onClick={()=>{ addToCart(product,1); nav('/checkout'); }} className="px-4 py-2 bg-black text-white rounded">Buy now</button>
        </div>
      </div>
    </main>
  );
}