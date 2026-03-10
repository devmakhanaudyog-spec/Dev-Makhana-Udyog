const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const cloudinary = require('../cloudinary');
const { protect, admin } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Protect all routes
router.use(protect, admin);

// Image upload endpoint
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const result = await cloudinary.uploader.upload_stream({
      folder: 'products',
      resource_type: 'image',
    }, (error, result) => {
      if (error) return res.status(500).json({ error: error.message });
      res.json({ url: result.secure_url });
    });
    result.end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
