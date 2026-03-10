const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  images: [String],
  helpful: { type: Number, default: 0 },
  verified: { type: Boolean, default: false }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, index: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  category: { 
    type: String, 
    default: 'Makhana',
    enum: ['Makhana', 'Home Decor', 'Jewelry', 'Pottery', 'Textiles', 'Accessories', 'Art', 'Other'],
    index: true
  },
  subCategory: String,
  images: [String],
  mainImage: String,
  stock: { type: Number, default: 0, min: 0 },
  sku: { type: String, unique: true, sparse: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  reviews: [reviewSchema],
  
  // Makhana-specific fields
  productId: { type: String, unique: true, sparse: true }, // e.g., "7-suta", "6-suta"
  grade: String, // e.g., "Super Premium 16mm+"
  popRate: String, // e.g., "99%+"
  moisture: String, // e.g., "< 2.5%"
  moq: String, // Minimum Order Quantity
  packaging: String, // Packaging options
  use: String, // Recommended use case
  
  variants: [{
    name: String, // e.g., "Size", "Color"
    options: [String] // e.g., ["1kg", "5kg", "25kg"]
  }],
  tags: [String],
  delivery: { type: String, default: 'Ships in 3-5 days' },
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  soldCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  specifications: mongoose.Schema.Types.Mixed,
  relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

// Index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Additional indexes for performance with 1000+ products
productSchema.index({ category: 1, price: 1 });   // Fast category and price filtering
productSchema.index({ productId: 1 });             // Fast product lookup
productSchema.index({ featured: 1, active: 1 });   // Fast featured products query
productSchema.index({ createdAt: -1 });            // Fast sorting by date
productSchema.index({ price: 1 });                 // Price range queries
productSchema.index({ stock: 1 });                 // Stock queries
productSchema.index({ soldCount: -1 });            // Analytics: top products
productSchema.index({ category: 1, soldCount: -1 }); // Analytics: top products by category
productSchema.index({ stock: 1, category: 1 });   // Analytics: category stock analysis

// Virtual for discounted price
productSchema.virtual('discountedPrice').get(function() {
  return this.price - (this.price * this.discount / 100);
});

// Update rating when reviews change
productSchema.methods.updateRating = function() {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.rating = (sum / this.reviews.length).toFixed(1);
    this.numReviews = this.reviews.length;
  }
};

module.exports = mongoose.model('Product', productSchema);
