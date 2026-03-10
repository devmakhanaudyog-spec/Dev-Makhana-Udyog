const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    heroImage: { type: String, default: '' },
  siteTitle: { type: String, default: 'Makhana Shop' },
  siteDescription: { type: String, default: 'Premium GI-Certified Mithila Makhana' },
  companyEmail: { type: String, default: 'contact@makhana.com' },
  companyPhone: { type: String, default: '+91 9999999999' },
  whatsappNumber: { type: String, default: '+91 9999999999' },
  address: { type: String, default: '' },
  // Checkout and taxation settings
  shippingCost: { type: Number, default: 50 },
  taxPercentage: { type: Number, default: 18 },
  specialDiscountPercentage: { type: Number, default: 0 },
  currencyCode: { type: String, default: 'INR' },
  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String
  },
  seoKeywords: String,
  freeSampleLimit: { type: Number, default: 100 },
  freeSampleRequestsCount: { type: Number, default: 0 },
  newsletterStatus: { type: Boolean, default: true },
  contactFormStatus: { type: Boolean, default: true },
  maintenanceMode: { type: Boolean, default: false },
  maintenanceMessage: String,
  features: {
    freeShipping: { type: Boolean, default: true },
    freeShippingThreshold: { type: Number, default: 500 },
    giftWrap: { type: Boolean, default: true },
    giftMessage: { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
