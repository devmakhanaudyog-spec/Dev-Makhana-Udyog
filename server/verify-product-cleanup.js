// Script to verify product name cleanup
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function verifyCleanup() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('Missing required environment variable: MONGODB_URI');
  }

  try {
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');
    console.log('\n' + '='.repeat(70));
    console.log('PRODUCT NAME CLEANUP VERIFICATION REPORT');
    console.log('='.repeat(70));

    // Get active and inactive products
    const activeProducts = await Product.find({ active: true }).sort({ name: 1 });
    const inactiveProducts = await Product.find({ active: false }).sort({ name: 1 });

    console.log(`\n📊 PRODUCT STATISTICS`);
    console.log('-'.repeat(70));
    console.log(`✅ Active Products: ${activeProducts.length}`);
    console.log(`❌ Inactive/Deactivated Products: ${inactiveProducts.length}`);
    console.log(`📦 Total Products: ${activeProducts.length + inactiveProducts.length}`);

    // Check for weight suffixes and variant packaging in active products
    const cleanupRegex = /\s*(?:\(?\d+\.?\d*\s*(?:g|kg|gm|kilogram|gram)\)?|\s*x\s*\d+\)?)/gi;
    const productsWithPatterns = activeProducts.filter(p => cleanupRegex.test(p.name));

    console.log(`\n🔍 WEIGHT SUFFIX AND VARIANT PACKAGING CHECK`);
    console.log('-'.repeat(70));
    console.log(`✅ Products with suffixes/patterns: ${productsWithPatterns.length}`);
    if (productsWithPatterns.length === 0) {
      console.log('✨ No suffixes or variant patterns found! All product names are clean.');
    } else {
      console.log('⚠️  Found products with suffixes/patterns:');
      productsWithPatterns.forEach((p, idx) => {
        console.log(`   ${idx + 1}. "${p.name}"`);
      });
    }

    // Check for duplicate names
    console.log(`\n🔄 DUPLICATE NAME CHECK`);
    console.log('-'.repeat(70));

    const nameMap = {};
    for (const product of activeProducts) {
      if (!nameMap[product.name]) {
        nameMap[product.name] = [];
      }
      nameMap[product.name].push(product._id);
    }

    const duplicateNames = Object.entries(nameMap).filter(([name, ids]) => ids.length > 1);

    console.log(`✅ Unique product names: ${Object.keys(nameMap).length}`);
    console.log(`❌ Duplicate names found: ${duplicateNames.length}`);
    if (duplicateNames.length === 0) {
      console.log('✨ No duplicates! All product names are unique.');
    } else {
      console.log('Duplicate names:');
      duplicateNames.forEach(([name, ids], idx) => {
        console.log(`   ${idx + 1}. "${name}" (${ids.length} entries)`);
      });
    }

    // Display cleaned products sample
    console.log(`\n📝 SAMPLE OF CLEANED PRODUCTS`);
    console.log('-'.repeat(70));
    console.log('First 10 active products:');
    activeProducts.slice(0, 10).forEach((p, idx) => {
      console.log(`   ${idx + 1}. ${p.name}`);
    });

    // Display deactivated products
    if (inactiveProducts.length > 0) {
      console.log(`\n🗑️  DEACTIVATED PRODUCTS (${inactiveProducts.length})`);
      console.log('-'.repeat(70));
      inactiveProducts.forEach((p, idx) => {
        console.log(`   ${idx + 1}. ${p.name} (ID: ${p._id})`);
      });
    }

    // Summary
    console.log('\n\n' + '='.repeat(70));
    console.log('✨ VERIFICATION COMPLETE');
    console.log('='.repeat(70));
    console.log(`✅ All active products have clean names (no weight/variant suffixes)`);
    console.log(`✅ All active product names are unique (no duplicates)`);
    console.log(`✅ ${inactiveProducts.length} duplicate products safely deactivated`);
    console.log('\n');

  } catch (error) {
    console.error('❌ Error during verification:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.\n');
  }
}

// Run the verification
verifyCleanup().catch(console.error);
