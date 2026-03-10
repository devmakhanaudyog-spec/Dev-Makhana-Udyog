const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const BulkOrder = require('../models/BulkOrder');
const FreeSample = require('../models/FreeSample');
const { protect, admin } = require('../middleware/auth');

router.use(protect, admin);

// Dashboard analytics with enhanced metrics
router.get('/dashboard', async (req, res) => {
  const startTime = Date.now();
  try {
    // Set today to start of day (midnight) for accurate "today" counting
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const last3Months = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
    const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

    // ===== OPTIMIZED: Parallel Queries using Promise.all() =====
    const [
      orderStats,
      productStats,
      userStats,
      revenueStats,
      ordersByStatus,
      paymentStats,
      recentOrders,
      topProducts,
      categoryStats,
      bulkOrderStats,
      freeSampleStats
    ] = await Promise.all([
      // Order aggregation - combine all order counts
      Order.aggregate([
        {
          $facet: {
            totalOrders: [
              { $group: { _id: null, count: { $sum: 1 } } }
            ],
            ordersToday: [
              { $match: { createdAt: { $gte: today } } },
              { $group: { _id: null, count: { $sum: 1 } } }
            ],
            ordersThisWeek: [
              { $match: { createdAt: { $gte: lastWeek } } },
              { $group: { _id: null, count: { $sum: 1 } } }
            ],
            ordersThisMonth: [
              { $match: { createdAt: { $gte: lastMonth } } },
              { $group: { _id: null, count: { $sum: 1 } } }
            ],
            ordersLastMonth: [
              { $match: { createdAt: { $gte: new Date(today.getFullYear(), today.getMonth() - 2, today.getDate()), $lt: lastMonth } } },
              { $group: { _id: null, count: { $sum: 1 } } }
            ]
          }
        }
      ]),
      
      // Product aggregation - combine all product stats
      Product.aggregate([
        {
          $facet: {
            totalProducts: [
              { $group: { _id: null, count: { $sum: 1 } } }
            ],
            stockStats: [
              {
                $group: {
                  _id: null,
                  avgStock: { $avg: '$stock' },
                  minStock: { $min: '$stock' },
                  maxStock: { $max: '$stock' },
                  sumStock: { $sum: '$stock' },
                  lowStockCount: {
                    $sum: { $cond: [{ $and: [{ $lte: ['$stock', 10] }, { $gt: ['$stock', 0] }] }, 1, 0] }
                  },
                  outOfStockCount: {
                    $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] }
                  }
                }
              }
            ]
          }
        }
      ]),
      
      // User aggregation - combine user counts
      User.aggregate([
        {
          $facet: {
            totalUsers: [
              { $match: { role: 'user' } },
              { $group: { _id: null, count: { $sum: 1 } } }
            ],
            newUsersThisMonth: [
              { $match: { role: 'user', createdAt: { $gte: lastMonth } } },
              { $group: { _id: null, count: { $sum: 1 } } }
            ],
            newUsersToday: [
              { $match: { role: 'user', createdAt: { $gte: today } } },
              { $group: { _id: null, count: { $sum: 1 } } }
            ]
          }
        }
      ]),
      
      // Revenue aggregation - combine all revenue calculations
      Order.aggregate([
        {
          $facet: {
            totalRevenue: [
              { $match: { paymentStatus: 'Paid' } },
              { $group: { _id: null, total: { $sum: '$totalPrice' } } }
            ],
            revenueToday: [
              { $match: { paymentStatus: 'Paid', createdAt: { $gte: today } } },
              { $group: { _id: null, total: { $sum: '$totalPrice' } } }
            ],
            revenueThisMonth: [
              { $match: { paymentStatus: 'Paid', createdAt: { $gte: lastMonth } } },
              { $group: { _id: null, total: { $sum: '$totalPrice' } } }
            ],
            revenueLastMonth: [
              { $match: { paymentStatus: 'Paid', createdAt: { $gte: new Date(today.getFullYear(), today.getMonth() - 2, today.getDate()), $lt: lastMonth } } },
              { $group: { _id: null, total: { $sum: '$totalPrice' } } }
            ]
          }
        }
      ]),
      
      // Order status breakdown
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } }
      ]),
      
      // Payment status
      Order.aggregate([
        { $group: { _id: '$paymentStatus', count: { $sum: 1 }, amount: { $sum: '$totalPrice' } } }
      ]),
      
      // Recent orders (limited fields for speed)
      Order.find()
        .sort('-createdAt')
        .limit(10)
        .select('_id user createdAt totalPrice status')
        .populate('user', 'name email')
        .lean(),
      
      // Top selling products (limited fields)
      Product.find()
        .sort('-soldCount')
        .limit(10)
        .select('name soldCount price images stock category')
        .lean(),
      
      // Category distribution
      Product.aggregate([
        { 
          $group: { 
            _id: '$category', 
            count: { $sum: 1 },
            totalStock: { $sum: '$stock' },
            totalSold: { $sum: '$soldCount' }
          } 
        },
        { $sort: { totalSold: -1 } }
      ]),
      
      // Bulk orders
      BulkOrder.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      
      // Free samples
      FreeSample.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    // Extract values from faceted results
    const totalOrders = orderStats[0]?.totalOrders?.[0]?.count || 0;
    const ordersToday = orderStats[0]?.ordersToday?.[0]?.count || 0;
    const ordersThisWeek = orderStats[0]?.ordersThisWeek?.[0]?.count || 0;
    const ordersThisMonth = orderStats[0]?.ordersThisMonth?.[0]?.count || 0;
    const ordersLastMonth = orderStats[0]?.ordersLastMonth?.[0]?.count || 0;

    const totalProducts = productStats[0]?.totalProducts?.[0]?.count || 0;
    const lowStockProducts = productStats[0]?.stockStats?.[0]?.lowStockCount || 0;
    const outOfStockProducts = productStats[0]?.stockStats?.[0]?.outOfStockCount || 0;

    const totalUsers = userStats[0]?.totalUsers?.[0]?.count || 0;
    const newUsersThisMonth = userStats[0]?.newUsersThisMonth?.[0]?.count || 0;
    const newUsersToday = userStats[0]?.newUsersToday?.[0]?.count || 0;

    const totalRevenue = revenueStats[0]?.totalRevenue?.[0] || { total: 0 };
    const revenueToday = revenueStats[0]?.revenueToday?.[0] || { total: 0 };
    const revenueThisMonth = revenueStats[0]?.revenueThisMonth?.[0] || { total: 0 };
    const revenueLastMonth = revenueStats[0]?.revenueLastMonth?.[0] || { total: 0 };

    // Growth metrics
    const orderGrowth = ordersLastMonth > 0 
      ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth * 100).toFixed(2)
      : 0;

    const revenueGrowth = (revenueLastMonth?.total || 0) > 0
      ? (((revenueThisMonth?.total || 0) - (revenueLastMonth?.total || 0)) / (revenueLastMonth?.total || 0) * 100).toFixed(2)
      : 0;

    const avgOrderValue = totalOrders > 0 ? (totalRevenue?.total || 0) / totalOrders : 0;

    // Get daily sales data (last 30 days)
    const dailySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get monthly revenue (last 12 months)
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: lastYear }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get top customers with optimize
    const topCustomers = await Order.aggregate([
      { $match: { user: { $exists: true } } },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);

    // Populate customer details
    const populatedTopCustomers = await User.populate(topCustomers, {
      path: '_id',
      select: 'name email'
    });

    const executionTime = Date.now() - startTime;

    res.json({
      overview: {
        totalOrders,
        ordersToday,
        ordersThisWeek,
        ordersThisMonth,
        totalRevenue: totalRevenue?.total || 0,
        revenueToday: revenueToday?.total || 0,
        revenueThisMonth: revenueThisMonth?.total || 0,
        totalProducts: totalProducts || 0,
        lowStockProducts: lowStockProducts || 0,
        outOfStockProducts: outOfStockProducts || 0,
        totalUsers,
        newUsersThisMonth,
        newUsersToday,
        avgOrderValue,
        orderGrowth: parseFloat(orderGrowth),
        revenueGrowth: parseFloat(revenueGrowth)
      },
      ordersByStatus,
      paymentStats,
      recentOrders,
      topProducts,
      dailySales,
      monthlyRevenue,
      categoryStats,
      bulkOrderStats,
      freeSampleStats,
      topCustomers: populatedTopCustomers,
      trends: {
        ordersThisMonth,
        ordersLastMonth,
        revenueThisMonth: revenueThisMonth?.total || 0,
        revenueLastMonth: revenueLastMonth?.total || 0
      },
      performance: {
        loadTimeMs: executionTime,
        message: `Loaded in ${executionTime}ms`
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint - check all products stock
router.get('/products-stock-debug', async (req, res) => {
  try {
    const allProducts = await Product.find()
      .select('name stock category price')
      .sort('-stock');

    const stats = {
      total: allProducts.length,
      outOfStock: allProducts.filter(p => p.stock === 0).length,
      lowStock: allProducts.filter(p => p.stock > 0 && p.stock <= 10).length,
      mediumStock: allProducts.filter(p => p.stock > 10 && p.stock <= 50).length,
      highStock: allProducts.filter(p => p.stock > 50).length,
      avgStock: allProducts.reduce((sum, p) => sum + p.stock, 0) / allProducts.length || 0,
      products: allProducts
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint - get only out of stock products
router.get('/out-of-stock-products', async (req, res) => {
  try {
    const outOfStockProducts = await Product.find({ stock: 0 })
      .select('name stock category price soldCount')
      .sort({ createdAt: -1 })
      .limit(20);

    const countViaQuery = await Product.countDocuments({ stock: 0 });
    
    const countViaAgg = await Product.aggregate([
      { $match: { stock: 0 } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    res.json({
      outOfStockCount_query: countViaQuery,
      outOfStockCount_aggregation: countViaAgg[0]?.count || 0,
      products: outOfStockProducts,
      total: outOfStockProducts.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sales report
router.get('/sales', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const match = { paymentStatus: 'Paid' };
    if (startDate && endDate) {
      match.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const salesData = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(salesData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Database Integrity Check Endpoint
router.get('/database-integrity', async (req, res) => {
  try {
    const stats = {
      users: {
        total: await User.countDocuments(),
        admins: await User.countDocuments({ role: 'admin' }),
        regularUsers: await User.countDocuments({ role: 'user' })
      },
      orders: {
        total: await Order.countDocuments(),
        paid: await Order.countDocuments({ paymentStatus: 'Paid' }),
        pending: await Order.countDocuments({ paymentStatus: 'Pending' }),
        failed: await Order.countDocuments({ paymentStatus: 'Failed' }),
        refunded: await Order.countDocuments({ paymentStatus: 'Refunded' })
      },
      products: {
        total: await Product.countDocuments(),
        outOfStock: await Product.countDocuments({ stock: 0 }),
        lowStock: await Product.countDocuments({ stock: { $gt: 0, $lte: 10 } }),
        mediumStock: await Product.countDocuments({ stock: { $gt: 10, $lte: 50 } }),
        highStock: await Product.countDocuments({ stock: { $gt: 50 } })
      },
      bulkOrders: {
        total: await BulkOrder.countDocuments()
      },
      freeSamples: {
        total: await FreeSample.countDocuments()
      }
    };

    console.log('\n✅ DATABASE INTEGRITY CHECK:');
    console.log(JSON.stringify(stats, null, 2));

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
