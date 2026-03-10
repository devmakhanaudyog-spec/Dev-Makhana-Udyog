const mongoose = require('mongoose');

const bulkOrderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, sparse: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fullName: { type: String, required: [true, 'Full name is required'], trim: true },
  company: { type: String, trim: true, default: '' },
  phone: { type: String, required: [true, 'Phone number is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], lowercase: true, trim: true },
  addressLine1: { type: String, required: [true, 'Address is required'], trim: true },
  addressLine2: { type: String, trim: true, default: '' },
  landmark: { type: String, trim: true, default: '' },
  city: { type: String, required: [true, 'City is required'], trim: true },
  district: { type: String, required: [true, 'District is required'], trim: true },
  state: { type: String, required: [true, 'State is required'], trim: true },
  pincode: { type: String, required: [true, 'PIN code is required'], trim: true },
  makhanaType: { type: String, required: [true, 'Makhana type is required'], trim: true },
  monthlyVolume: { type: String, required: [true, 'Monthly volume is required'], trim: true },
  packaging: { type: String, required: [true, 'Packaging size is required'], trim: true },
  postSampleQty: { type: String, required: [true, 'Order quantity is required'], trim: true },
  notes: { type: String, trim: true, default: '' },
  status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  quotedPrice: { type: Number, default: null },
  adminNotes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Generate readable order id for bulk requests with unique random 5-digit serial (e.g., BULK-20260106-47592)
bulkOrderSchema.pre('save', async function(next) {
  if (this.orderId) return next();

  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  
  let randomSerial;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 100;
  
  // Generate unique random 5-digit number (10000-99999)
  while (!isUnique && attempts < maxAttempts) {
    randomSerial = Math.floor(Math.random() * 90000) + 10000;
    const orderId = `BULK-${datePart}-${randomSerial}`;
    
    const existing = await this.constructor.findOne({ orderId });
    if (!existing) {
      isUnique = true;
      this.orderId = orderId;
    }
    attempts++;
  }
  
  if (!isUnique) {
    return next(new Error('Failed to generate unique order ID after 100 attempts'));
  }
  
  next();
});

module.exports = mongoose.model('BulkOrder', bulkOrderSchema);
