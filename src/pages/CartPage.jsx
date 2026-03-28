import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, Heart, ArrowRight, Lock, Truck, Gift } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { API_BASE_URL } from '../config.js';
import { formatINR } from '../utils/currency';
import toast from "react-hot-toast";

export default function CartPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { settings, setSettings } = useSettings();
    // ...existing code...
  const { 
    cart, 
    wishlist, 
    updateQuantity, 
    updatePackSize,
    removeFromCart, 
    removeFromWishlist,
    moveToCart,
    cartTotal,
    cartCount 
  } = useCart();

    React.useEffect(() => {
      if (!authLoading && !user) {
        toast.error('Please login to view your cart');
        navigate('/login?next=/cart', { replace: true });
      }
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
    }, [user, authLoading, navigate, setSettings]);

    if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-green-800">
            Redirecting to login…
          </div>
        </div>
      );
    }

  const PACK_OPTIONS = [
    { label: '200g', value: 0.2 },
    { label: '1kg', value: 1 },
    { label: '6kg', value: 6 },
    { label: '7kg', value: 7 },
    { label: '10kg', value: 10 },
  ];

  const gstPercent = Number(settings?.taxPercentage ?? 18);
  const specialDiscountPercent = Number(settings?.specialDiscountPercentage ?? 0);
  const shippingPrice = cartTotal < 1000 ? 50 : 0; // Apply ₹50 if total < 1000, else free
  const taxPrice = cartTotal * (gstPercent / 100);
  const specialDiscountAmount = cartTotal * (specialDiscountPercent / 100);
  const total = cartTotal + shippingPrice + taxPrice - specialDiscountAmount;

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    navigate('/checkout');
  };


  const handleRemove = (productId, productName) => {
    removeFromCart(productId);
    toast.success(`${productName} removed from cart`);
  };

  const handleMoveToCart = (product) => {
    moveToCart(product);
    toast.success(`${product.name} moved to cart`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 py-6">
      {/* Debug output removed as requested */}
      <div className="max-w-6xl mx-auto px-4">
        {/* Reload Settings button removed as requested */}
        {/* Header with gradient */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            <span className="font-semibold text-green-700">{cartCount}</span> {cartCount === 1 ? 'item' : 'items'} in cart
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-green-100">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={48} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Discover our premium makhana products!</p>
            <Link 
              to="/products" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              <ShoppingBag size={20} />
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => {
                const packSize = item.packSizeKg || 1;
                const perPackPrice = Math.round((Number(item.price) || 0) * packSize);
                const linePrice = perPackPrice * (item.qty || 1);
                return (

                <div key={item._id} className="bg-white rounded-xl shadow-md hover:shadow-lg p-2 sm:p-4 transition-all duration-200 border border-gray-100">
                  <div className="flex flex-row gap-2 sm:gap-4 items-start">
                    <Link to={`/product/${item._id}`} className="flex-shrink-0 group w-16 h-16 sm:w-28 sm:h-28">
                      <div className="relative overflow-hidden rounded-lg w-16 h-16 sm:w-28 sm:h-28 bg-gray-50 flex items-center justify-center">
                        <img 
                          src={item.mainImage || item.image || "/placeholder.png"} 
                          className="w-full h-full max-w-[64px] max-h-[64px] sm:max-w-[112px] sm:max-h-[112px] object-contain rounded-lg group-hover:scale-105 transition-transform duration-200" 
                          alt={item.name}
                        />
                      </div>
                    </Link>
                    <div className="flex-grow flex flex-col justify-between min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between min-w-0">
                        <Link to={`/product/${item._id}`} className="truncate">
                          <h3 className="font-semibold text-sm sm:text-base text-gray-900 hover:text-green-600 transition mb-1 truncate">
                            {item.name}
                          </h3>
                        </Link>
                        <div className="flex items-baseline gap-2 mb-1 sm:mb-0">
                          <p className="text-base sm:text-xl font-bold text-green-600">{formatINR(perPackPrice * (item.qty || 1), { maximumFractionDigits: 0 })}</p>
                          <span className="text-xs text-gray-500">({packSize}kg × {item.qty || 1})</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">{formatINR(item.price, { maximumFractionDigits: 0 })}/kg</p>
                        <div className="flex flex-wrap gap-1.5">
                          {PACK_OPTIONS.map((opt) => {
                            const active = Number(opt.value) === Number(packSize);
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => updatePackSize(item._id, opt.value)}
                                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                                  active
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-600'
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
                        {/* Quantity Controls */}
                        <div className="inline-flex items-center gap-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-full shadow px-4 py-1 h-10">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item._id, (item.qty || 1) - 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-300 shadow hover:bg-gray-100 text-green-700 text-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={item.qty <= 1}
                              aria-label="Decrease quantity"
                            >
                              <Minus size={18} />
                            </button>
                            <span className="min-w-[36px] text-center px-2 py-1 rounded-full bg-white text-green-900 font-bold text-base shadow-sm">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item._id, (item.qty || 1) + 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-300 shadow hover:bg-gray-100 text-green-700 text-xl font-bold transition"
                              aria-label="Increase quantity"
                            >
                              <Plus size={18} />
                            </button>
                          </div>
                        
                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemove(item._id, item.name)}
                          className="self-start sm:self-auto text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-lg transition"
                          title="Remove from cart"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        Subtotal: <span className="text-lg font-bold text-gray-900">{formatINR(linePrice, { maximumFractionDigits: 0 })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );})}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartCount} items)</span>
                    <span className="font-semibold">{formatINR(cartTotal, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1">
                      <Truck size={16} className="text-green-600" />
                      Shipping
                    </span>
                    <span className="font-semibold">
                      {shippingPrice === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        formatINR(shippingPrice, { maximumFractionDigits: 0 })
                      )}
                    </span>
                  </div>
                  {/* Removed shipping note; using fixed rule: 50 if < 1000, else free */}
                  <div className="flex justify-between text-gray-600">
                    <span>GST ({gstPercent}%)</span>
                    <span className="font-semibold">{formatINR(taxPrice, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-green-700">
                    <span>Special Discount ({specialDiscountPercent}%)</span>
                    <span className="font-semibold">-{formatINR(specialDiscountAmount, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-green-600">{formatINR(total, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 mb-3"
                >
                  <Lock size={18} />
                  Checkout
                  <ArrowRight size={18} />
                </button>
                
                <Link
                  to="/products"
                  className="block text-center text-green-600 hover:text-green-700 font-semibold text-sm hover:underline"
                >
                  ← Continue Shopping
                </Link>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Lock size={14} className="text-green-600" />
                    <span>Secure Payments</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Truck size={14} className="text-blue-600" />
                    <span>Fast Delivery</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Gift size={14} className="text-orange-600" />
                    <span>Food-grade items: no returns; replacements only for transit damage</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wishlist Section */}
        {wishlist.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-extrabold bg-gradient-to-r from-red-500 via-pink-500 to-red-600 bg-clip-text text-transparent mb-3 flex items-center justify-center gap-3">
                <Heart className="text-red-500" size={36} fill="currentColor" />
                Your Wishlist
              </h2>
              <p className="text-gray-600 text-lg">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {wishlist.map((item) => (
                <div key={item._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group border-2 border-pink-100 hover:border-pink-300">
                  <Link to={`/product/${item._id}`} className="block relative overflow-hidden">
                    <img 
                      src={item.mainImage || item.image || "/placeholder.png"} 
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300" 
                      alt={item.name}
                    />
                    <div className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full shadow-lg">
                      <Heart size={18} fill="currentColor" />
                    </div>
                  </Link>
                  <div className="p-5">
                    <Link to={`/product/${item._id}`}>
                      <h3 className="font-bold text-gray-900 hover:text-pink-600 transition line-clamp-2 mb-3 text-lg">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-2xl font-extrabold text-pink-600 mb-4">{formatINR(item.price, { maximumFractionDigits: 0 })}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMoveToCart(item)}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 text-white py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm font-bold"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item._id)}
                        className="p-3 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-200 border-2 border-red-200 hover:border-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
