import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, Users, ShoppingCart, DollarSign, Package, 
  AlertCircle, ArrowUp, ArrowDown, Clock, CheckCircle, XCircle, Truck,
  Calendar, Download, RefreshCw, BarChart3, PieChart, Activity
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import axios from '../../utils/api.js';
import toast from 'react-hot-toast';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
);

export default function AnalyticsTab() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const isDev = process.env.NODE_ENV === 'development';

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/analytics/dashboard');
      if (isDev) {
        console.log('Analytics Response:', res.data);
        console.log('Overview Object:', res.data.overview);
        console.log('Low Stock:', res.data.overview?.lowStockProducts);
        console.log('Out of Stock:', res.data.overview?.outOfStockProducts);
      }
      setAnalytics(res.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [isDev]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  const { overview, dailySales, monthlyRevenue, ordersByStatus, categoryStats, topProducts, topCustomers, recentOrders } = analytics;

  // Safe data extraction with fallbacks
  const safeOverview = overview || {};
  const safeDailySales = Array.isArray(dailySales) ? dailySales : [];
  const safeMonthlyRevenue = Array.isArray(monthlyRevenue) ? monthlyRevenue : [];
  const safeOrdersByStatus = Array.isArray(ordersByStatus) ? ordersByStatus : [];
  const safeCategoryStats = Array.isArray(categoryStats) ? categoryStats : [];
  const safeTopProducts = Array.isArray(topProducts) ? topProducts : [];
  const safeTopCustomers = Array.isArray(topCustomers) ? topCustomers : [];
  const safeRecentOrders = Array.isArray(recentOrders) ? recentOrders : [];

  if (isDev) {
    console.log('=== ANALYTICS DATA DEBUG ===');
    console.log('Overview Keys:', Object.keys(safeOverview));
    console.log('Daily Sales Count:', safeDailySales.length);
    console.log('Monthly Revenue Count:', safeMonthlyRevenue.length);
    console.log('Orders by Status:', safeOrdersByStatus);
    console.log('Category Stats:', safeCategoryStats);
    console.log('=== END DEBUG ===');
  }

  // Prepare chart data
  const last30Days = safeDailySales.length > 0 ? safeDailySales : [];
  const salesChartData = {
    labels: last30Days.map(d => {
      try {
        return new Date(d._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } catch (e) {
        return d._id || 'N/A';
      }
    }),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: last30Days.map(d => d.revenue),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Orders',
        data: last30Days.map(d => d.orders),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  const salesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.dataset.label === 'Revenue (₹)') {
              label += '₹' + context.parsed.y.toLocaleString();
            } else {
              label += context.parsed.y;
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        grid: {
          display: false
        }
      }
    },
  };

  // Monthly revenue chart
  const monthlyRevenueData = {
    labels: (safeMonthlyRevenue || []).map(m => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[m._id.month - 1]} ${m._id.year}`;
    }),
    datasets: [
      {
        label: 'Monthly Revenue',
        data: (safeMonthlyRevenue || []).map(m => m.revenue || 0),
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(14, 165, 233, 0.8)',
        ],
        borderRadius: 8,
      }
    ]
  };

  const monthlyRevenueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return '₹' + context.parsed.y.toLocaleString();
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function(value) {
            return '₹' + (value / 1000) + 'K';
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  // Order status doughnut chart
  const orderStatusData = {
    labels: (safeOrdersByStatus || []).map(s => s._id || 'Unknown'),
    datasets: [
      {
        data: (safeOrdersByStatus || []).map(s => s.count || 0),
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  const categoryChartData = {
    labels: (safeCategoryStats || []).map(c => c._id || 'Uncategorized'),
    datasets: [
      {
        data: (safeCategoryStats || []).map(c => c.totalSold || 0),
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  // Export Report Handler
  const handleExportReport = () => {
    try {
      const timestamp = new Date().toLocaleDateString();
      const csvData = `ANALYTICS REPORT - ${timestamp}\n\n`;
      
      let csv = csvData;
      csv += `TOTAL REVENUE,₹${(safeOverview.totalRevenue || 0).toLocaleString()}\n`;
      csv += `REVENUE TODAY,₹${(safeOverview.revenueToday || 0).toLocaleString()}\n`;
      csv += `REVENUE THIS MONTH,₹${(safeOverview.revenueThisMonth || 0).toLocaleString()}\n`;
      csv += `TOTAL ORDERS,${safeOverview.totalOrders || 0}\n`;
      csv += `ORDERS TODAY,${safeOverview.ordersToday || 0}\n`;
      csv += `ORDERS THIS WEEK,${safeOverview.ordersThisWeek || 0}\n`;
      csv += `ORDERS THIS MONTH,${safeOverview.ordersThisMonth || 0}\n`;
      csv += `ORDER GROWTH (MoM),${safeOverview.orderGrowth || 0}%\n`;
      csv += `REVENUE GROWTH (MoM),${safeOverview.revenueGrowth || 0}%\n`;
      csv += `AVERAGE ORDER VALUE,₹${Math.round(safeOverview.avgOrderValue || 0).toLocaleString()}\n`;
      csv += `TOTAL USERS,${safeOverview.totalUsers || 0}\n`;
      csv += `NEW USERS THIS MONTH,${safeOverview.newUsersThisMonth || 0}\n`;
      csv += `NEW USERS TODAY,${safeOverview.newUsersToday || 0}\n`;
      csv += `TOTAL PRODUCTS,${safeOverview.totalProducts || 0}\n`;
      csv += `LOW STOCK PRODUCTS,${safeOverview.lowStockProducts || 0}\n`;
      csv += `OUT OF STOCK PRODUCTS,${safeOverview.outOfStockProducts || 0}\n\n`;

      // Add top products
      csv += `TOP SELLING PRODUCTS\nRank,Name,Price,Stock,Sold Count\n`;
      (safeTopProducts || []).slice(0, 10).forEach((product, index) => {
        csv += `${index + 1},"${product.name}",${product.price},${product.stock},${product.soldCount || 0}\n`;
      });

      csv += `\nTOP CUSTOMERS\nRank,Name,Email,Total Spent,Orders\n`;
      (safeTopCustomers || []).slice(0, 10).forEach((customer, index) => {
        csv += `${index + 1},"${customer._id?.name || 'User'}","${customer._id?.email || ''}",${customer.totalSpent || 0},${customer.orderCount || 0}\n`;
      });

      // Create blob and download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `Analytics_Report_${new Date().getTime()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Report exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics & Insights</h1>
          <p className="text-slate-600 mt-1">Comprehensive business intelligence and performance metrics</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition" onClick={handleExportReport}>
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <DollarSign size={24} />
            </div>
            {safeOverview.revenueGrowth !== undefined && (
              <div className={`flex items-center gap-1 text-sm font-semibold ${safeOverview.revenueGrowth >= 0 ? 'text-green-100' : 'text-red-200'}`}>
                {safeOverview.revenueGrowth >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                {Math.abs(safeOverview.revenueGrowth)}%
              </div>
            )}
          </div>
          <h3 className="text-sm font-medium opacity-90">Total Revenue</h3>
          <p className="text-3xl font-bold mt-2">₹{(safeOverview.totalRevenue || 0).toLocaleString()}</p>
          <p className="text-sm opacity-75 mt-2">
            ₹{(safeOverview.revenueToday || 0).toLocaleString()} today
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <ShoppingCart size={24} />
            </div>
            {safeOverview.orderGrowth !== undefined && (
              <div className={`flex items-center gap-1 text-sm font-semibold ${safeOverview.orderGrowth >= 0 ? 'text-blue-100' : 'text-red-200'}`}>
                {safeOverview.orderGrowth >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                {Math.abs(safeOverview.orderGrowth)}%
              </div>
            )}
          </div>
          <h3 className="text-sm font-medium opacity-90">Total Orders</h3>
          <p className="text-3xl font-bold mt-2">{(safeOverview.totalOrders || 0).toLocaleString()}</p>
          <p className="text-sm opacity-75 mt-2">
            {safeOverview.ordersToday || 0} today, {safeOverview.ordersThisWeek || 0} this week
          </p>
        </div>

        {/* Average Order Value */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-orange-100">
              <Activity size={16} />
            </div>
          </div>
          <h3 className="text-sm font-medium opacity-90">Avg Order Value</h3>
          <p className="text-3xl font-bold mt-2">₹{Math.round(safeOverview.avgOrderValue || 0).toLocaleString()}</p>
          <p className="text-sm opacity-75 mt-2">
            Per transaction average
          </p>
        </div>

        {/* Total Users */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Users size={24} />
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-purple-100">
              <ArrowUp size={16} />
              New
            </div>
          </div>
          <h3 className="text-sm font-medium opacity-90">Total Users</h3>
          <p className="text-3xl font-bold mt-2">{(safeOverview.totalUsers || 0).toLocaleString()}</p>
          <p className="text-sm opacity-75 mt-2">
            +{safeOverview.newUsersThisMonth || 0} this month
          </p>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Package className="text-blue-600" size={20} />
            </div>
            <h3 className="font-semibold text-slate-900">Products</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-2">{(safeOverview.totalProducts || 0).toLocaleString()}</p>
          <div className="space-y-1 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Low Stock:</span>
              <span className="font-semibold text-orange-600">{(safeOverview.lowStockProducts || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Out of Stock:</span>
              <span className="font-semibold text-red-600">{(safeOverview.outOfStockProducts || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <h3 className="font-semibold text-slate-900">This Month</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-2">₹{(safeOverview.revenueThisMonth || 0).toLocaleString()}</p>
          <div className="space-y-1 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Orders:</span>
              <span className="font-semibold text-slate-900">{safeOverview.ordersThisMonth || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>New Users:</span>
              <span className="font-semibold text-slate-900">{safeOverview.newUsersThisMonth || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Clock className="text-purple-600" size={20} />
            </div>
            <h3 className="font-semibold text-slate-900">Today</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-2">₹{(safeOverview.revenueToday || 0).toLocaleString()}</p>
          <div className="space-y-1 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Orders:</span>
              <span className="font-semibold text-slate-900">{safeOverview.ordersToday || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>New Users:</span>
              <span className="font-semibold text-slate-900">{safeOverview.newUsersToday || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Sales Trend</h3>
              <p className="text-sm text-slate-600">Revenue and orders over the last 30 days</p>
            </div>
            <BarChart3 className="text-slate-400" size={24} />
          </div>
          <div style={{ height: '300px' }}>
            <Line data={salesChartData} options={salesChartOptions} />
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Order Status</h3>
              <p className="text-sm text-slate-600">Current distribution</p>
            </div>
            <PieChart className="text-slate-400" size={24} />
          </div>
          <div style={{ height: '300px' }}>
            <Doughnut data={orderStatusData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Monthly Revenue & Category Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Monthly Revenue</h3>
              <p className="text-sm text-slate-600">Last 12 months performance</p>
            </div>
            <Calendar className="text-slate-400" size={24} />
          </div>
          <div style={{ height: '300px' }}>
            <Bar data={monthlyRevenueData} options={monthlyRevenueOptions} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Sales by Category</h3>
              <p className="text-sm text-slate-600">Product category breakdown</p>
            </div>
            <PieChart className="text-slate-400" size={24} />
          </div>
          <div style={{ height: '300px' }}>
            <Doughnut data={categoryChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Top Products & Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Top Selling Products</h3>
          <div className="space-y-3">
            {(safeTopProducts || []).slice(0, 5).map((product, index) => (
              <div key={product._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                {product.images && product.images[0] && (
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{product.name}</p>
                  <p className="text-sm text-slate-600">₹{product.price} • Stock: {product.stock}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{product.soldCount || 0}</p>
                  <p className="text-xs text-slate-500">sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Top Customers</h3>
          <div className="space-y-3">
            {(safeTopCustomers || []).slice(0, 5).map((customer, index) => (
              <div key={customer._id?._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {customer._id?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{customer._id?.name || 'User'}</p>
                  <p className="text-sm text-slate-600 truncate">{customer._id?.email || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-600">₹{(customer.totalSpent || 0).toLocaleString()}</p>
                  <p className="text-xs text-slate-500">{customer.orderCount || 0} orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(safeRecentOrders || []).map((order) => (
                <tr key={order._id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 text-sm font-mono text-slate-900">#{order._id?.slice(-8) || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium text-slate-900">{order.user?.name || 'Guest'}</p>
                      <p className="text-xs text-slate-500">{order.user?.email || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                    ₹{(order.totalPrice || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status === 'delivered' && <CheckCircle size={12} />}
                      {order.status === 'shipped' && <Truck size={12} />}
                      {order.status === 'cancelled' && <XCircle size={12} />}
                      {order.status || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
