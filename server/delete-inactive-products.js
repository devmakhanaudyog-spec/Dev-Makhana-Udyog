// Script to permanently delete inactive products from the database
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function deleteInactiveProducts() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('Missing required environment variable: MONGODB_URI');
  }

  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');
    console.log('\n' + '='.repeat(70));
    console.log('DELETE INACTIVE PRODUCTS SCRIPT');
    console.log('='.repeat(70));

    // Get all inactive products
    const inactiveProducts = await Product.find({ active: false }).sort({ name: 1 });
    console.log(`\n📦 Found ${inactiveProducts.length} inactive products to delete\n`);

    if (inactiveProducts.length === 0) {
      console.log('No inactive products found. Database is clean!');
      return;
    }

    // Display products to be deleted
    console.log('Products to be deleted:');
    console.log('-'.repeat(70));
    inactiveProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product._id}`);
      console.log(`   Price: ₹${product.price} | Stock: ${product.stock} | Reviews: ${product.numReviews}`);
      console.log('');
    });

    // Delete inactive products
    console.log('\n' + '='.repeat(70));
    console.log('DELETION IN PROGRESS...');
    console.log('='.repeat(70));

    const result = await Product.deleteMany({ active: false });

    console.log(`\n✅ Successfully deleted ${result.deletedCount} inactive products\n`);

    // Verify deletion
    const remainingInactive = await Product.find({ active: false });
    const activeProducts = await Product.find({ active: true });

    console.log('='.repeat(70));
    console.log('FINAL DATABASE STATUS');
    console.log('='.repeat(70));
    console.log(`✅ Active Products: ${activeProducts.length}`);
    console.log(`❌ Inactive Products: ${remainingInactive.length}`);
    console.log(`📦 Total Products: ${activeProducts.length + remainingInactive.length}`);

    console.log('\n✨ Database cleanup completed! Only active products remain.\n');

  } catch (error) {
    console.error('❌ Error during deletion:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.\n');
  }
}

// Run the deletion
deleteInactiveProducts().catch(console.error);
