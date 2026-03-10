import React, { useState, useEffect } from "react";
import axios from "../utils/api.js";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { API_BASE_URL } from '../config.js';

export default function Checkout() {
  const { settings, setSettings } = useSettings();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    coupon: "",
  });
  const [status, setStatus] = useState(null);
  const [cart, setCart] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
    // Always reload settings on mount
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/public/settings`);
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  // Add a button to reload settings dynamically (for admin changes)
  const reloadSettings = async () => {
    try {
      const res = await fetch('/api/public/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        alert('Settings reloaded!');
      } else {
        alert('Failed to reload settings');
      }
    } catch (e) {
      alert('Error reloading settings');
    }
  };

  async function placeOrder(e) {
    e.preventDefault();
    if (cart.length === 0) return alert("Cart is empty");
    setStatus("loading");

    const payload = { cart, ...form };

    try {
      await axios.post("/api/orders", payload);
      localStorage.removeItem("cart");
      setStatus("success");
      nav("/");
      alert("Order placed successfully!");
    } catch (e) {
      setStatus("error");
      alert("Order failed. Try again.");
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const gstPercent = Number(settings?.taxPercentage ?? 18);
  const specialDiscountPercent = settings?.specialDiscountPercentage != null
    ? Number(settings.specialDiscountPercentage)
    : gstPercent; // default: offset GST
  const gstAmount = +(subtotal * (gstPercent / 100)).toFixed(2);
  const specialDiscountAmount = +(subtotal * (specialDiscountPercent / 100)).toFixed(2);
  const shippingCost = Number(settings?.shippingCost ?? 0);
  const total = subtotal + gstAmount + shippingCost - specialDiscountAmount;

  return (
    <div className="bg-brand-soft min-h-screen py-8 sm:py-12">
      {/* Debug output removed as requested */}
      <main className="max-w-5xl mx-auto flex flex-col lg:flex-row flex-wrap gap-6 lg:gap-8 px-2 sm:px-4 overflow-x-hidden min-w-0">
        {/* Checkout Form */}
        <div className="flex-1 bg-white rounded-xl shadow-lg p-4 sm:p-8 min-w-0 max-w-full">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-center">Checkout</h1>
          {/* Reload Settings button removed as requested */}
          <p className="text-gray-700 mb-4 sm:mb-6 text-center text-sm sm:text-base">
            Fill in your details to complete the order. You can also review your cart items here.
          </p>

          <form onSubmit={placeOrder} className="space-y-3 sm:space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-3 sm:p-3.5 input-brand text-sm sm:text-base"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 sm:p-3.5 input-brand text-sm sm:text-base"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              type="tel"
              placeholder="Phone Number"
              className="w-full p-3 sm:p-3.5 input-brand text-sm sm:text-base"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
            <textarea
              placeholder="Shipping Address"
              className="w-full p-3 sm:p-3.5 input-brand text-sm sm:text-base"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Coupon Code (optional)"
              className="w-full p-3 sm:p-3.5 input-brand text-sm sm:text-base"
              value={form.coupon}
              onChange={(e) => setForm({ ...form, coupon: e.target.value })}
            />

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-3 sm:mt-4">
              <button
                type="submit"
                className="flex-1 bg-brand-gradient text-white px-4 sm:px-6 py-3 rounded hover:opacity-95 transition text-base sm:text-lg font-medium shadow-brand"
              >
                {status === "loading" ? "Placing Order..." : "Place Order"}
              </button>
              <button
                type="button"
                onClick={() => nav("/products")}
                className="flex-1 btn-brand-ghost px-4 sm:px-6 py-3 text-base sm:text-lg font-medium"
              >
                Shop More
              </button>
            </div>
            {status === "success" && (
              <p className="text-green-600 text-center mt-2">Order placed successfully!</p>
            )}
            {status === "error" && (
              <p className="text-red-600 text-center mt-2">Failed to place order. Try again.</p>
            )}
          </form>

          <div className="mt-6 sm:mt-8 text-gray-700">
            <h3 className="text-xl font-semibold mb-2">Why shop with us?</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>✅ Fast and reliable shipping</li>
              <li>✅ 100% handmade & unique products</li>
              <li>✅ Easy returns & customer support</li>
              <li>✅ Apply coupons for extra discounts</li>
            </ul>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="w-full mx-auto lg:mx-0 lg:w-1/3 bg-white rounded-xl shadow-lg p-4 sm:p-6 mt-8 lg:mt-0 min-w-0 max-w-full overflow-x-hidden">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Order Summary</h2>
          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              <ul className="space-y-2 sm:space-y-3">
                {cart.map((item) => (
                  <li key={item._id} className="flex justify-between items-center border-b pb-2 text-sm sm:text-base">
                    <span>{item.name} x {item.qty}</span>
                    <span>₹{item.price * item.qty}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 sm:mt-4 space-y-2 text-xs sm:text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST ({gstPercent}%)</span>
                  <span>₹{gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-700 font-semibold">
                  <span>Special Discount ({specialDiscountPercent}%)</span>
                  <span>-₹{specialDiscountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingCost ? `₹${shippingCost.toFixed(2)}` : 'FREE'}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-base sm:text-lg text-gray-900">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => nav("/products")}
                className="mt-3 w-full bg-brand-gradient text-white px-4 py-2 rounded hover:opacity-95 transition shadow-brand text-sm sm:text-base"
              >
                Shop More
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
