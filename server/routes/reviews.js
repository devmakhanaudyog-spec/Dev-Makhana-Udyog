const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

// Helper: load product by Mongo ObjectId or by slug `productId`
async function findProductByParam(param) {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(param);
    const product = isObjectId
      ? await Product.findById(param)
      : await Product.findOne({ productId: param });
    return product;
  } catch (_) {
    return null;
  }
}

// Add review to product (stores in Review collection)
router.post('/:productId', protect, async (req, res) => {
  try {
    const { rating, comment, state = '', district = '' } = req.body;
    const product = await findProductByParam(req.params.productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'items.product': product._id,
      status: 'Delivered'
    });

    const alreadyReviewed = await Review.findOne({ product: product._id, user: req.user._id });
    if (alreadyReviewed) {
      return res.status(400).json({ error: 'Product already reviewed' });
    }

    const review = await Review.create({
      product: product._id,
      user: req.user._id,
      name: req.user.name || req.body.name || 'Anonymous',
      email: req.user.email,
      state: state.trim(),
      district: district.trim(),
      rating: numericRating,
      comment: comment?.trim() || '',
      verified: !!hasPurchased
    });

    // Update product rating stats based on approved reviews
    const aggregates = await Review.aggregate([
      { $match: { product: product._id, approved: true } },
      { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const stats = aggregates[0];
    product.rating = stats ? Number(stats.avgRating.toFixed(1)) : 0;
    product.numReviews = stats ? stats.count : 0;
    await product.save();

    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Get product reviews
router.get('/:productId', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const product = await findProductByParam(req.params.productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortObj = {};
    if (sort === '-createdAt') sortObj.createdAt = -1;
    else if (sort === 'createdAt') sortObj.createdAt = 1;
    else if (sort === '-rating') sortObj.rating = -1;
    else if (sort === 'rating') sortObj.rating = 1;
    else sortObj.createdAt = -1;

    const [reviews, total] = await Promise.all([
      Review.find({ product: product._id, approved: true })
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Review.countDocuments({ product: product._id, approved: true })
    ]);

    res.json({
      reviews,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Mark review as helpful
router.put('/:productId/reviews/:reviewId/helpful', protect, async (req, res) => {
  try {
    // Resolve product first to ensure correct ObjectId when a slug is passed
    const product = await findProductByParam(req.params.productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const review = await Review.findOne({ _id: req.params.reviewId, product: product._id });
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    review.helpful += 1;
    await review.save();

    res.json({ message: 'Marked as helpful' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

module.exports = router;
