
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';
import axios from '../utils/api.js';
import { formatINR } from '../utils/currency';
import { AlertCircle, CreditCard, Wallet, ShoppingBag, MapPin, Plus, Check, ArrowLeft } from 'lucide-react';
import RazorpayPayment from '../components/RazorpayPayment';
import StripePayment from '../components/StripePayment';


export default function EnhancedCheckout() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const { settings } = useSettings();

  // Delete address handler (must be inside component to access state)
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/auth/address/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedAddresses(prev => prev.filter(addr => addr._id !== addressId));
      if (selectedAddressId === addressId) {
        setSelectedAddressId(null);
        setFormData(prev => ({ ...prev, street: '', city: '', state: '', zipCode: '' }));
      }
      toast.success('Address deleted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete address');
    }
  };

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please login to checkout');
      navigate('/login?next=/checkout', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Fetch saved addresses
  React.useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.address && res.data.address.length > 0) {
          setSavedAddresses(res.data.address);
          // Auto-select default address or first address
          const defaultAddr = res.data.address.find(a => a.isDefault) || res.data.address[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr._id);
            setFormData(prev => ({
              ...prev,
              street: defaultAddr.street || '',
              city: defaultAddr.city || '',
              state: defaultAddr.state || '',
              zipCode: defaultAddr.zipCode || ''
            }));
          }
        } else {
          setShowNewAddressForm(true);
        }
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
        // If cannot load, allow adding new address
        setShowNewAddressForm(true);
        if (error.response && error.response.status === 401) {
          toast.error('Session expired. Please login again.');
        }
      }
    };
    fetchAddresses();
  }, [user]);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'Razorpay',
    couponCode: ''
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);
  const [editingFormData, setEditingFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false
  });
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentGateway, setPaymentGateway] = useState(null);

  const gstPercent = Number(settings?.taxPercentage ?? 18);
  const specialDiscountPercent = Number(settings?.specialDiscountPercentage ?? 0);
  const shippingPrice = cartTotal < 1000 ? 50 : 0; // Apply ₹50 if total < 1000, else free
  const taxPrice = (cartTotal - discount) * (gstPercent / 100);
  const specialDiscountAmount = cartTotal * (specialDiscountPercent / 100);
  const finalTotal = cartTotal + shippingPrice + taxPrice - discount - specialDiscountAmount;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddressSelect = (address) => {
    setSelectedAddressId(address._id);
    setFormData(prev => ({
      ...prev,
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || ''
    }));
    setShowNewAddressForm(false);
    setEditingAddressId(null);
  };

  const startEditAddress = (address) => {
    setEditingAddressId(address._id);
    setEditingFormData({
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || '',
      isDefault: !!address.isDefault
    });
  };

  const cancelEditAddress = () => {
    setEditingAddressId(null);
    setIsUpdatingAddress(false);
    setEditingFormData({ street: '', city: '', state: '', zipCode: '', isDefault: false });
  };

  const handleUpdateAddress = async () => {
    if (!editingAddressId) return;
    const { street, city, state, zipCode, isDefault } = editingFormData;
    if (!street || !city || !state || !zipCode) {
      toast.error('Please fill all address fields');
      return;
    }

    try {
      if (isUpdatingAddress) return;
      setIsUpdatingAddress(true);
      const token = localStorage.getItem('token');

      const body = { street, city, state, zipCode, isDefault };

      let res;
      try {
        res = await axios.put(`/api/auth/address/${editingAddressId}`, body, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        if (err.response && err.response.status === 429) {
          await new Promise((r) => setTimeout(r, 1500));
          res = await axios.put(`/api/auth/address/${editingAddressId}`, body, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          throw err;
        }
      }

      setSavedAddresses(res.data.address);
      // If the updated address is currently selected, sync main form
      const updatedAddr = res.data.address.find(a => a._id === editingAddressId);
      if (updatedAddr && selectedAddressId === editingAddressId) {
        setFormData(prev => ({
          ...prev,
          street: updatedAddr.street || '',
          city: updatedAddr.city || '',
          state: updatedAddr.state || '',
          zipCode: updatedAddr.zipCode || ''
        }));
      }
      toast.success('Address updated successfully!');
      cancelEditAddress();
    } catch (error) {
      const msg = error.response?.data?.error || (error.response?.status === 429 ? 'Too many requests, please wait and try again.' : 'Failed to update address');
      toast.error(msg);
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  const handleAddNewAddress = async () => {
    if (!formData.street || !formData.city || !formData.state || !formData.zipCode) {
      toast.error('Please fill all address fields');
      return;
    }

    try {
      if (isSavingAddress) return;
      setIsSavingAddress(true);
      const token = localStorage.getItem('token');
      const newAddress = {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        isDefault: savedAddresses.length === 0
      };

      let res;
      try {
        res = await axios.post('/api/auth/address', newAddress, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        // Handle rate limiting with a single retry after short delay
        if (err.response && err.response.status === 429) {
          await new Promise((r) => setTimeout(r, 1500));
          res = await axios.post('/api/auth/address', newAddress, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          throw err;
        }
      }

      setSavedAddresses(res.data.address);
      setSelectedAddressId(res.data.address[res.data.address.length - 1]._id);
      setShowNewAddressForm(false);
      setSaveAddress(false);
      toast.success('Address saved successfully!');
    } catch (error) {
      const msg = error.response?.data?.error || (error.response?.status === 429 ? 'Too many requests, please wait and try again.' : 'Failed to save address');
      toast.error(msg);
    }
    finally {
      setIsSavingAddress(false);
    }
  };

  const validateCoupon = async () => {
    if (!formData.couponCode) return;

    try {
      const res = await axios.post('/api/coupons/validate', {
        code: formData.couponCode,
        cartTotal
      });

      setDiscount(res.data.discount);
      toast.success(`Coupon applied! You save ${formatINR(res.data.discount, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid coupon');
      setDiscount(0);
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      const payload = {
        items: cart,
        shippingAddress: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        paymentMethod: paymentData.paymentMethod,
        paymentStatus: 'Paid',
        paymentId: paymentData.paymentId,
        razorpayOrderId: paymentData.orderId,
        razorpayPaymentId: paymentData.paymentId,
        razorpaySignature: paymentData.signature,
        stripePaymentIntentId: paymentData.paymentId,
        discountAmount: discount,
        couponCode: formData.couponCode,
      };

      const res = await axios.post('/api/orders', payload);
      clearCart();
      setShowPaymentModal(false);
      toast.success('Order placed successfully!');
      navigate('/order-success', { 
        state: { orderData: res.data.order } 
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create order');
    }
  };

  const handlePaymentFailure = (error) => {
    setShowPaymentModal(false);
    setLoading(false);
    toast.error(error || 'Payment failed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cart.length) {
      toast.error('Cart is empty');
      return;
    }

    if (!user) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }

    // Validate form
    if (!formData.name || !formData.email || !formData.phone || !formData.street || !formData.city) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      // Razorpay Payment
      if (formData.paymentMethod === 'Razorpay') {
        setPaymentGateway('razorpay');
        setShowPaymentModal(true);
      }
      // Stripe Payment
      else if (formData.paymentMethod === 'Stripe') {
        setPaymentGateway('stripe');
        setShowPaymentModal(true);
      }
      else {
        toast.error('Please select a valid payment method');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <AlertCircle className="inline text-green-700 mr-2" />
          Please login to checkout
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-soft py-12 px-4 overflow-x-hidden">
      <div className="max-w-full sm:max-w-4xl mx-auto overflow-x-hidden">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-green-600 text-green-600 rounded-lg font-semibold transition-all duration-300 hover:bg-green-600 hover:text-white shadow-md hover:shadow-lg mb-8"
        >
          <ArrowLeft size={22} />
          Back to Cart
        </button>
        <h1 className="text-3xl font-bold mb-8">Secure Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 overflow-x-hidden">
          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6 overflow-x-hidden">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MapPin className="text-green-600" size={24} />
                  Delivery Address
                </h2>
                {savedAddresses.length > 0 && !showNewAddressForm && (
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(true)}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-green-500 to-green-700 text-white font-bold shadow-md hover:from-green-600 hover:to-green-800 transition-all duration-150 text-sm sm:text-base"
                  >
                    <Plus size={18} className="-ml-1" />
                    Add New Address
                  </button>
                )}
              </div>

              {/* Saved Addresses List */}
              {savedAddresses.length > 0 && !showNewAddressForm && (
                <div className="space-y-3 mb-4">
                  {savedAddresses.map((address) => (
                    <label
                      key={address._id}
                      className={`block p-4 border-2 rounded-lg cursor-pointer transition ${
                        selectedAddressId === address._id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                        <input
                          type="radio"
                          name="savedAddress"
                          checked={selectedAddressId === address._id}
                          onChange={() => handleAddressSelect(address)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-900">{address.street}</p>
                            {address.isDefault && (
                              <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded whitespace-nowrap">Default</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.state} - {address.zipCode}
                          </p>
                          <div className="flex flex-row flex-wrap items-center gap-2 mt-2 sm:mt-0 justify-start sm:justify-end">
                            {selectedAddressId === address._id && (
                              <Check className="text-green-600" size={20} />
                            )}
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); startEditAddress(address); }}
                              className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 transition-all duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                              style={{minWidth:'64px'}}
                            >
                              <svg className="w-3.5 h-3.5 mr-1.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6l11.293-11.293a1 1 0 000-1.414l-4.586-4.586a1 1 0 00-1.414 0L3 15v6z" /></svg>
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); handleDeleteAddress(address._id); }}
                              className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 transition-all duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
                              style={{minWidth:'64px'}}
                            >
                              <svg className="w-3.5 h-3.5 mr-1.5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>

                      {editingAddressId === address._id && (
                        <div className="mt-4 p-4 border-t grid md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={editingFormData.street}
                            onChange={(e) => setEditingFormData({ ...editingFormData, street: e.target.value })}
                            placeholder="Street Address"
                            className="p-3 border rounded-lg md:col-span-2"
                          />
                          <input
                            type="text"
                            value={editingFormData.city}
                            onChange={(e) => setEditingFormData({ ...editingFormData, city: e.target.value })}
                            placeholder="City"
                            className="p-3 border rounded-lg"
                          />
                          <input
                            type="text"
                            value={editingFormData.state}
                            onChange={(e) => setEditingFormData({ ...editingFormData, state: e.target.value })}
                            placeholder="State"
                            className="p-3 border rounded-lg"
                          />
                          <input
                            type="text"
                            value={editingFormData.zipCode}
                            onChange={(e) => setEditingFormData({ ...editingFormData, zipCode: e.target.value })}
                            placeholder="Postal Code"
                            className="p-3 border rounded-lg"
                          />
                          <label className="flex items-center gap-2 md:col-span-2">
                            <input
                              type="checkbox"
                              checked={editingFormData.isDefault}
                              onChange={(e) => setEditingFormData({ ...editingFormData, isDefault: e.target.checked })}
                              className="w-4 h-4"
                            />
                            <span className="text-sm text-gray-700">Set as default</span>
                          </label>
                          <div className="flex gap-3 md:col-span-2 mt-2">
                            <button
                              type="button"
                              onClick={handleUpdateAddress}
                              disabled={isUpdatingAddress}
                              className={`text-sm px-4 py-2 rounded ${isUpdatingAddress ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                            >
                              {isUpdatingAddress ? 'Saving…' : 'Save Changes'}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditAddress}
                              className="text-sm px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              )}

              {/* New Address Form */}
              {(showNewAddressForm || savedAddresses.length === 0) && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm mt-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Add New Address</h3>
                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowNewAddressForm(false)}
                        className="text-xs text-gray-600 hover:text-green-700 font-medium px-3 py-1 rounded transition"
                      >
                        ← Back
                      </button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Full Name"
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white"
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email"
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white"
                      required
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Phone Number (10 digits)"
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white"
                      pattern="[0-9]{10}"
                      minLength="10"
                      maxLength="10"
                      required
                    />
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      placeholder="Postal Code (e.g., 400001)"
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white"
                      pattern="[0-9]{5,6}"
                      minLength="5"
                      maxLength="6"
                      required
                    />
                  </div>

                  <textarea
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="Street Address"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white mt-4"
                    required
                  />

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white"
                      required
                    />
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="State"
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white"
                      required
                    />
                  </div>

                  {showNewAddressForm && (
                    <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                      <label className="flex items-center gap-2 mb-2 sm:mb-0">
                        <input
                          type="checkbox"
                          checked={saveAddress}
                          onChange={(e) => setSaveAddress(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">Save this address for future orders</span>
                      </label>
                      {saveAddress && (
                        <button
                          type="button"
                          onClick={handleAddNewAddress}
                          disabled={isSavingAddress}
                          className={`text-sm px-5 py-2 rounded-lg font-semibold shadow-sm transition-all duration-150 ${isSavingAddress ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                        >
                          {isSavingAddress ? 'Saving...' : 'Save Address'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-5">
                <CreditCard className="text-green-700" size={24} />
                <h2 className="text-xl font-bold text-gray-800">Payment Method</h2>
              </div>
              
              <div className="space-y-3">
                <label className={`relative flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  formData.paymentMethod === 'Razorpay' 
                    ? 'border-green-500 bg-green-50 shadow-md' 
                    : 'border-gray-200 hover:border-green-200 hover:shadow-sm'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Razorpay"
                    checked={formData.paymentMethod === 'Razorpay'}
                    onChange={handleChange}
                    className="mt-1 mr-4 w-5 h-5 text-green-700 focus:ring-green-500"
                  />
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg">
                      <CreditCard className="text-green-700" size={24} />
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-gray-800 text-lg">Razorpay</span>
                      <p className="text-sm text-gray-600 mt-0.5 break-words">UPI, Cards, Wallets & NetBanking</p>
                      <div className="flex gap-2 mt-2">
                        <span className="pill-brand">🇮🇳 India</span>
                        <span className="pill-brand">UPI supported</span>
                      </div>
                    </div>
                  </div>
                  {formData.paymentMethod === 'Razorpay' && (
                    <div className="absolute top-4 right-4">
                      <svg className="w-6 h-6 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </label>

                <label className={`relative flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  formData.paymentMethod === 'Stripe' 
                    ? 'border-green-500 bg-green-50 shadow-md' 
                    : 'border-gray-200 hover:border-green-200 hover:shadow-sm'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Stripe"
                    checked={formData.paymentMethod === 'Stripe'}
                    onChange={handleChange}
                    className="mt-1 mr-4 w-5 h-5 text-green-700 focus:ring-green-500"
                  />
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 bg-gradient-to-br from-green-50 to-lime-100 rounded-lg">
                      <Wallet className="text-green-700" size={24} />
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-gray-800 text-lg">Stripe</span>
                      <p className="text-sm text-gray-600 mt-0.5">Visa, Mastercard, Amex & more</p>
                      <div className="flex gap-2 mt-2">
                        <span className="pill-brand">🌍 Global</span>
                        <span className="pill-brand">Secure</span>
                      </div>
                    </div>
                  </div>
                  {formData.paymentMethod === 'Stripe' && (
                    <div className="absolute top-4 right-4">
                      <svg className="w-6 h-6 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Coupon Code</h2>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  name="couponCode"
                  value={formData.couponCode}
                  onChange={handleChange}
                  placeholder="Enter coupon code"
                  className="w-full p-3 border rounded-lg"
                />
                <button
                  type="button"
                  onClick={validateCoupon}
                  className="w-full sm:w-auto px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Apply
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !cart.length}
              className="w-full bg-brand-gradient text-white py-5 rounded-xl font-bold text-lg hover:opacity-95 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-brand flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={22} />
                  <span>Place Order • {formatINR(finalTotal, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-4">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
              {cart.map((item) => {
                const packSize = Number(item.packSizeKg || 1);
                const perPackPrice = Math.round((Number(item.price) || 0) * packSize);
                const linePrice = perPackPrice * (Number(item.qty) || 1);
                const packLabel = packSize < 1 ? `${Math.round(packSize * 1000)}g` : `${packSize}kg`;
                return (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span>
                      {item.name} ×{item.qty}
                      <span className="text-gray-500"> • {packLabel}</span>
                    </span>
                    <span className="font-semibold">{formatINR(linePrice, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                );
              })}
            </div>

            <div className="border-t space-y-2 text-sm">
              <div className="flex justify-between pt-4">
                <span>Subtotal</span>
                <span>{formatINR(cartTotal, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatINR(discount, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingPrice ? formatINR(shippingPrice, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'FREE'}</span>
              </div>
              <div className="flex justify-between">
                <span>GST ({gstPercent}%)</span>
                <span>{formatINR(taxPrice, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-green-700 font-semibold">
                <span>Special Discount ({specialDiscountPercent}%)</span>
                <span>-{formatINR(specialDiscountAmount, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-4 border-t">
                <span>Total</span>
                <span className="text-green-700">{formatINR(finalTotal, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[9999] animate-fadeIn overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-lg p-4 sm:p-8 relative shadow-2xl transform animate-slideUp max-h-[98vh] overflow-y-auto flex flex-col justify-center">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setLoading(false);
                }}
                className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center gap-3 mb-6">
                {paymentGateway === 'razorpay' ? (
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CreditCard className="text-green-700" size={28} />
                  </div>
                ) : (
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Wallet className="text-green-700" size={28} />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {paymentGateway === 'razorpay' ? 'Razorpay Payment' : 'Secure Card Payment'}
                  </h2>
                  <p className="text-sm text-gray-500">Complete your purchase securely</p>
                </div>
              </div>

              <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Total Amount</span>
                  <span className="font-bold text-3xl bg-brand-gradient bg-clip-text text-transparent">
                    {formatINR(finalTotal, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {paymentGateway === 'razorpay' && (
                <RazorpayPayment
                  amount={finalTotal}
                  onSuccess={handlePaymentSuccess}
                  onFailure={handlePaymentFailure}
                  userData={{
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone
                  }}
                  orderId={`order_${Date.now()}`}
                />
              )}

              {paymentGateway === 'stripe' && (
                <StripePayment
                  amount={finalTotal}
                  onSuccess={handlePaymentSuccess}
                  onFailure={handlePaymentFailure}
                  userData={{
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
