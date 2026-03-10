// src/App.js
import './App.css';
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClientProvider, QueryClient } from 'react-query';

// Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';

// Components
import Navbar from './components/layout/navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import ToastNotification from './components/Toast';

// Lazy load components
const Footer = lazy(() => import('./components/layout/footer'));
const Hero = lazy(() => import('./components/hero'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const CartPage = lazy(() => import('./pages/CartPage'));
const EnhancedCheckout = lazy(() => import('./pages/EnhancedCheckout'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Makhana = lazy(() => import('./pages/Makhana'));
const OrderBulk = lazy(() => import('./pages/OrderBulk'));
const Blog = lazy(() => import('./pages/blog/BlogIndex'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const HealthBenefitsOfMakhana = lazy(() => import('./pages/blog/HealthBenefitsOfMakhana'));
const MakhanaRecipes = lazy(() => import('./pages/blog/MakhanaRecipes'));
const WhatIsMakhana = lazy(() => import('./pages/blog/WhatIsMakhana'));
const MakhanaForWeightLoss = lazy(() => import('./pages/blog/MakhanaForWeightLoss'));
const GIMitilaaMakhana = lazy(() => import('./pages/blog/GIMitilaaMakhana'));
const CleanLabelMakhana = lazy(() => import('./pages/blog/CleanLabelMakhana'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboardNew'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Profile = lazy(() => import('./pages/Profile'));
const Orders = lazy(() => import('./pages/Orders'));

// Skeleton component
const Skeleton = ({ height = '20px', width = '100%', className = '' }) => (
  <div
    className={`bg-gray-300 animate-pulse ${className}`}
    style={{ height, width, borderRadius: '4px' }}
  ></div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

const MaintenancePage = ({ message }) => (
  <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100 flex items-center justify-center px-4">
    <div className="max-w-xl w-full bg-white border border-amber-200 shadow-lg rounded-2xl p-8 text-center space-y-4">
      <div className="mx-auto w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-2xl font-bold">⚠️</div>
      <h1 className="text-3xl font-bold text-amber-900">Site Under Maintenance</h1>
      <p className="text-amber-800 leading-relaxed">{message || 'We are performing scheduled maintenance. Please check back soon.'}</p>
      <p className="text-sm text-amber-700">Admin portal remains accessible during maintenance.</p>
    </div>
  </div>
);

function AppLayout() {
  const location = useLocation();
  const path = location.pathname;
  const isAdminDashboard = path.startsWith('/admin/dashboard') || path.startsWith('/admin/products');
  const isAdminLogin = path === '/admin-login';
  const isCheckoutPage = path === '/checkout';
  const hideHeaderFooter = isAdminDashboard || isAdminLogin || isCheckoutPage;
  const isCartPage = path === '/cart';
  const { settings } = useSettings();
  const showMaintenance = settings?.maintenanceMode && !hideHeaderFooter;

  if (showMaintenance) {
    return <MaintenancePage message={settings?.maintenanceMessage} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeaderFooter && (
        <nav>
          <Navbar />
        </nav>
      )}

      {showMaintenance && (
        <div className="bg-amber-100 text-amber-900 border-b border-amber-200 py-3 px-4 text-sm text-center">
          {settings?.maintenanceMessage || 'We are performing scheduled maintenance.'}
        </div>
      )}

      <main className={`flex-grow ${!hideHeaderFooter && !isCartPage ? 'pt-20' : ''}`}>
        <Routes>
          <Route
            path="/"
            element={
              <Suspense fallback={<Skeleton height="400px" />}>
                <Hero />
              </Suspense>
            }
          />
          <Route
            path="/login"
            element={
              <Suspense fallback={<Skeleton height="300px" />}>
                <Login />
              </Suspense>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <Suspense fallback={<Skeleton height="300px" />}>
                <ForgotPassword />
              </Suspense>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <Suspense fallback={<Skeleton height="300px" />}>
                <ResetPassword />
              </Suspense>
            }
          />
          <Route
            path="/admin-login"
            element={
              <Suspense fallback={<Skeleton height="400px" />}>
                <AdminLogin />
              </Suspense>
            }
          />
          <Route
            path="/products"
            element={
              <Suspense fallback={<Skeleton height="400px" />}>
                <Products />
              </Suspense>
            }
          />
          <Route
            path="/product/:id"
            element={
              <Suspense fallback={<Skeleton height="400px" />}>
                <ProductDetail />
              </Suspense>
            }
          />
          <Route
            path="/cart"
            element={
              <Suspense fallback={<Skeleton height="300px" />}>
                <CartPage />
              </Suspense>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Suspense fallback={<Skeleton height="300px" />}>
                  <EnhancedCheckout />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <Suspense fallback={<Skeleton height="300px" />}>
                <About />
              </Suspense>
            }
          />
          <Route
            path="/contact"
            element={
              <Suspense fallback={<Skeleton height="300px" />}>
                <Contact />
              </Suspense>
            }
          />
          <Route
            path="/blog"
            element={
              <Suspense fallback={<Skeleton height="300px" />}>
                <Blog />
              </Suspense>
            }
          />
          <Route
            path="/blog/health-benefits-of-makhana"
            element={
              <Suspense fallback={<Skeleton height="300px" />}>
                <HealthBenefitsOfMakhana />
              </Suspense>
            }
          />
          <Route
            path="/blog/makhana-recipes"
            element={
              <Suspense fallback={<Skeleton height="300px" />}>
                <MakhanaRecipes />
              </Suspense>
            }
          />
          <Route
            path="/blog/what-is-makhana"
            element={
              <Suspense fallback={<Skeleton height="300px" />}>
                <WhatIsMakhana />
              </Suspense>
            }
          />
          <Route
            path="/blog/makhana-for-weight-loss"
            element={
              <Suspense fallback={<Skeleton height="300px" />}>
                <MakhanaForWeightLoss />
              </Suspense>
            }
          />
          <Route
            path="/blog/why-gi-mithila-makhana"
            element={
              <Suspense fallback={<Skeleton height="300px" />}>
                <GIMitilaaMakhana />
              </Suspense>
            }
          />
          <Route
            path="/blog/healthy-snacking"
            element={
              <Suspense fallback={<Skeleton height="300px" />}>
                <CleanLabelMakhana />
              </Suspense>
            }
          />
          <Route
            path="/blog/:slug"
            element={
              <Suspense fallback={<Skeleton height="300px" />}>
                <BlogPost />
              </Suspense>
            }
          />
          <Route
            path="/makhana-sample"
            element={
              <Suspense fallback={<Skeleton height="300px" />}>
                <Makhana />
              </Suspense>
            }
          />
          <Route
            path="/order-bulk"
            element={
              <Suspense fallback={<Skeleton height="300px" />}>
                <OrderBulk />
              </Suspense>
            }
          />
          <Route
            path="/track-order"
            element={
              <Suspense fallback={<Skeleton height="300px" />}>
                <OrderTracking />
              </Suspense>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Suspense fallback={<Skeleton height="300px" />}>
                  <Orders />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-success"
            element={
              <ProtectedRoute>
                <Suspense fallback={<Skeleton height="300px" />}>
                  <OrderSuccess />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Suspense fallback={<Skeleton height="300px" />}>
                  <Profile />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute adminOnly>
                <Suspense fallback={<Skeleton height="300px" />}>
                  <AdminProducts />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute adminOnly>
                <Suspense fallback={<Skeleton height="300px" />}>
                  <AdminDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {!hideHeaderFooter && (
        <Suspense fallback={<Skeleton height="200px" />}>
          <footer>
            <Footer />
          </footer>
        </Suspense>
      )}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <SettingsProvider>
              <CartProvider>
                <ThemeProvider>
                  <BrowserRouter>
                    <ToastNotification />
                    <AppLayout />
                  </BrowserRouter>
                </ThemeProvider>
              </CartProvider>
            </SettingsProvider>
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
