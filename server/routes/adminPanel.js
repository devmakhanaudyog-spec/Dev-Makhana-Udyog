const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Contact = require('../models/Contact');
const Newsletter = require('../models/Newsletter');
const Settings = require('../models/Settings');
const Order = require('../models/Order');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const FreeSample = require('../models/FreeSample');
const BulkOrder = require('../models/BulkOrder');
const Product = require('../models/Product');
const Review = require('../models/Review');

const recalcProductRating = async (productId) => {
  if (!productId) return;
  const aggregates = await Review.aggregate([
    { $match: { product: productId, approved: true } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  const stats = aggregates[0];
  await Product.findByIdAndUpdate(productId, {
    rating: stats ? Number(stats.avgRating.toFixed(1)) : 0,
    numReviews: stats ? stats.count : 0
  });
};

// Middleware to check admin role
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized: Admin access only' });
  }
  next();
};

// ============ DASHBOARD ============
router.get('/dashboard/overview', protect, adminOnly, async (req, res) => {
  try {
    // Run all database queries in parallel for better performance
    const [
      ordersCount,
      bulkOrdersCount,
      freeSamplesCount,
      ordersRevenueAgg,
      bulkRevenueAgg,
      samplesRevenueAgg,
      totalUsers,
      totalMessages,
      unreadMessages,
      newsletterSubscribers,
      totalProducts
    ] = await Promise.all([
      Order.countDocuments(),
      BulkOrder.countDocuments(),
      FreeSample.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      BulkOrder.aggregate([
        { $match: { quotedPrice: { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: '$quotedPrice' } } }
      ]),
      FreeSample.aggregate([
        { $match: { chargedAmount: { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: '$chargedAmount' } } }
      ]),
      User.countDocuments({ role: 'user' }),
      Contact.countDocuments(),
      Contact.countDocuments({ status: 'new' }),
      Newsletter.countDocuments(),
      Product.countDocuments()
    ]);

    const totalOrders = ordersCount + bulkOrdersCount + freeSamplesCount;
    const totalRevenue = (ordersRevenueAgg[0]?.total || 0) + (bulkRevenueAgg[0]?.total || 0) + (samplesRevenueAgg[0]?.total || 0);
    
    res.json({
      totalOrders,
      regularOrders: ordersCount,
      bulkOrders: bulkOrdersCount,
      freeSamples: freeSamplesCount,
      totalRevenue,
      totalUsers,
      totalMessages,
      unreadMessages,
      newsletterSubscribers,
      totalProducts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ MESSAGES ============
router.get('/messages', protect, adminOnly, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    const messages = await Contact.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Contact.countDocuments();
    
    res.json({
      messages,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/messages/:id', protect, adminOnly, async (req, res) => {
  try {
    const message = await Contact.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Mark as read
    if (message.status === 'new') {
      message.status = 'read';
      await message.save();
    }
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/messages/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const message = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNotes,
        respondedAt: status === 'responded' ? new Date() : undefined
      },
      { new: true }
    );
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/messages/:id', protect, adminOnly, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ NEWSLETTER ============
router.get('/newsletter-subscribers', protect, adminOnly, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    
    const subscribers = await Newsletter.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Newsletter.countDocuments();
    
    res.json({
      subscribers,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/newsletter-subscribers/:id', protect, adminOnly, async (req, res) => {
  try {
    await Newsletter.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subscriber removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ORDERS ============
router.get('/orders', protect, adminOnly, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Order.countDocuments();
    
    res.json({
      orders,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/orders/:id', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone address');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/orders/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status, trackingId } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, trackingId },
      { new: true }
    ).populate('user', 'name email');
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/orders/:id', protect, adminOnly, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ USERS ============
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments({ role: 'user' });
    
    res.json({
      users,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ FREE SAMPLES ============
router.get('/free-samples', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    let samples = await FreeSample.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Ensure display-friendly IDs for legacy records
    samples = samples.map((s) => {
      if (!s.orderId) {
        s.orderId = `FS-${s._id.toString().slice(-6).toUpperCase()}`;
      }
      return s;
    });
    
    const total = await FreeSample.countDocuments();
    
    res.json({
      samples,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/free-samples/:id', protect, adminOnly, async (req, res) => {
  try {
    const sample = await FreeSample.findById(req.params.id);
    if (!sample) {
      return res.status(404).json({ error: 'Sample request not found' });
    }
    res.json(sample);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/free-samples/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminNotes, chargedAmount } = req.body;
    const update = { status, adminNotes };
    if (typeof chargedAmount === 'number') {
      update.chargedAmount = chargedAmount;
    }
    const sample = await FreeSample.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );
    res.json(sample);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/free-samples/:id', protect, adminOnly, async (req, res) => {
  try {
    await FreeSample.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sample request deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ BULK ORDERS ============
router.get('/bulk-orders', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    let bulkOrders = await BulkOrder.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Ensure display-friendly IDs for legacy records
    bulkOrders = bulkOrders.map((b) => {
      if (!b.orderId) {
        b.orderId = `BULK-${b._id.toString().slice(-6).toUpperCase()}`;
      }
      return b;
    });
    
    const total = await BulkOrder.countDocuments();
    
    res.json({
      bulkOrders,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/bulk-orders/:id', protect, adminOnly, async (req, res) => {
  try {
    const bulkOrder = await BulkOrder.findById(req.params.id);
    if (!bulkOrder) {
      return res.status(404).json({ error: 'Bulk order request not found' });
    }
    res.json(bulkOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/bulk-orders/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status, quotedPrice, adminNotes } = req.body;
    const bulkOrder = await BulkOrder.findByIdAndUpdate(
      req.params.id,
      { status, quotedPrice, adminNotes },
      { new: true }
    );
    res.json(bulkOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/bulk-orders/:id', protect, adminOnly, async (req, res) => {
  try {
    await BulkOrder.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bulk order request deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ REVIEWS / FEEDBACK ============
router.get('/reviews', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    
    const reviews = await Review.find()
      .populate('product', 'name')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Review.countDocuments();
    
    res.json({
      reviews,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/reviews/:id', protect, adminOnly, async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (deleted?.product) {
      await recalcProductRating(deleted.product);
    }
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve/update review (supports legacy path)
router.put('/reviews/:id', protect, adminOnly, async (req, res) => {
  try {
    const { approved } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { approved },
      { new: true }
    );
    if (review?.product) {
      await recalcProductRating(review.product);
    }
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/reviews/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const { approved } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { approved },
      { new: true }
    );
    if (review?.product) {
      await recalcProductRating(review.product);
    }
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ COUPONS ============
router.get('/coupons', protect, adminOnly, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/coupons', protect, adminOnly, async (req, res) => {
  try {
    const { code, discount, expiresAt } = req.body;
    
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discount,
      expiresAt
    });
    
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/coupons/:id', protect, adminOnly, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ SETTINGS ============
router.get('/settings', protect, adminOnly, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({});
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/settings', protect, adminOnly, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
