import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, MessageSquare, ShoppingCart, Package, Gift, Truck, Star,
  Users, Mail, FileText, Settings, BarChart3, LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar({ activeTab, setActiveTab, sidebarOpen }) {
  const nav = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    nav('/admin-login', { replace: true });
  };
  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: TrendingUp, section: 'main' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, section: 'sales' },
    { id: 'bulkOrders', label: 'Bulk Orders', icon: Truck, section: 'sales' },
    { id: 'freeSamples', label: 'Free Samples', icon: Gift, section: 'sales' },
    { id: 'products', label: 'Products', icon: Package, section: 'catalog' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, section: 'communication' },
    { id: 'newsletter', label: 'Newsletter', icon: Mail, section: 'communication' },
    { id: 'users', label: 'Users', icon: Users, section: 'people' },
    { id: 'reviews', label: 'Reviews', icon: Star, section: 'people' },
    { id: 'coupons', label: 'Coupons', icon: FileText, section: 'marketing' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, section: 'reports' },
    { id: 'settings', label: 'Settings', icon: Settings, section: 'system' }
  ];

  const sections = {
    main: 'Main',
    sales: 'Sales & Orders',
    catalog: 'Catalog',
    communication: 'Communication',
    people: 'People',
    marketing: 'Marketing',
    reports: 'Reports & Analytics',
    system: 'System'
  };

  const groupedItems = {};
  menuItems.forEach(item => {
    if (!groupedItems[item.section]) {
      groupedItems[item.section] = [];
    }
    groupedItems[item.section].push(item);
  });

  return (
    <aside className={`${
      sidebarOpen ? 'w-64' : 'w-20'
    } bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 h-screen fixed overflow-y-auto z-40 border-r border-slate-700 flex flex-col`}>
      
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-700 sticky top-0 bg-slate-900 flex-shrink-0">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center font-bold text-sm">
              A
            </div>
            <div>
              <p className="text-sm font-semibold">Admin</p>
              <p className="text-xs text-slate-400">Control Panel</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-6 flex-1 overflow-y-auto">
        {Object.entries(groupedItems).map(([sectionKey, items]) => (
          <div key={sectionKey}>
            {sidebarOpen && (
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
                {sections[sectionKey]}
              </p>
            )}
            <div className="space-y-1">
              {items.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition duration-200 ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                    title={!sidebarOpen ? item.label : ''}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {activeTab === item.id && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-700 bg-slate-900 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition duration-200 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          title={!sidebarOpen ? 'Logout' : ''}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {sidebarOpen && <span className="flex-1 text-left">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
