const mongoose = require('mongoose');
require('dotenv').config();

const verifyDatabase = async () => {
  try {
    console.log('\n🔍 MONGODB ATLAS VERIFICATION\n');
    console.log('═'.repeat(50));

    // Connect
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('Missing required environment variable: MONGODB_URI');
    }
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas');

    // Get database
    const db = mongoose.connection.db;

    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`\n📦 Collections Found: ${collections.length}`);
    collections.forEach(col => {
      console.log(`   • ${col.name}`);
    });

    // Count documents in each collection
    console.log('\n📊 Document Count:');
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`   • ${collection.name}: ${count} documents`);
    }

    // Get database stats
    const stats = await db.stats();
    console.log(`\n📈 Database Statistics:
   • Data Size: ${(stats.dataSize / 1024).toFixed(2)} KB
   • Storage Size: ${(stats.storageSize / 1024).toFixed(2)} KB
   • Collections: ${stats.collections}
   • Indexes: ${stats.indexes}`);

    // Verify Admin User
    const User = require('./models/User');
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      console.log(`\n👤 Admin User Found:
   • Email: ${admin.email}
   • Name: ${admin.name}
   • Phone: ${admin.phone}`);
    }

    // Verify Products
    const Product = require('./models/Product');
    const productCount = await Product.countDocuments();
    console.log(`\n🛍️  Products: ${productCount}`);

    // Verify Orders
    const Order = require('./models/Order');
    const orderCount = await Order.countDocuments();
    console.log(`📦 Orders: ${orderCount}`);

    // Health check
    const ping = await db.admin().ping();
    console.log(`\n🏥 Health Check: ${ping.ok === 1 ? '✅ Healthy' : '❌ Issues'}`);

    console.log('\n' + '═'.repeat(50));
    console.log('✅ DATABASE VERIFICATION COMPLETE\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Verification Error:', error.message);
    process.exit(1);
  }
};

verifyDatabase();
