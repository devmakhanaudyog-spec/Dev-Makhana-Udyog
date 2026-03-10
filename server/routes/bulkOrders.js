const express = require('express');
const router = express.Router();
const BulkOrder = require('../models/BulkOrder');
const { protect } = require('../middleware/auth');

// Submit bulk order request (optional auth)
router.post('/submit', async (req, res) => {
  try {
    const {
      fullName,
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
      monthlyVolume,
      packaging,
      postSampleQty,
      notes
    } = req.body;

    // Validate required fields (trim and check for empty strings)
    const requiredFields = {
      fullName,
      phone,
      email,
      addressLine1,
      city,
      district,
      state,
      pincode,
      makhanaType,
      monthlyVolume,
      packaging,
      postSampleQty
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

    const bulkOrderData = {
      fullName: fullName.trim(),
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
      makhanaType: makhanaType.trim(),
      monthlyVolume: monthlyVolume.trim(),
      packaging: packaging.trim(),
      postSampleQty: postSampleQty.trim(),
      notes: (notes || '').trim(),
      status: 'Pending'
    };

    // Add userId if user is logged in (from authorization header)
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const jwtSecret = process.env.JWT_SECRET;
    if (token && jwtSecret) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, jwtSecret);
        bulkOrderData.userId = decoded.id; // Use .id to match auth middleware
      } catch (err) {
        // Token invalid or expired - continue without userId
      }
    }

    const bulkOrder = new BulkOrder(bulkOrderData);
    await bulkOrder.save();

    res.status(201).json({ 
      success: true,
      message: 'Bulk order request submitted successfully! We will contact you shortly.',
      orderId: bulkOrder.orderId,
      requestId: bulkOrder._id 
    });
  } catch (error) {
    console.error('Bulk order submission error:', error);
    
    // Handle validation errors from Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }

    res.status(500).json({ error: error.message || 'Failed to submit request. Please try again.' });
  }
});

// Get user's bulk orders (authenticated)
router.get('/my', protect, async (req, res) => {
  try {
    const bulkOrders = await BulkOrder.find({ 
      $or: [
        { userId: req.user._id },
        { email: req.user.email }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(bulkOrders);
  } catch (error) {
    console.error('Error fetching user bulk orders:', error);
    res.status(500).json({ error: 'Failed to fetch bulk orders' });
  }
});


// Cancel bulk order
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await BulkOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Bulk order not found' });
    // Only allow user to cancel their own order
    if (order.userId && order.userId.toString() !== req.user._id.toString() && order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (order.status === 'Cancelled') {
      return res.status(400).json({ error: 'Order already cancelled' });
    }
    order.status = 'Cancelled';
    await order.save();
    res.json({ success: true, message: 'Bulk order cancelled', order });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to cancel bulk order' });
  }
});

module.exports = router;
