const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Missing required environment variable: JWT_SECRET');
}

// Create order
router.post('/', protect, async (req, res) => {
  try {
    const { 
      items, 
      shippingAddress, 
      paymentMethod, 
      couponCode, 
      paymentStatus,
      discountAmount = 0,
      paymentId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      stripePaymentIntentId
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No order items' });
    }

    // Calculate prices
    let itemsPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product || item._id);
      if (!product) continue;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.qty || item.quantity,
        image: product.mainImage || product.images?.[0]
      });

      itemsPrice += product.price * (item.qty || item.quantity);
      
      // Update sold count and stock
      product.soldCount += item.qty || item.quantity;
      if (product.stock > 0) {
        product.stock -= item.qty || item.quantity;
      }
      await product.save();
    }

    const shippingPrice = itemsPrice > 1000 ? 0 : 50;
    const taxPrice = (itemsPrice - discountAmount) * 0.18; // 18% GST (applied after discount)
    const totalPrice = itemsPrice + shippingPrice + taxPrice - discountAmount;

    // Update order status based on payment method and status
    const initialStatus = (paymentStatus === 'Paid') ? 'Processing' : 'Pending';

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentStatus || 'Pending',
      paymentId: paymentId || razorpayPaymentId || stripePaymentIntentId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      stripePaymentIntentId,
      itemsPrice,
      shippingPrice,
      taxPrice,
      discountAmount,
      totalPrice,
      couponCode,
      status: initialStatus,
      statusHistory: [{ status: initialStatus, timestamp: new Date() }]
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user orders (optimized with lean for read-only)
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort('-createdAt')
      .populate('items.product', 'name images')
      .lean()
      .limit(100); // Pagination safety
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Public order tracking by order number + email/phone
// If Authorization bearer token is provided and matches order.user, email/phone verification is skipped
router.get('/track', async (req, res) => {
  try {
    const { orderNumber, email, phone } = req.query;

    // Attempt to identify logged-in user (optional auth)
    let authUserId = null;
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        authUserId = decoded.id;
      } catch (e) {
        // ignore invalid token for this public endpoint
      }
    }

    if (!orderNumber || (!email && !phone)) {
      return res.status(400).json({ error: 'orderNumber and email or phone are required' });
    }

    const order = await Order.findOne({
      $or: [
        { orderNumber },
        { _id: orderNumber }
      ]
    })
      .populate('items.product', 'name images')
      .lean(); // Optimized read-only query

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // If caller is the owner (via token), skip email/phone verification
    if (!authUserId || order.user.toString() !== authUserId) {
      const matchesEmail = email && order.shippingAddress.email?.toLowerCase() === email.toLowerCase();
      const matchesPhone = phone && order.shippingAddress.phone === phone;

      if (!matchesEmail && !matchesPhone) {
        return res.status(403).json({ error: 'Verification failed. Please check email/phone.' });
      }
    }

    const sanitizedHistory = (order.statusHistory || []).map(entry => ({
      status: entry.status,
      timestamp: entry.timestamp,
      note: entry.note || null,
    })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      orderNumber: order.orderNumber,
      status: order.status,
      trackingNumber: order.trackingNumber || null,
      paymentStatus: order.paymentStatus,
      shippingAddress: {
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        zipCode: order.shippingAddress.zipCode,
        country: order.shippingAddress.country,
      },
      items: order.items?.map(i => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        image: i.image,
      })) || [],
      statusHistory: sanitizedHistory,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      totalPrice: order.totalPrice,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status (admin only)
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    order.statusHistory.push({ status, timestamp: new Date(), note });

    if (status === 'Delivered') {
      order.deliveredAt = new Date();
      order.paymentStatus = 'Paid';
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel order
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (order.status === 'Delivered' || order.status === 'Cancelled') {
      return res.status(400).json({ error: 'Cannot cancel this order' });
    }

    order.status = 'Cancelled';
    order.cancelReason = req.body.reason;
    order.statusHistory.push({ status: 'Cancelled', timestamp: new Date(), note: req.body.reason });

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all orders (admin)
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort('-createdAt')
      .populate('user', 'name email')
      .populate('items.product', 'name');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
