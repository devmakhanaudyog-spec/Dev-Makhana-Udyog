import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart } from 'lucide-react'; // Cart icon

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  
  // Check if current page is cart
  const isCartPage = location.pathname === '/cart';

  const isActive = (paths = []) =>
    paths.some((p) => location.pathname === p || location.pathname.startsWith(`${p}/`));

  const navClass = (paths) =>
    isActive(paths)
      ? 'text-white font-semibold underline underline-offset-8'
      : 'hover:text-gray-100 transition-colors';

  const updateCartCount = useCallback(() => {
    try {
      const storageKey = user ? `cart_${user._id}` : 'cart_guest';
      const cartData = localStorage.getItem(storageKey) || "[]";
      const cart = JSON.parse(cartData);
      const totalItems = Array.isArray(cart) ? cart.reduce((sum, item) => sum + item.qty, 0) : 0;
      setCartCount(totalItems);
    } catch (e) {
      console.error("Error parsing cart:", e);
      setCartCount(0);
    }
  }, [user]);

  useEffect(() => {
    updateCartCount();
    const handleStorage = () => {
      updateCartCount();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [updateCartCount]);

  function goToCart() {
    navigate('/cart');
    setIsOpen(false);
  }

  return (
    <nav className={`w-full h-20 ${isCartPage ? 'sticky' : 'fixed'} top-0 left-0 z-[100] shadow-brand bg-brand-gradient text-white`}>
      <div className='max-w-[1500px] mx-auto flex justify-between items-center h-full px-4'>
        <Link to="/"><h1 className='text-3xl font-bold hover:text-gray-100 transition-colors'>Dev Makhana Udyog</h1></Link>

        {/* Desktop menu */}
        <div className='hidden md:flex items-center space-x-8'>
          <ul className='flex font-semibold space-x-6'>
            <li><Link to="/" className={navClass(['/'])}>Home</Link></li>
            <li><Link to="/products" className={navClass(['/products', '/product'])}>Product</Link></li>
            <li><Link to="/makhana-sample" className={navClass(['/makhana-sample'])}>Order Sample</Link></li>
            <li><Link to="/order-bulk" className={navClass(['/order-bulk'])}>Order In Bulk</Link></li>
            <li><Link to="/blog" className={navClass(['/blog'])}>Blog</Link></li>
            <li><Link to="/contact" className={navClass(['/contact'])}>Contact</Link></li>
            <li><Link to="/about" className={navClass(['/about'])}>About</Link></li>
            {isAuthenticated && (
              <li><Link to="/orders" className={navClass(['/orders'])}>My Orders</Link></li>
            )}
          </ul>
        </div>

        <div className='hidden md:flex items-center gap-3'>
          <button
            onClick={()=> isAuthenticated ? navigate('/profile') : navigate('/login')}
            className='px-3 py-1 rounded font-medium transition-colors text-sm bg-white/90 text-green-700 hover:bg-white'
          >
            {isAuthenticated ? 'Profile' : 'Login'}
          </button>
          <button onClick={goToCart} className='relative ml-2 p-2 bg-white text-green-700 rounded-md hover:bg-gray-100 transition-colors' title="Cart">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-green-600 text-white rounded-full min-w-[20px] h-5 px-1 text-xs font-semibold flex items-center justify-center">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile menu button */}
        <div className='md:hidden'>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-white focus:outline-none"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            <div className="relative w-6 h-6">
              <span
                className={`absolute left-0 top-1 block h-0.5 w-6 bg-white rounded-full transition-all duration-300 ease-in-out ${
                  isOpen ? 'translate-y-2 rotate-45' : ''
                }`}
              />
              <span
                className={`absolute left-0 top-3 block h-0.5 w-6 bg-white rounded-full transition-all duration-300 ease-in-out ${
                  isOpen ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`absolute left-0 top-5 block h-0.5 w-6 bg-white rounded-full transition-all duration-300 ease-in-out ${
                  isOpen ? '-translate-y-2 -rotate-45' : ''
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden w-full absolute top-20 left-0 bg-brand-gradient text-white shadow-lg transition-all duration-300 ease-out ${
          isOpen
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
        }`}
        aria-hidden={!isOpen}
      >
        <div className='flex flex-col space-y-4 p-4'>
          <ul className='flex flex-col items-center space-y-4'>
            <li><Link to="/" onClick={()=>setIsOpen(false)} className={navClass(['/'])}>Home</Link></li>
            <li><Link to="/products" onClick={()=>setIsOpen(false)} className={navClass(['/products', '/product'])}>Product</Link></li>
            <li><Link to="/makhana-sample" onClick={()=>setIsOpen(false)} className={navClass(['/makhana-sample'])}>Order Sample</Link></li>
            <li><Link to="/order-bulk" onClick={()=>setIsOpen(false)} className={navClass(['/order-bulk'])}>Order In Bulk</Link></li>
            <li><Link to="/blog" onClick={()=>setIsOpen(false)} className={navClass(['/blog'])}>Blog</Link></li>
            <li><Link to="/contact" onClick={()=>setIsOpen(false)} className={navClass(['/contact'])}>Contact</Link></li>
            <li><Link to="/about" onClick={()=>setIsOpen(false)} className={navClass(['/about'])}>About</Link></li>
            {isAuthenticated && (
              <li><Link to="/orders" onClick={()=>setIsOpen(false)} className={navClass(['/orders'])}>My Orders</Link></li>
            )}
          </ul>

          <button onClick={()=>{ setIsOpen(false); navigate(isAuthenticated ? '/profile' : '/login'); }} className='w-full py-2 bg-white/90 text-green-700 rounded-md font-medium'>
            {isAuthenticated ? 'Profile' : 'Login'}
          </button>
          <button onClick={()=>{ setIsOpen(false); goToCart(); }} className='w-full py-2 relative bg-white text-green-700 rounded-md hover:bg-gray-100 transition-colors flex items-center justify-center' title="Cart">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="ml-2 bg-green-600 text-white rounded-full min-w-[24px] h-6 px-2 text-xs font-semibold flex items-center justify-center">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
