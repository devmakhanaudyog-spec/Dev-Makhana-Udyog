const express = require('express');
const router = express.Router();
const FreeSample = require('../models/FreeSample');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const normalizeName = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

const stripTrailingWeight = (value) => {
  const text = String(value || '').trim();
  return text
    .replace(/\s*\(\s*\d+(?:\.\d+)?\s*(?:g|gm|grams|kg|kgs)\s*\)\s*$/i, '')
    .replace(/\s*[-,]?\s*\d+(?:\.\d+)?\s*(?:g|gm|grams|kg|kgs)\s*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

const getEffectivePrice = (product) => {
  const basePrice = Number(product?.price) || 0;
  const discount = Number(product?.discount) || 0;
  if (discount > 0) {
    return Math.max(0, basePrice - (basePrice * discount / 100));
  }
  return basePrice;
};

// Submit free sample request (optional auth)
router.post('/submit', async (req, res) => {
  try {
    const {
      name,
      company,
      phone,
      email,
      addressLine1,
      addressLine2,
      landmark,
      city,
      district,
      state,
      pincode,
      makhanaType,
      sampleRequestType,
      sampleItems,
      requirement,
      message,
      samplePackage,
      paymentMethod,
      paymentStatus,
      paymentId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      chargedAmount
    } = req.body;

    // Validate required fields (trim and check for empty strings)
    const requiredFields = {
      name,
      phone,
      email,
      addressLine1,
      city,
      district,
      state,
      pincode,
      paymentMethod
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value || (typeof value === 'string' && !value.trim()))
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Validate phone (basic check - at least 10 digits)
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      return res.status(400).json({ error: 'Phone number must have at least 10 digits' });
    }

    // Validate PIN code (6 digits)
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ error: 'PIN code must be exactly 6 digits' });
    }

    const normalizedPaymentMethod = String(paymentMethod || '').trim().toLowerCase();
    if (normalizedPaymentMethod !== 'razorpay') {
      return res.status(400).json({ error: 'Only Razorpay payments are accepted for sample requests' });
    }

    const normalizedRequestType = ['single', 'multiple', 'package'].includes(sampleRequestType)
      ? sampleRequestType
      : 'single';

    const normalizedSampleItems = Array.isArray(sampleItems)
      ? sampleItems
          .filter((item) => item && item.type)
          .map((item) => ({
            category: String(item.category || '').trim(),
            type: String(item.type || '').trim(),
            quantityG: Number(item.quantityG) || 0,
          unitPrice: Number(item.unitPrice) || 0,
          lineAmount: Number(item.lineAmount) || 0,
          }))
      : [];

    const mergedSampleItems = normalizedSampleItems.reduce((acc, item) => {
      const key = normalizeName(item.type);
      if (!key) return acc;
      if (!acc[key]) {
        acc[key] = { ...item };
      } else {
        acc[key].quantityG += Number(item.quantityG) || 0;
      }
      return acc;
    }, {});

    const dedupedSampleItems = Object.values(mergedSampleItems);

    if (normalizedRequestType !== 'package') {
      if (dedupedSampleItems.length === 0) {
        return res.status(400).json({ error: 'Please select at least one Makhana type' });
      }

      const invalidSample = dedupedSampleItems.find((item) => !item.type || item.quantityG < 1 || item.quantityG > 100);
      if (invalidSample) {
        return res.status(400).json({ error: 'Each Makhana type must have quantity between 1g and 100g' });
      }

      if (normalizedRequestType === 'single' && dedupedSampleItems.length > 1) {
        return res.status(400).json({ error: 'Single type request can contain only one Makhana type' });
      }
    }

    if (normalizedRequestType === 'package' && (!samplePackage || (typeof samplePackage === 'string' && !samplePackage.trim()))) {
      return res.status(400).json({ error: 'Sample package is required for package requests' });
    }

    const fallbackMakhanaType = String(makhanaType || '').trim();

    let computedSampleItems = [];
    let computedChargedAmount = 0;

    if (normalizedRequestType !== 'package') {
      const products = await Product.find({ active: true }).select('name subCategory category price discount');
      const productMap = new Map();

      products.forEach((product) => {
        const rawKey = normalizeName(product.name);
        const cleanedKey = normalizeName(stripTrailingWeight(product.name));
        if (rawKey && !productMap.has(rawKey)) productMap.set(rawKey, product);
        if (cleanedKey && !productMap.has(cleanedKey)) productMap.set(cleanedKey, product);
      });

      computedSampleItems = dedupedSampleItems.map((item) => {
        const product = productMap.get(normalizeName(item.type));
        if (!product) {
          return { ...item, productMissing: true };
        }
        const unitPrice = getEffectivePrice(product);
        const lineAmount = Number((unitPrice * (item.quantityG / 1000)).toFixed(2));
        return {
          category: String(product.subCategory || product.category || item.category || '').trim(),
          type: String(product.name || item.type || '').trim(),
          quantityG: item.quantityG,
          unitPrice,
          lineAmount,
        };
      });

      const missingProductItem = computedSampleItems.find((item) => item.productMissing);
      if (missingProductItem) {
        return res.status(400).json({ error: `Product pricing not found for type: ${missingProductItem.type}` });
      }

      computedChargedAmount = Number(
        computedSampleItems.reduce((sum, item) => sum + (Number(item.lineAmount) || 0), 0).toFixed(2)
      );

      if (computedChargedAmount <= 0) {
        return res.status(400).json({ error: 'Unable to calculate amount for selected Makhana types' });
      }
    } else {
      computedChargedAmount = Number(chargedAmount) || Number(samplePackage) || 0;
    }

    const finalMakhanaType = normalizedRequestType === 'package'
      ? (fallbackMakhanaType || `Package Sample (${samplePackage})`)
      : (computedSampleItems.map((item) => `${item.type} (${item.quantityG}g)`).join(', ') || fallbackMakhanaType);

    if (!finalMakhanaType) {
      return res.status(400).json({ error: 'Makhana type details are required' });
    }

    if (!paymentId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ error: 'Razorpay payment details are required' });
    }

    const sampleData = {
      name: name.trim(),
      company: (company || '').trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      addressLine1: addressLine1.trim(),
      addressLine2: (addressLine2 || '').trim(),
      landmark: (landmark || '').trim(),
      city: city.trim(),
      district: district.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      makhanaType: finalMakhanaType,
      sampleRequestType: normalizedRequestType,
      sampleItems: computedSampleItems,
      requirement: (requirement || '').trim(),
      message: (message || '').trim(),
      samplePackage: samplePackage,
      chargedAmount: computedChargedAmount,
      paymentMethod: normalizedPaymentMethod,
      paymentStatus: paymentStatus || 'Paid',
      paymentId: String(paymentId),
      razorpayOrderId: String(razorpayOrderId),
      razorpayPaymentId: String(razorpayPaymentId),
      razorpaySignature: String(razorpaySignature),
      status: 'Pending'
    };

    // Add userId if user is logged in (from authorization header)
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const jwtSecret = process.env.JWT_SECRET;
    if (token && jwtSecret) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, jwtSecret);
        sampleData.userId = decoded.id || decoded._id;
      } catch (err) {
        // Token invalid or expired - continue without userId
      }
    }

    const sample = new FreeSample(sampleData);
    await sample.save();

    res.status(201).json({ 
      success: true,
      message: 'Free sample request submitted successfully!',
      orderId: sample.orderId,
      requestId: sample._id 
    });
  } catch (error) {
    console.error('Free sample submission error:', error);
    
    // Handle validation errors from Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }

    res.status(500).json({ error: error.message || 'Failed to submit request. Please try again.' });
  }
});

// Get user's free sample requests (authenticated)
router.get('/my', protect, async (req, res) => {
  try {
    const samples = await FreeSample.find({ 
      $or: [
        { userId: req.user._id },
        { email: req.user.email }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(samples);
  } catch (error) {
    console.error('Error fetching user free samples:', error);
    res.status(500).json({ error: 'Failed to fetch free sample requests' });
  }
});


// Cancel free sample request
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await FreeSample.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Free sample request not found' });
    // Only allow user to cancel their own request
    if (order.userId && order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (order.status === 'Cancelled') {
      return res.status(400).json({ error: 'Request already cancelled' });
    }
    order.status = 'Cancelled';
    await order.save();
    res.json({ success: true, message: 'Free sample request cancelled', order });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to cancel free sample request' });
  }
});

module.exports = router;
