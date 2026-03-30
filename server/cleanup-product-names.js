// Script to clean product names by removing weight suffixes and handling duplicates
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function cleanupProductNames() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('Missing required environment variable: MONGODB_URI');
  }

  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');
    console.log('\n' + '='.repeat(60));
    console.log('PRODUCT NAME CLEANUP SCRIPT');
    console.log('='.repeat(60));

    // Fetch all products
    const allProducts = await Product.find({ active: true }).sort({ createdAt: 1 });
    console.log(`\n📦 Total active products found: ${allProducts.length}\n`);

    if (allProducts.length === 0) {
      console.log('No products found!');
      return;
    }

    // Step 1: Remove weight suffixes from product names
    console.log('STEP 1: Removing weight suffixes from product names');
    console.log('-'.repeat(60));

    const weightRegex = /\s*\(\d+\.?\d*\s*(?:g|kg|gm|kilogram|gram)\)?/gi;
    const updatedProducts = [];
    let removedCount = 0;

    for (const product of allProducts) {
      const originalName = product.name;
      const cleanedName = product.name.replace(weightRegex, '').trim();

      if (originalName !== cleanedName) {
        updatedProducts.push({
          productId: product._id,
          originalName: originalName,
          cleanedName: cleanedName
        });
        removedCount++;
      }

      product.name = cleanedName;
    }

    console.log(`✅ Found and cleaned ${removedCount} products with weight suffixes\n`);

    // Display before/after examples
    if (removedCount > 0) {
      console.log('Examples of cleaned names:');
      updatedProducts.slice(0, 5).forEach((item, index) => {
        console.log(`  ${index + 1}. "${item.originalName}" → "${item.cleanedName}"`);
      });
      if (removedCount > 5) {
        console.log(`  ... and ${removedCount - 5} more`);
      }
    }

    // Step 2: Find and handle duplicate names
    console.log('\n\nSTEP 2: Finding and handling duplicate product names');
    console.log('-'.repeat(60));

    const nameMap = {};
    const duplicates = [];

    // Group products by cleaned name
    for (const product of updatedProducts) {
      const cleanedName = product.cleanedName;
      if (!nameMap[cleanedName]) {
        nameMap[cleanedName] = [];
      }
      nameMap[cleanedName].push({
        id: product.productId,
        originalName: product.originalName
      });
    }

    // Identify duplicates
    for (const [cleanedName, products] of Object.entries(nameMap)) {
      if (products.length > 1) {
        duplicates.push({
          name: cleanedName,
          count: products.length,
          products: products
        });
      }
    }

    console.log(`✅ Found ${duplicates.length} duplicate names (${duplicates.reduce((sum, d) => sum + d.count, 0)} total duplicate entries)\n`);

    // Display duplicates
    if (duplicates.length > 0) {
      console.log('Duplicates found:');
      duplicates.forEach((dup, index) => {
        console.log(`\n  ${index + 1}. "${dup.name}" (${dup.count} entries)`);
        dup.products.forEach((prod, idx) => {
          console.log(`     [${idx + 1}] ID: ${prod.id} | Original: "${prod.originalName}"`);
        });
      });
    }

    // Step 3: Save cleaned names and prepare for duplicate removal
    console.log('\n\nSTEP 3: Saving cleaned names and preparing duplicate removal');
    console.log('-'.repeat(60));

    const bulkOps = [];
    const toRemoveIds = [];

    // Update all cleaned names
    for (const product of updatedProducts) {
      bulkOps.push({
        updateOne: {
          filter: { _id: product.productId },
          update: { $set: { name: product.cleanedName } }
        }
      });
    }

    // Mark duplicates for removal (keep first, remove rest)
    for (const dup of duplicates) {
      for (let i = 1; i < dup.products.length; i++) {
        toRemoveIds.push(dup.products[i].id);
        bulkOps.push({
          updateOne: {
            filter: { _id: dup.products[i].id },
            update: { $set: { active: false } }
          }
        });
      }
    }

    // Execute bulk operations
    if (bulkOps.length > 0) {
      const result = await Product.collection.bulkWrite(bulkOps);
      console.log(`✅ Updated ${result.modifiedCount} products`);
      if (toRemoveIds.length > 0) {
        console.log(`✅ Deactivated ${toRemoveIds.length} duplicate products`);
      }
    }

    // Summary
    console.log('\n\n' + '='.repeat(60));
    console.log('CLEANUP SUMMARY');
    console.log('='.repeat(60));
    console.log(`📝 Weight suffixes removed: ${removedCount}`);
    console.log(`🔄 Named updated to remove weight: ${bulkOps.filter(op => op.updateOne).length}`);
    console.log(`❌ Duplicate products deactivated: ${toRemoveIds.length}`);
    console.log(`\n⚠️  Deactivated Products (Safe to delete later if needed):`);
    toRemoveIds.forEach((id, idx) => {
      console.log(`   ${idx + 1}. ${id}`);
    });

    console.log('\n✨ Cleanup completed successfully!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.\n');
  }
}

// Run the cleanup
cleanupProductNames().catch(console.error);
