// Script to remove all non-Makhana products from the database
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function cleanProducts() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('Missing required environment variable: MONGODB_URI');
  }
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  const result = await Product.deleteMany({ category: { $ne: 'Makhana' } });
  console.log(`Deleted ${result.deletedCount} non-Makhana products.`);
  await mongoose.disconnect();
}

cleanProducts().catch(err => {
  console.error('Error cleaning products:', err);
  process.exit(1);
});
