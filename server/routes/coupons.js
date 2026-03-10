const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { protect, admin } = require('../middleware/auth');

// Validate coupon
router.post('/validate', protect, async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      active: true,
      expiresAt: { $gte: new Date() }
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Invalid or expired coupon' });
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ error: 'Coupon usage limit reached' });
    }

    if (cartTotal < coupon.minOrderValue) {
      return res.status(400).json({ 
        error: `Minimum purchase of ₹${coupon.minOrderValue} required` 
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.discountValue;
    }

    res.json({
      valid: true,
      discount,
      code: coupon.code,
      description: coupon.description
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Create coupon
router.post('/', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get all coupons
router.get('/', protect, admin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Delete coupon
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Update coupon
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.code) update.code = String(update.code).toUpperCase();
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
