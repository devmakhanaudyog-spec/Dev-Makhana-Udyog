const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const cloudinary = require('../cloudinary');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Get all products with filters, search, sort, pagination
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      category, 
      minPrice, 
      maxPrice, 
      rating, 
      sort = '-createdAt', 
      page = 1, 
      limit = 20,
      featured
    } = req.query;

    let query = { active: true };

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Featured products
    if (featured === 'true') {
      query.featured = true;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Always sort by newest first unless overridden
    let products = await Product.find(query)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limitNum)
      .select('-reviews');

    // Fix image URLs for deployment - convert relative paths to absolute public URLs
    products = products.map(product => {
      const productObj = product.toObject();
      const API_URL = (
        process.env.API_URL ||
        process.env.PUBLIC_API_URL ||
        `http://localhost:${process.env.PORT || 5000}`
      ).replace(/\/$/, '');
      
      if (productObj.mainImage && productObj.mainImage.startsWith('/')) {
        productObj.mainImage = `${API_URL}${productObj.mainImage}`;
      }
      
      if (Array.isArray(productObj.images)) {
        productObj.images = productObj.images.map(img => {
          if (img && typeof img === 'string' && img.startsWith('/')) {
            return `${API_URL}${img}`;
          }
          return img;
        });
      }
      
      return productObj;
    });

    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get price range
router.get('/meta/price-range', async (req, res) => {
  try {
    const minProduct = await Product.findOne({ active: true }).sort('price').select('price');
    const maxProduct = await Product.findOne({ active: true }).sort('-price').select('price');
    
    res.json({
      min: minProduct?.price || 0,
      max: maxProduct?.price || 10000
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product by ID (must be last to avoid shadowing /meta/* routes)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('relatedProducts', 'name price images mainImage rating');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// Create a new product with images uploaded to Cloudinary
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      // Upload each image to Cloudinary
      for (const file of req.files) {
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream({ folder: 'products' }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }).end(file.buffer);
        });
        imageUrls.push(uploadResult.secure_url);
      }
    }
    // Create product with Cloudinary image URLs
    const product = new Product({
      ...req.body,
      images: imageUrls,
      mainImage: imageUrls[0] || '',
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product images (Cloudinary)
router.put('/:id/images', upload.array('images', 5), async (req, res) => {
  try {
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream({ folder: 'products' }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }).end(file.buffer);
        });
        imageUrls.push(uploadResult.secure_url);
      }
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { images: imageUrls, mainImage: imageUrls[0] || '' },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
