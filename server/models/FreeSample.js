const mongoose = require('mongoose');

const freeSampleSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, sparse: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: [true, 'Full name is required'], trim: true },
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
  requirement: { type: String, trim: true, default: '' },
  message: { type: String, trim: true, default: '' },
  chargedAmount: { type: Number, default: 0 },
  samplePackage: { type: String, enum: ['650', '1000'], required: true },
  paymentMethod: { type: String, enum: ['upi', 'razorpay'], required: true },
  status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  adminNotes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Generate readable order id for free sample requests with unique random 5-digit serial (e.g., FS-20260106-82734)
freeSampleSchema.pre('save', async function(next) {
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
    const orderId = `FS-${datePart}-${randomSerial}`;
    
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

module.exports = mongoose.model('FreeSample', freeSampleSchema);
