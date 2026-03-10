import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/api.js";
import { Heart } from "lucide-react";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true); // added for skeleton
  const nav = useNavigate();

  // Load products
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await axios.get("/api/products");
        if (!cancelled) {
          const list = Array.isArray(res.data?.products)
            ? res.data.products
            : Array.isArray(res.data)
              ? res.data
              : [];
          setProducts(list);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setProducts([]); // No fallback products except Makhana (API should provide)
          setLoading(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Load cart & wishlist from localStorage
  useEffect(() => {
    try {
      const cartData = localStorage.getItem("cart") || "[]";
      const cartParsed = JSON.parse(cartData);
      setCart(Array.isArray(cartParsed) ? cartParsed : []);
      
      const wishlistData = localStorage.getItem("wishlist") || "[]";
      const wishlistParsed = JSON.parse(wishlistData);
      setWishlist(Array.isArray(wishlistParsed) ? wishlistParsed : []);
    } catch (e) {
      console.error("Error parsing cart/wishlist:", e);
      setCart([]);
      setWishlist([]);
    }
  }, []);

  const updateCart = (product, qty) => {
    let newCart = [...cart];
    const idx = newCart.findIndex(i => i._id === product._id);
    if (idx >= 0) {
      newCart[idx].qty = qty;
      if (qty === 0) newCart.splice(idx, 1);
    } else if (qty > 0) {
      newCart.push({ ...product, qty });
    }
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const add = (product) => {
    const item = cart.find(i => i._id === product._id);
    if (!item) updateCart(product, 1);
    else if (item.qty < 3) updateCart(product, item.qty + 1);
    else {
      window.alert("Only allowed 3 items at a time!");
    }
  };

  const remove = (product) => {
    const item = cart.find(i => i._id === product._id);
    if (item) updateCart(product, item.qty - 1);
  };

  const buyNow = (product) => {
    add(product);
    nav("/cart");
  };

  const toggleWishlist = (product) => {
    let newWishlist = [...wishlist];
    const idx = newWishlist.findIndex(i => i._id === product._id);
    if (idx >= 0) newWishlist.splice(idx, 1);
    else newWishlist.push(product);
    setWishlist(newWishlist);
    localStorage.setItem("wishlist", JSON.stringify(newWishlist));
  };

  // Skeleton component
  const Skeleton = ({ className }) => (
    <div className={`bg-gray-300 animate-pulse ${className}`}></div>
  );

  return (
    <div className="bg-gradient-to-r from-pink-50 via-red-50 to-yellow-50 min-h-screen py-12">
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-semibold">All Products</h2>
          <Link to="/" className="text-sm text-blue-600 hover:underline">Back to Home</Link>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? Array(8).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                  <Skeleton className="h-56 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-6 w-full mt-2" />
                  </div>
                </div>
              ))
            : (Array.isArray(products) ? [...products].reverse() : []).map(p => {
                const cartItem = cart.find(i => i._id === p._id);
                const qty = cartItem ? cartItem.qty : 0;
                const finalPrice = p.discount ? Math.round(p.price * (1 - p.discount / 100)) : p.price;
                const inWishlist = wishlist.find(i => i._id === p._id);
                return (
                  <div key={p._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transform hover:scale-105 transition relative overflow-hidden">

                    {p.discount > 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        {p.discount}% OFF
                      </div>
                    )}

                    <button
                      onClick={() => toggleWishlist(p)}
                      className={`absolute top-2 right-2 z-10 bg-white p-1 rounded-full shadow`}
                    >
                      <Heart size={20} className={inWishlist ? "text-red-600" : "text-gray-400"} />
                    </button>

                    <Link to={`/product/${p._id}`}>
                      <div className="h-56 bg-gray-100 relative">
                        <img
                          src={p.mainImage || p.images?.[0] || p.image || "/placeholder.png"}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>

                    <div className="p-4 flex flex-col justify-between h-56">
                      <div>
                        <div className="font-semibold text-md text-gray-800">{p.name}</div>
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description}</div>

                        <div className="flex items-center mt-2 text-yellow-500 text-sm">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 fill-current ${i < p.rating ? "text-yellow-500" : "text-gray-300"}`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.488 6.91l6.572-.955L10 0l2.94 5.955 6.572.955-4.757 4.635 1.123 6.545z" />
                            </svg>
                          ))}
                          <span className="ml-2 text-gray-600 text-xs">{p.rating}.0</span>
                        </div>

                        <div className="mt-2 font-bold text-lg text-gray-900">
                          {p.discount > 0 ? (
                            <>
                              <span className="line-through text-gray-400 mr-2">₹{p.price}</span>
                              <span>₹{finalPrice}</span>
                            </>
                          ) : (
                            <span>₹{p.price}</span>
                          )}
                        </div>

                        <div className="mt-1 text-green-600 text-sm">{p.delivery || "Free Delivery"}</div>
                      </div>

                      <div className="mt-3 flex gap-2 items-center">
                        {qty > 0 ? (
                          <>
                            <button onClick={() => remove(p)} className="px-2 py-1 border rounded hover:bg-red-50 transition">-</button>
                            <span className="px-2">{qty}</span>
                            <button onClick={() => add(p)} className="px-2 py-1 border rounded hover:bg-red-50 transition" disabled={qty >= 3}>+</button>
                            <button onClick={() => buyNow(p)} className="ml-auto text-sm px-3 py-1 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400 text-white rounded hover:opacity-90 transition">Buy</button>
                          </>
                        ) : (
                          <button onClick={() => add(p)} className="w-full text-sm px-3 py-2 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400 text-white rounded hover:opacity-90 transition">Add</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
          }
        </div>

        <div className="mt-12 text-center bg-blue-50 p-6 rounded-lg">
          <h3 className="text-2xl font-semibold mb-2">Discover unique handmade products!</h3>
          <p className="text-gray-700 mb-4">Browse our collection and find the perfect items crafted with love and care.</p>
          <Link to="/products" className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition">Shop Now</Link>
        </div>
      </section>
    </div>
  );
}
