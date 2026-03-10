import ImageUploadField from '../ImageUploadField';
import React, { useState } from 'react';
import { Save, Lock, Eye, EyeOff, Settings, Shield, Building, DollarSign, CreditCard, Mail, Globe, CheckCircle, XCircle } from 'lucide-react';
import axios from '../../utils/api.js';
import toast from 'react-hot-toast';

export default function SettingsTab({ settings, updateSettings }) {
  const [activeTab, setActiveTab] = useState('general');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [formData, setFormData] = useState({
    companyName: 'Makhaantraa Foods',
    heroImage: settings?.heroImage || '',
    companyEmail: settings?.companyEmail || 'info@makhaantraa.com',
    companyPhone: settings?.companyPhone || '+91-XXXXXXXXXX',
    whatsappNumber: settings?.whatsappNumber || '+91-XXXXXXXXXX',
    businessAddress: '123 Business St, City, State, PIN',
    maintenanceMode: settings?.maintenanceMode || false,
    maintenanceMessage: settings?.maintenanceMessage || '',
    shippingCost: settings?.shippingCost ?? 50,
    taxPercentage: settings?.taxPercentage ?? 18,
    specialDiscountPercentage: settings?.specialDiscountPercentage ?? 0,
    paymentGateway: 'razorpay',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    currencyCode: 'INR'
  });

  // Sync incoming settings to the form when settings change
  React.useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      companyEmail: settings?.companyEmail || 'info@makhaantraa.com',
      companyPhone: settings?.companyPhone || '+91-XXXXXXXXXX',
      whatsappNumber: settings?.whatsappNumber || '+91-XXXXXXXXXX',
      maintenanceMode: settings?.maintenanceMode || false,
      maintenanceMessage: settings?.maintenanceMessage || '',
      shippingCost: settings?.shippingCost ?? 50,
      taxPercentage: settings?.taxPercentage ?? 18,
      specialDiscountPercentage: settings?.specialDiscountPercentage ?? 0,
      currencyCode: settings?.currencyCode || 'INR',
      heroImage: settings?.heroImage || ''
    }));
  }, [settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleHeroImageChange = (url) => {
    setFormData(prev => ({ ...prev, heroImage: url }));
  };

  const handleSubmit = () => {
    const validFields = [
      'companyEmail',
      'companyPhone',
      'whatsappNumber',
      'maintenanceMode',
      'maintenanceMessage',
      'shippingCost',
      'taxPercentage',
      'specialDiscountPercentage',
      'currencyCode',
      'heroImage'
    ];
    const payload = {};
    validFields.forEach((key) => {
      if (formData[key] !== undefined) payload[key] = formData[key];
    });
    updateSettings(payload);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await axios.post('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (res.data.success) {
        toast.success('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to change password';
      toast.error(errorMsg);
      console.error('Change password error:', error);
    } finally {
      setPasswordLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Password & Security', icon: Shield },
    { id: 'company', label: 'Company Info', icon: Building },
    { id: 'shipping', label: 'Shipping & Tax', icon: DollarSign },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'site', label: 'Site Status', icon: Globe }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Admin Settings</h1>
        <p className="text-slate-300">Manage your system configuration and preferences</p>
      </div>

      {/* Tabbed Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">General Settings</h2>
                <p className="text-slate-600 mb-6">Configure basic system settings and homepage content</p>
              </div>

              {/* Hero Image Upload */}
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Homepage Hero Image</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Hero Section Main Image</label>
                    <ImageUploadField
                      value={formData.heroImage}
                      onChange={handleHeroImageChange}
                      label="Hero Image"
                      name="heroImage"
                    />
                    <p className="text-xs text-slate-500 mt-2">Recommended size: 1920x1080px. This image will be displayed in the homepage hero section.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition"
                >
                  <Save size={20} /> Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Password & Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Password & Security</h2>
                <p className="text-slate-600 mb-6">Change your admin password and manage security settings</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 mb-6">
                <div className="flex items-start gap-3">
                  <Shield className="text-blue-600 mt-1" size={24} />
                  <div>
                    <h3 className="font-bold text-blue-900 mb-2">Security Best Practices</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Use a strong password with at least 6 characters</li>
                      <li>• Include a mix of uppercase, lowercase, numbers, and special characters</li>
                      <li>• Don't reuse passwords from other accounts</li>
                      <li>• Change your password regularly</li>
                    </ul>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Change Password</h3>
                <div className="space-y-4 max-w-xl">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Current Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
                        disabled={passwordLoading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      >
                        {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
                        disabled={passwordLoading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      >
                        {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Must be at least 6 characters</p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
                        disabled={passwordLoading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      >
                        {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Password Match Indicator */}
                  {passwordData.newPassword && passwordData.confirmPassword && (
                    <div className={`flex items-center gap-2 text-sm ${
                      passwordData.newPassword === passwordData.confirmPassword
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {passwordData.newPassword === passwordData.confirmPassword ? (
                        <>
                          <CheckCircle size={16} />
                          <span>Passwords match</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} />
                          <span>Passwords do not match</span>
                        </>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Lock size={20} />
                    {passwordLoading ? 'Changing Password...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Company Information Tab */}
          {activeTab === 'company' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Company Information</h2>
                <p className="text-slate-600 mb-6">Manage your company details and contact information</p>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Company Name</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="companyEmail"
                      value={formData.companyEmail}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                    <input
                      type="text"
                      name="companyPhone"
                      value={formData.companyPhone}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">WhatsApp Contact Number</label>
                    <input
                      type="text"
                      name="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={handleChange}
                      placeholder="e.g., +91XXXXXXXXXX"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Business Address</label>
                    <textarea
                      name="businessAddress"
                      value={formData.businessAddress}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition"
              >
                <Save size={20} /> Save Changes
              </button>
            </div>
          )}

          {/* Shipping & Tax Tab */}
          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Shipping & Tax Configuration</h2>
                <p className="text-slate-600 mb-6">Set shipping costs, tax rates, and special discounts</p>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Shipping Cost (₹)</label>
                    <input
                      type="number"
                      name="shippingCost"
                      value={formData.shippingCost}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tax Percentage (%)</label>
                    <input
                      type="number"
                      name="taxPercentage"
                      value={formData.taxPercentage}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Special Discount (%)</label>
                    <input
                      type="number"
                      name="specialDiscountPercentage"
                      value={formData.specialDiscountPercentage}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-slate-500 mt-2">Applied as a discount on checkout summary (use to offset GST if needed).</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Currency Code</label>
                    <input
                      type="text"
                      name="currencyCode"
                      value={formData.currencyCode}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition"
              >
                <Save size={20} /> Save Changes
              </button>
            </div>
          )}

          {/* Payment Gateway Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Payment Gateway Configuration</h2>
                <p className="text-slate-600 mb-6">Configure payment processing options</p>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Primary Gateway</label>
                    <select
                      name="paymentGateway"
                      value={formData.paymentGateway}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="razorpay">Razorpay</option>
                      <option value="stripe">Stripe</option>
                      <option value="cod">Cash on Delivery</option>
                    </select>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      ℹ️ Configure payment gateway credentials in environment variables for production use.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition"
              >
                <Save size={20} /> Save Changes
              </button>
            </div>
          )}

          {/* Email Configuration Tab */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Email Configuration</h2>
                <p className="text-slate-600 mb-6">Configure SMTP settings for sending emails</p>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">SMTP Host</label>
                    <input
                      type="text"
                      name="smtpHost"
                      value={formData.smtpHost}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">SMTP Port</label>
                    <input
                      type="number"
                      name="smtpPort"
                      value={formData.smtpPort}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-900">
                      ⚠️ SMTP credentials should be configured via environment variables. Contact system administrator for email setup.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition"
              >
                <Save size={20} /> Save Changes
              </button>
            </div>
          )}

          {/* Site Status Tab */}
          {activeTab === 'site' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Site Status & Maintenance</h2>
                <p className="text-slate-600 mb-6">Control site availability and maintenance mode</p>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="space-y-4 max-w-xl">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <label className="text-sm font-semibold text-slate-900">Maintenance Mode</label>
                      <p className="text-xs text-slate-600 mt-1">Enable to temporarily disable site access</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="maintenanceMode"
                        checked={!!formData.maintenanceMode}
                        onChange={(e) => setFormData(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Maintenance Message</label>
                    <textarea
                      name="maintenanceMessage"
                      value={formData.maintenanceMessage}
                      onChange={handleChange}
                      rows="3"
                      placeholder="We're performing upgrades. The site will be back shortly."
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-slate-500 mt-2">This message will be displayed to visitors during maintenance.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition"
              >
                <Save size={20} /> Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
