import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const defaultPackSize = 1; // in kg
  const cartStorageKey = user ? `cart_${user._id}` : null;
  const wishlistStorageKey = user ? `wishlist_${user._id}` : null;

  useEffect(() => {
    if (!user) {
      setCart([]);
      setWishlist([]);
      return;
    }
    loadCart();
    loadWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadCart = () => {
    if (!cartStorageKey) {
      setCart([]);
      return;
    }
    try {
      const cartData = localStorage.getItem(cartStorageKey) || '[]';
      const parsed = JSON.parse(cartData);
      const normalized = Array.isArray(parsed)
        ? parsed.map((item) => ({ ...item, packSizeKg: item.packSizeKg || defaultPackSize }))
        : [];
      setCart(normalized);
    } catch (e) {
      console.error('Error loading cart:', e);
      setCart([]);
    }
  };

  const loadWishlist = () => {
    if (!wishlistStorageKey) {
      setWishlist([]);
      return;
    }
    try {
      const wishlistData = localStorage.getItem(wishlistStorageKey) || '[]';
      const parsed = JSON.parse(wishlistData);
      setWishlist(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      console.error('Error loading wishlist:', e);
      setWishlist([]);
    }
  };

  const addToCart = (product, quantity = 1, packSizeKg = defaultPackSize) => {
    if (!user || !cartStorageKey) return;
    // Use _id if available (database products), otherwise use id (static products like makhana)
    const productId = product._id || product.id;
    const existing = cart.find(item => (item._id || item.id) === productId);
    let newCart;

    if (existing) {
      // Product already exists, update quantity only
      const newQty = Math.min(existing.qty + quantity, 10);
      newCart = cart.map(item =>
        (item._id || item.id) === productId ? { ...item, qty: newQty, packSizeKg: item.packSizeKg || packSizeKg || defaultPackSize } : item
      );
    } else {
      // New product, add to cart with unique identifier
      newCart = [...cart, { ...product, _id: productId, id: productId, qty: quantity, packSizeKg: packSizeKg || defaultPackSize }];
    }

    setCart(newCart);
    localStorage.setItem(cartStorageKey, JSON.stringify(newCart));
    window.dispatchEvent(new Event('storage'));
  };

  const updateQuantity = (productId, quantity) => {
    if (!user || !cartStorageKey) return;
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const newCart = cart.map(item =>
      (item._id || item.id) === productId ? { ...item, qty: Math.min(quantity, 10) } : item
    );
    setCart(newCart);
    localStorage.setItem(cartStorageKey, JSON.stringify(newCart));
    window.dispatchEvent(new Event('storage'));
  };

  const updatePackSize = (productId, packSizeKg) => {
    if (!user || !cartStorageKey) return;
    const normalizedPack = Number(packSizeKg) || defaultPackSize;
    const newCart = cart.map(item =>
      (item._id || item.id) === productId ? { ...item, packSizeKg: normalizedPack } : item
    );
    setCart(newCart);
    localStorage.setItem(cartStorageKey, JSON.stringify(newCart));
    window.dispatchEvent(new Event('storage'));
  };

  const removeFromCart = (productId) => {
    if (!user || !cartStorageKey) return;
    const newCart = cart.filter(item => (item._id || item.id) !== productId);
    setCart(newCart);
    localStorage.setItem(cartStorageKey, JSON.stringify(newCart));
    window.dispatchEvent(new Event('storage'));
  };

  const clearCart = () => {
    if (!user || !cartStorageKey) return;
    setCart([]);
    localStorage.removeItem(cartStorageKey);
    window.dispatchEvent(new Event('storage'));
  };

  const addToWishlist = (product) => {
    if (!user || !wishlistStorageKey) return;
    const productId = product._id || product.id;
    if (wishlist.find(item => (item._id || item.id) === productId)) {
      return;
    }
    const newWishlist = [...wishlist, { ...product, _id: productId }];
    setWishlist(newWishlist);
    localStorage.setItem(wishlistStorageKey, JSON.stringify(newWishlist));
  };

  const removeFromWishlist = (productId) => {
    if (!user || !wishlistStorageKey) return;
    const newWishlist = wishlist.filter(item => (item._id || item.id) !== productId);
    setWishlist(newWishlist);
    localStorage.setItem(wishlistStorageKey, JSON.stringify(newWishlist));
  };

  const moveToCart = (product) => {
    addToCart(product, 1);
    const productId = product._id || product.id;
    removeFromWishlist(productId);
  };

  const isInCart = (productId) => {
    return cart.some(item => (item._id || item.id) === productId);
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => (item._id || item.id) === productId);
  };

  const cartTotal = cart.reduce((sum, item) => {
    const pricePerKg = parseFloat(item.price) || 0;
    const qty = parseInt(item.qty) || 0;
    const packSize = parseFloat(item.packSizeKg || defaultPackSize) || defaultPackSize;
    const perPackPrice = Math.round(pricePerKg * packSize);
    return sum + (perPackPrice * qty);
  }, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const value = {
    cart,
    wishlist,
    addToCart,
    updateQuantity,
    removeFromCart,
    updatePackSize,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    moveToCart,
    isInCart,
    isInWishlist,
    cartTotal,
    cartCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
