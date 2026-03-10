import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../utils/api';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { login, user, logout, isAuthenticated, setUser } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to profile page quickly
  useEffect(() => {
    if (!isAuthenticated) return;
    if (user?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else {
      navigate('/profile', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Calculate password strength
  const calculatePasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }

    // Calculate password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const email = formData.email.trim().toLowerCase();
    const password = formData.password.trim();
    const name = formData.name.trim();

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!name) {
        newErrors.name = 'Full name is required';
      } else if (name.length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.confirmPassword !== password) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const email = formData.email.trim().toLowerCase();
    const password = formData.password.trim();
    const name = formData.name.trim();
    const phone = formData.phone.trim();

    setLoading(true);

    try {
      if (isLogin) {
        // Traditional login
        const result = await login(email, password);
        
        if (result.success) {
          // Block admins from user login flow
          if (result.user?.role === 'admin') {
            toast.error('Admins must sign in via the Admin Portal.');
            logout();
            navigate('/admin-login', { replace: true });
            return;
          }
          toast.success('Login successful!');
          navigate('/profile', { replace: true });
        } else {
          toast.error(result.error);
        }
      } else {
        // New signup - direct account creation
        const res = await axios.post('/api/auth/register', {
          name,
          email,
          password,
          phone: phone || ''
        });

        const loginResult = await login(email, password);
        if (loginResult.success) {
          toast.success(res.data?.message || 'Account created successfully!');
          navigate('/profile', { replace: true });
        } else {
          toast.success(res.data?.message || 'Account created successfully! Please login to continue.');
          setIsLogin(true);
          setFormData({
            name: '',
            email,
            password: '',
            confirmPassword: '',
            phone: ''
          });
          setPasswordStrength(0);
        }
      }
    } catch (error) {
      const errorData = error.response?.data || {};

      let errorMsg = errorData.error || 'An error occurred. Please try again.';

      if (errorData.code === 'DB_UNAVAILABLE') {
        errorMsg = 'Signup is temporarily unavailable. Please try again shortly.';
      }

      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Login
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/google-login', {
        googleToken: credentialResponse.credential
      });

      if (res.data && res.data.token) {
        // Store token
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        // Update auth context
        setUser(res.data);
        
        toast.success('Login successful with Google!');
        navigate('/profile', { replace: true });
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error(error.response?.data?.error || 'Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google login failed. Please try again.');
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Fair';
    if (passwordStrength <= 3) return 'Good';
    return 'Strong';
  };

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-6">
          <div>
            <p className="text-sm text-green-700 font-semibold">You are logged in</p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{user.name || 'Profile'}</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{user.email}</p>
          </div>
          <div className="space-y-3">
            <button onClick={() => navigate('/profile')} className="w-full py-3 rounded-lg font-semibold bg-green-700 text-white hover:bg-green-800 transition">Go to Profile</button>
            <button onClick={() => navigate('/orders')} className="w-full py-3 rounded-lg font-semibold border border-green-200 text-green-700 hover:bg-green-50 transition">View My Orders</button>
            <button onClick={() => { logout(); toast.success('Logged out'); }} className="w-full py-3 rounded-lg font-semibold border border-red-200 text-red-700 hover:bg-red-50 transition">Logout</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {isLogin ? 'Login to continue shopping' : 'Join us for the best makhana experience'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition ${
                      errors.name ? 'border-red-500' : 'border-green-200 dark:border-gray-600'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle size={16} /> {errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition ${
                    errors.email ? 'border-red-500' : 'border-green-200 dark:border-gray-600'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle size={16} /> {errors.email}</p>}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition ${
                      errors.phone ? 'border-red-500' : 'border-green-200 dark:border-gray-600'
                    }`}
                    placeholder="Enter your phone number"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle size={16} /> {errors.phone}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition ${
                    errors.password ? 'border-red-500' : 'border-green-200 dark:border-gray-600'
                  }`}
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle size={16} /> {errors.password}</p>}
              
              {!isLogin && formData.password && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full ${getPasswordStrengthColor()} transition-all`} style={{ width: `${(passwordStrength / 5) * 100}%` }}></div>
                    </div>
                    <span className="text-xs font-medium text-gray-600">{getPasswordStrengthText()}</span>
                  </div>
                  <p className="text-xs text-gray-600">Use 8+ characters with uppercase, numbers & symbols</p>
                </div>
              )}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition ${
                      errors.confirmPassword ? 'border-red-500' : 'border-green-200 dark:border-gray-600'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle size={16} /> {errors.confirmPassword}</p>}
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="text-green-600 text-sm mt-1 flex items-center gap-1"><CheckCircle size={16} /> Passwords match</p>
                )}
              </div>
            )}

            {isLogin && (
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-green-700 hover:text-green-800 dark:text-emerald-400 font-medium">
                  Forgot password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-700 via-green-600 to-green-400 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  {isLogin ? 'Logging in...' : 'Creating account...'}
                </>
              ) : (
                isLogin ? 'Login' : 'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
            <span className="text-gray-500 dark:text-gray-400 text-sm">Or continue with</span>
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
          </div>

          {/* Google Login Button */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text={isLogin ? 'signin_with' : 'signup_with'}
            />
          </div>

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
                  setErrors({});
                  setPasswordStrength(0);
                }}
                className="text-green-700 hover:text-green-800 dark:text-emerald-400 font-semibold transition"
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      </div>

    </GoogleOAuthProvider>
  );
}
