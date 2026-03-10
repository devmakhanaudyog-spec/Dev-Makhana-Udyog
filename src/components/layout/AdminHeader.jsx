import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Settings, User } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function AdminHeader({ sidebarOpen, setSidebarOpen }) {
  const nav = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  React.useEffect(() => {
    // Get current admin user info
    const fetchAdminInfo = async () => {
      try {
        const res = await axios.get('/api/auth/me');
        setAdminUser(res.data);
      } catch (error) {
        console.error('Failed to fetch admin info:', error);
      }
    };
    fetchAdminInfo();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
    nav('/admin-login', { replace: true });
  };

  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left: Logo + Sidebar Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-700 rounded-lg transition"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="text-2xl font-bold text-green-400">Admin Portal</div>
        </div>

        {/* Right: User Menu */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center font-bold">
              {adminUser?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="font-semibold text-sm">{adminUser?.name || 'Admin'}</p>
              <p className="text-xs text-slate-400">{adminUser?.email || 'admin@example.com'}</p>
            </div>
          </div>

          {/* User Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-2 hover:bg-slate-700 rounded-lg transition"
              title="User menu"
            >
              <User size={20} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-50">
                <div className="p-4 border-b border-slate-700">
                  <p className="font-semibold text-sm">{adminUser?.name || 'Admin'}</p>
                  <p className="text-xs text-slate-400">{adminUser?.email || 'admin@example.com'}</p>
                </div>
                <button
                  onClick={() => {
                    document.getElementById('settings-scroll')?.scrollIntoView({ behavior: 'smooth' });
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition text-sm"
                >
                  <Settings size={18} />
                  <span>Admin Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-900/50 transition text-sm text-red-400"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
