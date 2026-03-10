const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber: { 
    type: String, 
    unique: true, 
    sparse: true,
    index: true
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    price: Number,
    quantity: { type: Number, required: true, min: 1 },
    image: String
  }],
  shippingAddress: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' }
  },
  paymentMethod: { 
    type: String, 
    enum: ['COD', 'Card', 'UPI', 'Wallet', 'Razorpay', 'Stripe'], 
    default: 'COD' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'], 
    default: 'Pending' 
  },
  paymentId: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  stripePaymentIntentId: String,
  itemsPrice: { type: Number, required: true },
  shippingPrice: { type: Number, default: 0 },
  taxPrice: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  couponCode: String,
  status: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'], 
    default: 'Pending' 
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],
  trackingNumber: String,
  deliveredAt: Date,
  cancelReason: String,
  notes: String
}, { timestamps: true });

// Generate human-friendly order number before saving (e.g., ORD-20260106-00042)
orderSchema.pre('save', async function(next) {
  if (this.orderNumber) return next();

  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

  try {
    const count = await this.constructor.countDocuments();
    const sequence = String(count + 1).padStart(5, '0');
    this.orderNumber = `ORD-${datePart}-${sequence}`;
  } catch (error) {
    console.error('Error generating orderNumber:', error);
    this.orderNumber = `ORD-${datePart}-${Math.random().toString(36).substr(2, 6)}`;
  }
  next();
});

// Indexes for performance with 1000+ users
orderSchema.index({ user: 1, createdAt: -1 });    // Fast user order history
orderSchema.index({ status: 1, createdAt: -1 });  // Fast order filtering by status
orderSchema.index({ paymentStatus: 1 });          // Fast payment status queries
orderSchema.index({ paymentStatus: 1, createdAt: -1 }); // Analytics: paid orders by date
orderSchema.index({ createdAt: -1 });             // Fast sorting by date
orderSchema.index({ orderNumber: 1 });            // Already unique indexed
orderSchema.index({ status: 1, paymentStatus: 1 }); // Analytics: order and payment status breakdown

module.exports = mongoose.model('Order', orderSchema);
