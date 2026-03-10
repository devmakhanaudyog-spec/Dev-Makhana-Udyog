import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/api.js';
import AdminHeader from '../components/layout/AdminHeader';
import AdminSidebar from '../components/layout/AdminSidebar';
import toast from 'react-hot-toast';

// Import all tab components
import OverviewTab from '../components/admin-tabs/OverviewTab';
import OrdersTab from '../components/admin-tabs/OrdersTab';
import ProductsTab from '../components/admin-tabs/ProductsTab';
import MessagesTab from '../components/admin-tabs/MessagesTab';
import UsersTab from '../components/admin-tabs/UsersTab';
import SettingsTab from '../components/admin-tabs/SettingsTab';
import BulkOrdersTab from '../components/admin-tabs/BulkOrdersTab';
import FreeSamplesTab from '../components/admin-tabs/FreeSamplesTab';
import ReviewsTab from '../components/admin-tabs/ReviewsTab';
import NewsletterTab from '../components/admin-tabs/NewsletterTab';
import CouponsTab from '../components/admin-tabs/CouponsTab';
import AnalyticsTab from '../components/admin-tabs/AnalyticsTab';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const nav = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // All dashboard data
  const [overview, setOverview] = useState(null);
  const [messages, setMessages] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [freeSamples, setFreeSamples] = useState([]);
  const [bulkOrders, setBulkOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      const [
        overviewRes,
        messagesRes,
        subRes,
        ordersRes,
        usersRes,
        settingsRes,
        couponsRes,
        samplesRes,
        bulkRes,
        reviewsRes,
        productsRes
      ] = await Promise.all([
        axios.get('/api/admin/dashboard/overview').catch(() => ({ data: {} })),
        axios.get('/api/admin/messages').catch(() => ({ data: { messages: [] } })),
        axios.get('/api/admin/newsletter-subscribers').catch(() => ({ data: { subscribers: [] } })),
        axios.get('/api/admin/orders').catch(() => ({ data: { orders: [] } })),
        axios.get('/api/admin/users').catch(() => ({ data: { users: [] } })),
        axios.get('/api/admin/settings').catch(() => ({ data: {} })),
        axios.get('/api/admin/coupons').catch(() => ({ data: [] })),
        axios.get('/api/admin/free-samples').catch(() => ({ data: { samples: [] } })),
        axios.get('/api/admin/bulk-orders').catch(() => ({ data: { bulkOrders: [] } })),
        axios.get('/api/admin/reviews').catch(() => ({ data: { reviews: [] } })),
        axios.get('/api/admin/products').catch(() => ({ data: [] }))
      ]);

      setOverview(overviewRes.data || {});
      setMessages(messagesRes.data.messages || []);
      setSubscribers(subRes.data.subscribers || []);
      setOrders(ordersRes.data.orders || []);
      setUsers(usersRes.data.users || []);
      setSettings(settingsRes.data || {});
      setCoupons(couponsRes.data || []);
      setFreeSamples(samplesRes.data.samples || []);
      setBulkOrders(bulkRes.data.bulkOrders || []);
      setReviews(reviewsRes.data.reviews || []);
      setProducts(productsRes.data || []);
    } catch (error) {
      console.error('Data load error:', error);
      // Don't show error toast - just continue with empty data
    }
  }, []);

  // Initial verification and data load - runs only once on mount
  useEffect(() => {
    let isMounted = true;

    const initializeAdmin = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        nav('/admin-login', { replace: true });
        return;
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      try {
        const res = await axios.get('/api/auth/me');
        if (!isMounted) return;
        
        if (res.data.role !== 'admin') {
          toast.error('Unauthorized: Admin access required');
          nav('/login', { replace: true });
          return;
        }
        
        await loadDashboardData();
        if (isMounted) setLoading(false);
      } catch (error) {
        if (!isMounted) return;
        console.error('Auth error:', error);
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          toast.error('Session expired. Please login again.');
          nav('/admin-login', { replace: true });
        } else {
          toast.error('Could not verify admin session. Please retry.');
        }
        setLoading(false);
      }
    };

    initializeAdmin();

    // Auto-logout on 401 responses to avoid half-broken state
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status;
        if (status === 401 && isMounted) {
          toast.error('Session expired. Please login again.');
          logout();
          nav('/admin-login', { replace: true });
        }
        return Promise.reject(error);
      }
    );

    return () => {
      isMounted = false;
      axios.interceptors.response.eject(interceptorId);
    };
  }, [loadDashboardData, logout, nav]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold">Loading Admin Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} sidebarOpen={sidebarOpen} />

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} flex-1 transition-all duration-300 flex flex-col`}>
        {/* Admin Header */}
        <AdminHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="p-6 max-w-[1800px] mx-auto">
            {/* Breadcrumb */}
            <div className="text-sm text-slate-600 mb-6">
              Admin Portal / <span className="font-semibold text-slate-900">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && <OverviewTab overview={overview} />}
            {activeTab === 'orders' && <OrdersTab orders={orders} loadData={loadDashboardData} />}
            {activeTab === 'bulkOrders' && <BulkOrdersTab bulkOrders={bulkOrders} loadData={loadDashboardData} />}
            {activeTab === 'freeSamples' && <FreeSamplesTab freeSamples={freeSamples} loadData={loadDashboardData} />}
            {activeTab === 'products' && <ProductsTab products={products} loadData={loadDashboardData} />}
            {activeTab === 'messages' && <MessagesTab messages={messages} loadData={loadDashboardData} />}
            {activeTab === 'newsletter' && <NewsletterTab subscribers={subscribers} />}
            {activeTab === 'users' && <UsersTab users={users} />}
            {activeTab === 'reviews' && <ReviewsTab reviews={reviews} loadData={loadDashboardData} />}
            {activeTab === 'coupons' && <CouponsTab coupons={coupons} loadData={loadDashboardData} />}
            {activeTab === 'analytics' && <AnalyticsTab overview={overview} orders={orders} />}
            {activeTab === 'settings' && (
              <SettingsTab
                settings={settings}
                updateSettings={async (data) => {
                  try {
                    const res = await axios.put('/api/admin/settings', data);
                    setSettings(res.data || data);
                    toast.success('Settings updated');
                  } catch (err) {
                    console.error('Update settings error:', err);
                    toast.error('Failed to update settings');
                  }
                }}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
