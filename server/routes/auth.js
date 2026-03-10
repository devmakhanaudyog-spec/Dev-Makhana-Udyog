const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const { generateToken, protect } = require('../middleware/auth');
const crypto = require('crypto');
const { sendPasswordResetEmail, sendOTPEmail } = require('../utils/emailService');
const { generateOTP, generateOTPExpiryTime, isOTPExpired, generateSecurePassword } = require('../utils/otpService');
const { OAuth2Client } = require('google-auth-library');

const isDatabaseConnected = () => mongoose.connection.readyState === 1;

const isMongoConnectionError = (error = {}) => {
  const message = (error.message || '').toLowerCase();
  return (
    error.name === 'MongooseServerSelectionError' ||
    error.name === 'MongoServerSelectionError' ||
    message.includes('buffering timed out') ||
    message.includes('querysrv') ||
    message.includes('econnrefused') ||
    message.includes('enotfound')
  );
};

// Initialize Google OAuth Client (optional - only if GOOGLE_CLIENT_ID is set)
let googleClient = null;
if (process.env.GOOGLE_CLIENT_ID) {
  googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
} else {
  console.warn('⚠️  WARNING: GOOGLE_CLIENT_ID not set. Google OAuth login will be disabled.');
}

// Register - Direct signup (OTP disabled)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!isDatabaseConnected()) {
      return res.status(503).json({
        error: 'Signup service is temporarily unavailable. Please try again in a moment.',
        code: 'DB_UNAVAILABLE'
      });
    }

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ error: 'Email already registered. Please login instead.' });
    }

    // Create user (email is considered verified when OTP flow is disabled)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      phone: phone ? phone.trim() : '',
      emailVerified: true,
      authMethod: 'email'
    });

    // Return success message
    res.status(201).json({
      message: 'Account created successfully.',
      email: email,
      requiresOTP: false,
      userId: user._id
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (isMongoConnectionError(error)) {
      return res.status(503).json({
        error: 'Signup service is temporarily unavailable. Please try again shortly.',
        code: 'DB_UNAVAILABLE'
      });
    }

    res.status(500).json({
      error: 'Registration failed. Please try again.',
      code: 'REGISTER_FAILED'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const emailRaw = req.body.email || '';
    const passwordRaw = req.body.password || '';
    const email = emailRaw.trim();
    const password = passwordRaw.trim();

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify OTP - Complete email verification
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email already verified
    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified. You can now login.' });
    }

    // Check OTP expiry
    if (!user.otpExpiresAt || isOTPExpired(user.otpExpiresAt)) {
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }

    // Check OTP attempts
    if (user.otpAttempts >= 5) {
      return res.status(429).json({ error: 'Too many failed attempts. Please request a new OTP.' });
    }

    // Verify OTP
    if (user.verificationOtp !== otp.trim()) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      const remaining = 5 - user.otpAttempts;
      return res.status(401).json({ 
        error: `Invalid OTP. ${remaining} attempts remaining.` 
      });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.verificationOtp = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
    user.lastLogin = new Date();
    await user.save();

    // Return user data with token
    res.json({
      message: 'Email verified successfully',
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emailVerified: true,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!isDatabaseConnected()) {
      return res.status(503).json({
        error: 'OTP service is temporarily unavailable. Please try again shortly.',
        code: 'DB_UNAVAILABLE'
      });
    }

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email already verified
    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified. You can login now.' });
    }

    // Check OTP resend cooldown (1 minute)
    if (user.otpLastSentAt && new Date() - user.otpLastSentAt < 60000) {
      const waitSeconds = Math.ceil((60000 - (new Date() - user.otpLastSentAt)) / 1000);
      return res.status(429).json({ 
        error: `Please wait ${waitSeconds} seconds before requesting a new OTP.` 
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    user.verificationOtp = otp;
    user.otpExpiresAt = generateOTPExpiryTime(10); // 10 minutes
    user.otpLastSentAt = new Date();
    user.otpAttempts = 0;
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return res.status(502).json({
        error: 'Failed to send OTP right now. Please try again in a minute.',
        code: 'OTP_DELIVERY_FAILED'
      });
    }

    res.json({ 
      message: 'OTP sent successfully',
      email: email
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    if (isMongoConnectionError(error)) {
      return res.status(503).json({
        error: 'OTP service is temporarily unavailable. Please try again shortly.',
        code: 'DB_UNAVAILABLE'
      });
    }

    res.status(500).json({
      error: 'Failed to resend OTP. Please try again.',
      code: 'RESEND_OTP_FAILED'
    });
  }
});

// Google Login
router.post('/google-login', async (req, res) => {
  try {
    const { googleToken } = req.body;

    if (!googleToken) {
      return res.status(400).json({ error: 'Google token is required' });
    }

    // Check if Google OAuth is configured
    if (!googleClient || !process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({ 
        error: 'Google login is not configured. Please contact support.' 
      });
    }

    // Verify Google token
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
    } catch (tokenError) {
      console.error('Google token verification failed:', tokenError.message);
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    if (!email) {
      return res.status(400).json({ error: 'Email not found in Google account' });
    }

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create new user with Google info
      user = await User.create({
        name: name || 'User',
        email: email.toLowerCase(),
        googleId: googleId,
        googleEmail: email,
        googleProfilePicture: picture,
        emailVerified: true, // Google verified email
        authMethod: 'google',
        password: generateSecurePassword() // Random password for Google users
      });
    } else {
      // Update Google info if not already set
      if (!user.googleId) {
        user.googleId = googleId;
      }
      if (!user.googleEmail) {
        user.googleEmail = email;
      }
      if (!user.googleProfilePicture && picture) {
        user.googleProfilePicture = picture;
      }

      // Mark email as verified if using Google
      if (!user.emailVerified) {
        user.emailVerified = true;
        user.verificationOtp = null;
        user.otpExpiresAt = null;
      }

      if (user.authMethod !== 'google') {
        user.authMethod = 'google';
      }

      await user.save();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Return user data with token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      emailVerified: true,
      authMethod: 'google',
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: error.message });
  }
});
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const adminPassword = (process.env.ADMIN_PASSWORD || '').trim();
    const loginEmail = email.toLowerCase();

    if (!adminEmail || !adminPassword) {
      return res.status(503).json({
        error: 'Admin credentials are not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD.',
        code: 'ADMIN_CONFIG_MISSING'
      });
    }

    // Find user by email (any role)
    let user = await User.findOne({ email: loginEmail });
    const debug = { loginEmail, adminEmail, found: !!user, role: user?.role };

    // If a user exists with this email but is not admin, promote and reset password to default admin password
    if (user && user.role !== 'admin' && loginEmail === adminEmail) {
      user.role = 'admin';
      user.password = adminPassword;
      await user.save();
      debug.promoted = true;
    }

    // If no user, create default admin for the default admin email
    if (!user && loginEmail === adminEmail) {
      user = await User.create({
        name: 'Administrator',
        email: adminEmail,
        password: adminPassword,
        phone: '+91 9999999999',
        role: 'admin'
      });
      debug.created = true;
    }

    // If still no user or not admin, reject
    if (!user || user.role !== 'admin') {
      console.warn('ADMIN_LOGIN_DEBUG', debug, 'reject:not-admin');
      return res.status(401).json({ error: 'Invalid admin credentials', code: 'ADMIN_AUTH_FAILED' });
    }

    // Check password; for default admin email, lock to default admin password and keep it in sync
    if (loginEmail === adminEmail) {
      const matchesDefault = await user.comparePassword(adminPassword);
      if (!matchesDefault) {
        user.password = adminPassword;
        await user.save();
        debug.resetToDefault = true;
      }

      const providedMatch = await user.comparePassword(password);
      if (!providedMatch) {
        console.warn('ADMIN_LOGIN_DEBUG', debug, 'reject:password-mismatch-default');
        return res.status(401).json({ error: 'Invalid admin credentials', code: 'ADMIN_AUTH_FAILED_DEFAULT' });
      }
    } else {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        console.warn('ADMIN_LOGIN_DEBUG', debug, 'reject:password-mismatch');
        return res.status(401).json({ error: 'Invalid admin credentials', code: 'ADMIN_AUTH_FAILED' });
      }
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    console.log('ADMIN_LOGIN_DEBUG', debug, 'success');
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      role: updatedUser.role
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile with addresses
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new address
router.post('/address', protect, async (req, res) => {
  try {
    const { street, city, state, zipCode, country, isDefault } = req.body;
    
    if (!street || !city || !state || !zipCode) {
      return res.status(400).json({ error: 'All address fields are required' });
    }

    const user = await User.findById(req.user._id);
    
    // If setting as default, unset all others
    if (isDefault) {
      user.address.forEach(addr => addr.isDefault = false);
    }

    user.address.push({
      street,
      city,
      state,
      zipCode,
      country: country || 'India',
      isDefault: isDefault || user.address.length === 0
    });

    await user.save();
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update address
router.put('/address/:addressId', protect, async (req, res) => {
  try {
    const { street, city, state, zipCode, country, isDefault } = req.body;
    
    const user = await User.findById(req.user._id);
    const address = user.address.id(req.params.addressId);
    
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    // If setting as default, unset all others
    if (isDefault) {
      user.address.forEach(addr => addr.isDefault = false);
    }

    if (street) address.street = street;
    if (city) address.city = city;
    if (state) address.state = state;
    if (zipCode) address.zipCode = zipCode;
    if (country) address.country = country;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await user.save();
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete address
router.delete('/address/:addressId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.address.pull(req.params.addressId);
    await user.save();
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.name);
      
      res.json({ 
        message: 'Password reset email sent successfully. Please check your inbox.',
        success: true,
        // Include token only in development for testing
        ...(process.env.NODE_ENV === 'development' && { resetToken })
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      
      // If email fails, still return success but with a note
      // The token is saved in DB, so user can still use it if they get it another way
      res.json({
        message: 'Password reset initiated. If email sending is configured, you will receive an email shortly.',
        success: true,
        resetToken, // Return token for testing when email is not configured
        warning: 'Email service may not be configured. Use the token above to reset your password.'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reset password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change password (for logged-in users including admins)
router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Get user with password field
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ 
      message: 'Password changed successfully',
      success: true 
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
