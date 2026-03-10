const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, trim: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  address: [{
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    isDefault: { type: Boolean, default: false }
  }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  cart: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1, min: 1, max: 10 }
  }],
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  avatar: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  emailVerified: { type: Boolean, default: false },
  verificationToken: String,
  lastLogin: Date,
  // OTP Verification Fields
  verificationOtp: String,
  otpExpiresAt: Date,
  otpAttempts: { type: Number, default: 0 },
  otpLastSentAt: Date,
  // Google OAuth Fields
  googleId: String,
  googleEmail: String,
  googleProfilePicture: String,
  authMethod: {
    type: String,
    enum: ['email', 'google'],
    default: 'email'
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Indexes for performance with 1000+ users
userSchema.index({ email: 1 });           // Fast email lookup for login
userSchema.index({ createdAt: -1 });      // Fast sorting by date
userSchema.index({ role: 1 });            // Fast admin filtering
userSchema.index({ role: 1, createdAt: -1 }); // Analytics: new users by role and date
userSchema.index({ email: 1, role: 1 });  // Combined index for admin email queries

module.exports = mongoose.model('User', userSchema);
