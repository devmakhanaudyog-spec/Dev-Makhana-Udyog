const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const mongoose = require('mongoose');
const { protect, admin } = require('../middleware/auth');

const toNumberOrUndefined = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

const computeDiscount = (price, originalPrice) => {
  const p = toNumberOrUndefined(price);
  const o = toNumberOrUndefined(originalPrice);
  if (!o || o <= 0 || !p || p <= 0) return 0;
  const pct = ((o - p) / o) * 100; // percentage off relative to original
  const rounded = Number(pct.toFixed(2)); // keep two decimals for accuracy
  return Math.max(0, Math.min(100, rounded));
};

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// All routes protected with admin authentication
router.use(protect, admin);

// Get all products (including inactive)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort('-createdAt');
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product
router.post('/', async (req, res) => {
  try {
    const body = { ...req.body };
    body.discount = computeDiscount(body.price, body.originalPrice ?? body.price);
    const product = await Product.create(body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product price, stock, moq, and active status
router.put('/:id/pricing', async (req, res) => {
  try {
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    const { price, originalPrice, stock, moq, active } = req.body;

    const existing = await Product.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const nextPrice = price !== undefined ? toNumberOrUndefined(price) : existing.price;
    const nextOriginal = originalPrice !== undefined ? toNumberOrUndefined(originalPrice) : existing.originalPrice;
    const nextDiscount = computeDiscount(nextPrice, nextOriginal ?? nextPrice);

    const updates = {
      price: nextPrice,
      originalPrice: nextOriginal,
      discount: nextDiscount
    };
    if (stock !== undefined) updates.stock = parseInt(stock);
    if (moq !== undefined) updates.moq = moq;
    if (active !== undefined) updates.active = Boolean(active);

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({ 
      success: true, 
      message: 'Product pricing and stock updated',
      product 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk operations
router.post('/bulk/delete', async (req, res) => {
  try {
    const { ids } = req.body;
    await Product.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${ids.length} products deleted` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/bulk/update', async (req, res) => {
  try {
    const { ids, updates } = req.body;
    await Product.updateMany({ _id: { $in: ids } }, updates);
    res.json({ message: `${ids.length} products updated` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
