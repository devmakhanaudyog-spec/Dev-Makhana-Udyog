// Script to add makhana products from makhana.js to the database
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const fs = require('fs');
const path = require('path');

// Load makhana products from the JSON file
const makhanaDataPath = path.join(__dirname, './makhanaProducts.json');
const makhanaProducts = JSON.parse(fs.readFileSync(makhanaDataPath, 'utf-8'));

async function addMakhanaProducts() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('Missing required environment variable: MONGODB_URI');
  }
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  for (const p of makhanaProducts) {
    // Prepare product object for DB
    const product = {
      name: p.name,
      description: p.description,
      price: p.price,
      originalPrice: p.originalPrice,
      discount: p.discount,
      grade: p.grade,
      popRate: p.popRate,
      moisture: p.moisture,
      packaging: p.packaging,
      use: p.use,
      moq: p.moq,
      images: p.images,
      mainImage: p.images && p.images[0] ? p.images[0] : '',
      category: 'Makhana',
      subCategory: p.subCategory || 'Plain Makhana',
      productId: p.id,
      stock: typeof p.stock === 'number' ? p.stock : 1000,
    };
    await Product.findOneAndUpdate({ productId: p.id }, product, { upsert: true, new: true });
  }
  await mongoose.disconnect();
  console.log('Makhana products added/updated.');
}

addMakhanaProducts().catch(err => {
  console.error('Error adding makhana products:', err);
  process.exit(1);
});
