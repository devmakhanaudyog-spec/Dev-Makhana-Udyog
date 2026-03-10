const express = require('express');
const Razorpay = require('razorpay');
const Stripe = require('stripe');
const crypto = require('crypto');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Initialize payment gateways
const razorpay = process.env.RAZORPAY_KEY_ID ? new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
}) : null;

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// ============== RAZORPAY ROUTES ==============

// Create Razorpay Order
router.post('/razorpay/create-order', protect, async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({ error: 'Razorpay not configured' });
    }

    const { amount, currency = 'INR', receipt } = req.body;

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: receipt || `order_${Date.now()}`,
      notes: {
        userId: req.user._id.toString()
      }
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify Razorpay Payment
router.post('/razorpay/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      res.json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid payment signature'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Razorpay Payment Details
router.get('/razorpay/payment/:paymentId', protect, async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({ error: 'Razorpay not configured' });
    }

    const payment = await razorpay.payments.fetch(req.params.paymentId);
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============== STRIPE ROUTES ==============

// Create Stripe Payment Intent
router.post('/stripe/create-intent', protect, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const { amount, currency = 'inr', metadata = {} } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to smallest currency unit
      currency,
      metadata: {
        userId: req.user._id.toString(),
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify Stripe Payment
router.post('/stripe/verify', protect, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const { paymentIntentId } = req.body;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      res.json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount / 100
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Payment not completed',
        status: paymentIntent.status
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stripe Webhook (for production)
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        break;
      
      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object.id);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// ============== COD & OTHER PAYMENT ROUTES ==============

// Process COD Order
router.post('/cod/process', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'COD order confirmed',
      paymentMethod: 'COD',
      paymentStatus: 'Pending'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Legacy route for backward compatibility
router.post('/intent', protect, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe is not configured on the server' });
    }

    const { items, couponCode, discountAmount = 0 } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'No items provided' });
    }

    let itemsPrice = 0;

    for (const item of items) {
      const product = await Product.findById(item.product || item._id);
      if (!product) continue;
      const qty = item.qty || item.quantity || 1;
      itemsPrice += product.price * qty;
    }

    const shippingPrice = itemsPrice > 1000 ? 0 : 50;
    const taxPrice = (itemsPrice + shippingPrice) * 0.18;
    const total = Math.round((itemsPrice + shippingPrice + taxPrice) * 100);
    const finalAmount = Math.max(total - Math.round(discountAmount * 100), 0);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency: 'inr',
      description: couponCode ? `Order with coupon ${couponCode}` : 'Order payment',
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      amount: finalAmount / 100,
    });
  } catch (error) {
    console.error('Stripe error', error);
    res.status(500).json({ error: error.message || 'Stripe payment failed' });
  }
});

module.exports = router;
