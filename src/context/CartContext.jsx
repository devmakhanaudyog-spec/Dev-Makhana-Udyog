import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  const migratedOnLoginRef = useRef(false);

  const cartStorageKey = user ? `cart_${user._id}` : 'cart_guest';
  const wishlistStorageKey = user ? `wishlist_${user._id}` : 'wishlist_guest';

  useEffect(() => {
    loadCart();
    loadWishlist();
    // On login, migrate guest cart into user cart once
    if (user && !migratedOnLoginRef.current) {
      try {
        const guestCartRaw = localStorage.getItem('cart_guest') || '[]';
        const guestCart = JSON.parse(guestCartRaw);
        if (Array.isArray(guestCart) && guestCart.length > 0) {
          const currentUserCartRaw = localStorage.getItem(cartStorageKey) || '[]';
          const currentUserCart = JSON.parse(currentUserCartRaw);
          const merged = mergeCarts(currentUserCart, guestCart);
          setCart(merged);
          localStorage.setItem(cartStorageKey, JSON.stringify(merged));
          localStorage.removeItem('cart_guest');
          window.dispatchEvent(new Event('storage'));
        }
        migratedOnLoginRef.current = true;
      } catch (e) {
        console.warn('Cart migration error:', e);
      }
    } else if (!user) {
      migratedOnLoginRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadCart = () => {
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
    try {
      const wishlistData = localStorage.getItem(wishlistStorageKey) || '[]';
      const parsed = JSON.parse(wishlistData);
      setWishlist(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      console.error('Error loading wishlist:', e);
      setWishlist([]);
    }
  };

  const mergeCarts = (baseCart, incomingCart) => {
    const map = new Map();
    const addItem = (it) => {
      const id = it._id || it.id;
      if (!id) return;
      const existing = map.get(id);
      if (existing) {
        const qty = Math.min((existing.qty || 0) + (it.qty || 0), 10);
        map.set(id, { ...existing, qty, packSizeKg: it.packSizeKg || existing.packSizeKg || defaultPackSize });
      } else {
        map.set(id, { ...it, _id: id, id, qty: Math.min(it.qty || 1, 10), packSizeKg: it.packSizeKg || defaultPackSize });
      }
    };
    (Array.isArray(baseCart) ? baseCart : []).forEach(addItem);
    (Array.isArray(incomingCart) ? incomingCart : []).forEach(addItem);
    return Array.from(map.values());
  };

  const addToCart = (product, quantity = 1, packSizeKg = defaultPackSize) => {
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
    const normalizedPack = Number(packSizeKg) || defaultPackSize;
    const newCart = cart.map(item =>
      (item._id || item.id) === productId ? { ...item, packSizeKg: normalizedPack } : item
    );
    setCart(newCart);
    localStorage.setItem(cartStorageKey, JSON.stringify(newCart));
    window.dispatchEvent(new Event('storage'));
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => (item._id || item.id) !== productId);
    setCart(newCart);
    localStorage.setItem(cartStorageKey, JSON.stringify(newCart));
    window.dispatchEvent(new Event('storage'));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem(cartStorageKey);
    window.dispatchEvent(new Event('storage'));
  };

  const addToWishlist = (product) => {
    const productId = product._id || product.id;
    if (wishlist.find(item => (item._id || item.id) === productId)) {
      return;
    }
    const newWishlist = [...wishlist, { ...product, _id: productId }];
    setWishlist(newWishlist);
    localStorage.setItem(wishlistStorageKey, JSON.stringify(newWishlist));
  };

  const removeFromWishlist = (productId) => {
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
