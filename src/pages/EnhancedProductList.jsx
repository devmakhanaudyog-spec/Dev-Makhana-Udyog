import React, { useState, useCallback, useMemo } from 'react';
import { Search, Filter, ShoppingCart, Grid3x3, List, ChevronUp, ChevronDown, ShieldCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../utils/api.js';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';

const DEFAULT_CATEGORIES = [
  'Plain Makhana',
  'Roasted Makhana',
  'Makhana Dessert',
  'Makhana Powder',
  'Makhana Shake',
  'Save On Bundles'
];
const CATEGORY_ORDER = [
  'Plain Makhana',
  'Roasted Makhana',
  'Makhana Dessert',
  'Makhana Powder',
  'Makhana Shake',
  'Save On Bundles'
];

const HERO_BY_CATEGORY = {
  all: {
    badge: 'GI-tagged Mithila lots',
    title: 'Best Selling Makhana',
    description: 'Browse complete collection across plain, roasted, dessert, powder, shake, and bundle categories.',
    stats: [
      { value: '76', label: 'Curated products' },
      { value: '6', label: 'Core categories' },
      { value: 'GI', label: 'Mithila origin' },
      { value: '24-48h', label: 'Sample dispatch' }
    ]
  },
  'Plain Makhana': {
    badge: 'Naturally light and crunchy',
    title: 'Plain Makhana Collection',
    description: 'Premium, classic, mini, and family packs for daily snacking, gifting, and bulk requirements.',
    stats: [
      { value: '10', label: 'Plain SKUs' },
      { value: '99%+', label: 'Pop rate' },
      { value: '< 3%', label: 'Moisture' },
      { value: '50kg+', label: 'Bulk MOQ' }
    ]
  },
  'Roasted Makhana': {
    badge: 'Ready-to-eat range',
    title: 'Roasted Makhana Snacks',
    description: 'Flavor-first roasted range with pouches and can formats for modern retail and quick snacking.',
    stats: [
      { value: '21', label: 'Roasted SKUs' },
      { value: '2', label: 'Pack formats' },
      { value: '8+', label: 'Popular flavors' },
      { value: 'High', label: 'Repeat demand' }
    ]
  },
  'Makhana Dessert': {
    badge: 'Instant dessert line',
    title: 'Makhana Kheer & Dessert Mixes',
    description: 'Classic and flavor-led pre-mixes in convenient pack sizes for everyday and festive desserts.',
    stats: [
      { value: '17', label: 'Dessert SKUs' },
      { value: '6+', label: 'Flavor options' },
      { value: '100g', label: 'Core size' },
      { value: 'Quick', label: 'Prep friendly' }
    ]
  },
  'Makhana Powder': {
    badge: 'Fine and textured grind',
    title: 'Makhana Powder Range',
    description: 'Nutrient-rich powder options for shakes, desserts, baby food, and fasting recipes.',
    stats: [
      { value: '3', label: 'Powder SKUs' },
      { value: 'Fine', label: 'Grind quality' },
      { value: '< 3%', label: 'Moisture' },
      { value: '30kg+', label: 'MOQ' }
    ]
  },
  'Makhana Shake': {
    badge: 'Wholesome drink mixes',
    title: 'Makhana Shake Premix Collection',
    description: 'Smooth flavored shake mixes in regular and trial formats for health-focused consumers.',
    stats: [
      { value: '15', label: 'Shake SKUs' },
      { value: '300g', label: 'Main pack' },
      { value: '132g', label: 'Trial pack' },
      { value: 'Creamy', label: 'Texture' }
    ]
  },
  'Save On Bundles': {
    badge: 'Combo savings range',
    title: 'Makhana Value Bundles',
    description: 'Cross-category bundles crafted for better savings on family and festival purchases.',
    stats: [
      { value: '10', label: 'Bundle SKUs' },
      { value: 'Up to 30%', label: 'Savings' },
      { value: 'Multi', label: 'Category mix' },
      { value: 'Gift', label: 'Ready packs' }
    ]
  }
};
const MAX_PRICE_LIMIT = 10000;

export default function EnhancedProductList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    maxPrice: MAX_PRICE_LIMIT,
    availability: 'all',
    rating: 0,
    sort: 'featured',
    page: 1,
    limit: 12
  });

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [expandedFilters, setExpandedFilters] = useState({
    category: true,
    availability: true,
    price: true,
    rating: true
  });

  const fetchProducts = useCallback(async () => {
    try {
      // Pull a broad catalog once, then apply filters/sort/pagination on client
      // so behavior is consistent even if backend ignores some sort keys.
      const res = await axios.get('/api/products?limit=500&page=1');
      return res.data;
    } catch (error) {
      toast.error('Failed to load products');
      throw error;
    }
  }, []);

  const { data, isLoading } = useQuery(
    ['products-catalog'],
    fetchProducts,
    { staleTime: 5 * 60 * 1000 }
  );

  const allProducts = useMemo(() => data?.products || [], [data]);
  const currentHero = HERO_BY_CATEGORY[filters.category] || HERO_BY_CATEGORY.all;

  const makhanaCategories = useMemo(() => {
    const fromApi = Array.from(
      new Set(
        allProducts
          .map((p) => p.subCategory || p.category)
          .filter((category) => Boolean(category) && category !== 'Makhana')
      )
    );
    const merged = Array.from(new Set([...fromApi, ...DEFAULT_CATEGORIES]));
    const orderMap = new Map(CATEGORY_ORDER.map((category, index) => [category, index]));
    merged.sort((a, b) => {
      const aIdx = orderMap.has(a) ? orderMap.get(a) : CATEGORY_ORDER.length;
      const bIdx = orderMap.has(b) ? orderMap.get(b) : CATEGORY_ORDER.length;
      if (aIdx === bIdx) return a.localeCompare(b);
      return aIdx - bIdx;
    });
    return merged.map((category) => ({ name: category, value: category }));
  }, [allProducts]);

  const filteredAndSortedProducts = useMemo(() => {
    const searchLower = filters.search.trim().toLowerCase();
    const selectedCategory = String(filters.category || 'all').trim().toLowerCase();

    const resolveStock = (product) => {
      const directStock = Number(product.stock);
      if (Number.isFinite(directStock)) return directStock;

      const countInStock = Number(product.countInStock);
      if (Number.isFinite(countInStock)) return countInStock;

      if (typeof product.inStock === 'boolean') return product.inStock ? 1 : 0;

      const stockText = String(product.stockStatus || product.availability || '').toLowerCase();
      if (stockText.includes('out') || stockText.includes('unavailable')) return 0;
      if (stockText.includes('in') || stockText.includes('available')) return 1;

      return 0;
    };

    const filtered = allProducts.filter((p) => {
      const price = Number(p.price) || 0;
      const stock = resolveStock(p);
      const rating = Number(p.rating) || 0;
      const name = (p.name || '').toLowerCase();
      const description = (p.description || '').toLowerCase();
      const grade = String(p.grade || '').toLowerCase();
      const productCategory = String(p.subCategory || p.category || '').trim().toLowerCase();

      const matchSearch =
        !searchLower ||
        name.includes(searchLower) ||
        description.includes(searchLower) ||
        grade.includes(searchLower);
      const matchCategory =
        selectedCategory === 'all' ||
        productCategory === selectedCategory;
      const matchPrice = price <= filters.maxPrice;
      const matchAvailability =
        filters.availability === 'all' ||
        (filters.availability === 'inStock' && stock > 0) ||
        (filters.availability === 'outOfStock' && stock <= 0);
      const matchRating = filters.rating === 0 || rating >= filters.rating;

      return matchSearch && matchCategory && matchPrice && matchAvailability && matchRating;
    });

    const sorted = [...filtered].sort((a, b) => {
      const aPrice = Number(a.price) || 0;
      const bPrice = Number(b.price) || 0;
      const aRating = Number(a.rating) || 0;
      const bRating = Number(b.rating) || 0;
      const aReviews = Number(a.numReviews) || 0;
      const bReviews = Number(b.numReviews) || 0;
      const aDate = new Date(a.createdAt || 0).getTime();
      const bDate = new Date(b.createdAt || 0).getTime();

      switch (filters.sort) {
        case 'best-selling':
          return bReviews - aReviews || bRating - aRating;
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'price':
          return aPrice - bPrice;
        case '-price':
          return bPrice - aPrice;
        case 'date-old':
          return aDate - bDate;
        case 'date-new':
          return bDate - aDate;
        case '-rating':
          return bRating - aRating;
        case 'featured':
        default:
          return (Number(b.discount) || 0) - (Number(a.discount) || 0) || bRating - aRating;
      }
    });

    return sorted;
  }, [allProducts, filters]);

  const totalFiltered = filteredAndSortedProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / filters.limit));
  const currentPage = Math.min(filters.page, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * filters.limit;
    return filteredAndSortedProducts.slice(start, start + filters.limit);
  }, [filteredAndSortedProducts, currentPage, filters.limit]);

  const handleFilterChange = (key, value) => {
    if (key === 'page') {
      setFilters({ ...filters, [key]: value });
      return;
    }
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      maxPrice: MAX_PRICE_LIMIT,
      availability: 'all',
      rating: 0,
      sort: 'featured',
      page: 1,
      limit: 12
    });
  };

  const toggleFilterSection = (section) => {
    setExpandedFilters({
      ...expandedFilters,
      [section]: !expandedFilters[section]
    });

  };

  const openProductDetail = (product) => {
    const productId = product.productId || product._id || product.id;
    if (!productId) return;
    navigate(`/product/${productId}`);
  };

  return (
    <div className="bg-brand-soft min-h-screen">
      {/* Header Banner */}
      <section className="bg-brand-gradient text-white">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2 max-w-2xl">
            <p className="pill-brand bg-white/15 text-white inline-flex items-center gap-2"><ShieldCheck size={16} /> {currentHero.badge}</p>
            <h1 className="text-3xl font-bold">{currentHero.title}</h1>
            <p className="text-white/90 text-sm">{currentHero.description}</p>
            <div className="flex gap-2 flex-wrap">
              <Link to="/makhana-sample" className="bg-white text-brand px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-95 transition shadow-brand">Get Sample</Link>
              <Link to="/order-bulk" className="btn-brand-ghost bg-white text-brand px-4 py-2 rounded-lg text-sm font-semibold">Order in Bulk</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {currentHero.stats.map((stat) => (
              <div key={stat.label} className="bg-white/10 p-3 rounded-xl">
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="opacity-80 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <div className="bg-white shadow-sm sticky top-0 z-30 p-4">
        <div className="w-full max-w-[1700px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pb-1">
            <div className="min-w-0 w-full sm:flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => handleFilterChange('category', 'all')}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold border-2 transition ${
                  filters.category === 'all'
                    ? 'bg-green-700 text-white border-green-700 shadow-sm'
                    : 'bg-green-50 text-green-900 border-green-300 hover:bg-green-100 hover:border-green-500'
                }`}
              >
                All
              </button>
              {makhanaCategories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => handleFilterChange('category', cat.value)}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold border-2 transition ${
                    filters.category === cat.value
                      ? 'bg-green-700 text-white border-green-700 shadow-sm'
                      : 'bg-green-50 text-green-900 border-green-300 hover:bg-green-100 hover:border-green-500'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-auto shrink-0 flex items-center gap-2 sm:ml-auto">
              <div className="relative flex-1 sm:flex-none sm:w-[220px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-8 pr-2.5 py-1.5 border border-green-200 rounded-full text-xs focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white"
                />
              </div>
              <button
                type="button"
                className="whitespace-nowrap px-2.5 py-1.5 text-xs rounded-full bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                onClick={() => handleFilterChange('page', 1)}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-[1700px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[320px,1fr] gap-8">
          {/* Sidebar Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-gradient-to-b from-green-100 via-emerald-100 to-green-50 rounded-2xl shadow-xl border-2 border-green-300 ring-1 ring-green-200 p-6 sticky top-24 max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar">
              {/* Header */}
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-green-300">
                <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                <button
                  onClick={resetFilters}
                  className="text-xs font-semibold text-green-800 hover:text-green-900 hover:bg-white/70 px-3 py-1 rounded-lg transition"
                >
                  Reset All
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-4 p-4 rounded-xl bg-white/75 border border-green-200">
                <button
                  onClick={() => toggleFilterSection('category')}
                  className="flex justify-between items-center w-full mb-3 text-gray-900 font-semibold hover:text-green-700 transition"
                >
                  <span>Category</span>
                  {expandedFilters.category ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expandedFilters.category && (
                  <div className="space-y-2">
                    <label
                      className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 cursor-pointer transition-all ${
                        filters.category === 'all'
                          ? 'border-green-600 bg-green-600 text-white shadow-sm'
                          : 'border-green-200 bg-white text-slate-700 hover:border-green-400 hover:bg-green-50'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={filters.category === 'all'}
                        onChange={() => handleFilterChange('category', 'all')}
                        className="sr-only"
                      />
                      <span className="text-sm font-semibold">All Products</span>
                      <span
                        className={`h-4 w-4 rounded-full border-2 ${
                          filters.category === 'all' ? 'border-white bg-white/90' : 'border-green-500 bg-transparent'
                        }`}
                      />
                    </label>
                    {makhanaCategories.map((cat) => (
                      <label
                        key={cat.value}
                        className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 cursor-pointer transition-all ${
                          filters.category === cat.value
                            ? 'border-green-600 bg-green-600 text-white shadow-sm'
                            : 'border-green-200 bg-white text-slate-700 hover:border-green-400 hover:bg-green-50'
                        }`}
                      >
                        <input
                          type="radio"
                          checked={filters.category === cat.value}
                          onChange={() => handleFilterChange('category', cat.value)}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium">{cat.name}</span>
                        <span
                          className={`h-4 w-4 rounded-full border-2 ${
                            filters.category === cat.value ? 'border-white bg-white/90' : 'border-green-500 bg-transparent'
                          }`}
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Availability Filter */}
              <div className="mb-4 p-4 rounded-xl bg-white/75 border border-green-200">
                <button
                  onClick={() => toggleFilterSection('availability')}
                  className="flex justify-between items-center w-full mb-3 text-gray-900 font-semibold hover:text-green-700 transition"
                >
                  <span>Availability</span>
                  {expandedFilters.availability ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expandedFilters.availability && (
                  <div className="space-y-2">
                    <label
                      className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 cursor-pointer transition-all ${
                        filters.availability === 'all'
                          ? 'border-green-600 bg-green-600 text-white shadow-sm'
                          : 'border-green-200 bg-white text-slate-700 hover:border-green-400 hover:bg-green-50'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={filters.availability === 'all'}
                        onChange={() => handleFilterChange('availability', 'all')}
                        className="sr-only"
                      />
                      <span className="text-sm font-semibold">All Products</span>
                      <span
                        className={`h-4 w-4 rounded-full border-2 ${
                          filters.availability === 'all' ? 'border-white bg-white/90' : 'border-green-500 bg-transparent'
                        }`}
                      />
                    </label>
                    <label
                      className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 cursor-pointer transition-all ${
                        filters.availability === 'inStock'
                          ? 'border-green-600 bg-green-600 text-white shadow-sm'
                          : 'border-green-200 bg-white text-slate-700 hover:border-green-400 hover:bg-green-50'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={filters.availability === 'inStock'}
                        onChange={() => handleFilterChange('availability', 'inStock')}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">In Stock</span>
                      <span
                        className={`h-4 w-4 rounded-full border-2 ${
                          filters.availability === 'inStock' ? 'border-white bg-white/90' : 'border-green-500 bg-transparent'
                        }`}
                      />
                    </label>
                    <label
                      className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 cursor-pointer transition-all ${
                        filters.availability === 'outOfStock'
                          ? 'border-green-600 bg-green-600 text-white shadow-sm'
                          : 'border-green-200 bg-white text-slate-700 hover:border-red-300 hover:bg-red-50/40'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={filters.availability === 'outOfStock'}
                        onChange={() => handleFilterChange('availability', 'outOfStock')}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">Out of Stock</span>
                      <span
                        className={`h-4 w-4 rounded-full border-2 ${
                          filters.availability === 'outOfStock' ? 'border-white bg-white/90' : 'border-red-400 bg-transparent'
                        }`}
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Price Range Filter */}
              <div className="mb-4 p-4 rounded-xl bg-white/75 border border-green-200">
                <button
                  onClick={() => toggleFilterSection('price')}
                  className="flex justify-between items-center w-full mb-3 text-gray-900 font-semibold hover:text-green-700 transition"
                >
                  <span>Price Range</span>
                  {expandedFilters.price ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expandedFilters.price && (
                  <div className="space-y-3 ml-2">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Price Up To</label>
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        step="50"
                        value={filters.maxPrice}
                        onChange={(e) => {
                          const nextMax = parseInt(e.target.value, 10) || 10000;
                          handleFilterChange('maxPrice', nextMax);
                        }}
                        className="w-full accent-green-600 mt-2"
                      />
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900">
                        ₹0 — ₹{filters.maxPrice}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Rating Filter */}
              <div className="p-4 rounded-xl bg-white/75 border border-green-200">
                <button
                  onClick={() => toggleFilterSection('rating')}
                  className="flex justify-between items-center w-full mb-3 text-gray-900 font-semibold hover:text-green-700 transition"
                >
                  <span>Rating</span>
                  {expandedFilters.rating ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expandedFilters.rating && (
                  <div className="space-y-2 ml-2">
                    <select
                      value={filters.rating}
                      onChange={(e) => handleFilterChange('rating', parseInt(e.target.value))}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value={0}>All Ratings</option>
                      <option value={5}>★★★★★ (5 stars)</option>
                      <option value={4}>★★★★☆ (4 stars & up)</option>
                      <option value={3}>★★★☆☆ (3 stars & up)</option>
                    </select>
                  </div>
                )}
              </div>

            </div>

            {/* Promotion Block (outside filter container) */}
            <div className="mt-5 rounded-2xl p-4 bg-gradient-to-br from-green-700 via-green-600 to-emerald-600 text-white shadow-lg">
              <p className="text-[10px] uppercase tracking-[0.18em] text-green-100">Special Promotion</p>
              <h4 className="text-lg font-bold mt-1">Healthy Makhana Deals</h4>
              <p className="text-sm text-green-50 mt-2 leading-relaxed">
                Save more on combo packs and bulk orders. Get premium Mithila-origin makhana with direct dispatch and quality assurance.
              </p>
              <div className="mt-4 space-y-2 text-xs text-green-50">
                <p>Up to 30% off on selected bundles</p>
                <p>Free guidance for category-wise restocking</p>
                <p>Fast support on WhatsApp for order queries</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  to="/products"
                  className="text-center rounded-lg bg-white text-green-700 font-semibold py-2 text-xs hover:bg-green-50 transition"
                >
                  View Offers
                </Link>
                <Link
                  to="/contact"
                  className="text-center rounded-lg border border-white/60 text-white font-semibold py-2 text-xs hover:bg-white/10 transition"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div>
            {/* Top Bar - View Controls */}
            <div className="bg-white rounded-xl shadow-brand border border-green-50 p-4 mb-6 sticky top-24 z-20">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                {/* Left: Filter Toggle + Product Count */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
                  >
                    <Filter size={18} />
                    Filters
                  </button>
                  <p className="text-sm text-gray-600 font-semibold">
                    {paginatedProducts.length} of {totalFiltered} products
                  </p>
                </div>

                {/* Middle: Sort */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-gray-700">Sort by:</label>
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white font-medium text-gray-700"
                  >
                    <option value="featured">Featured</option>
                    <option value="best-selling">Best Selling</option>
                    <option value="name-asc">Alphabetically A-Z</option>
                    <option value="name-desc">Alphabetically Z-A</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-price">Price: High to Low</option>
                    <option value="date-new">Newest First</option>
                    <option value="date-old">Oldest First</option>
                    <option value="-rating">Rating: High to Low</option>
                  </select>
                </div>

                {/* Right: View Mode + Items Per Page */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded transition ${
                        viewMode === 'grid'
                          ? 'bg-white text-green-700 shadow-md'
                          : 'text-gray-600 hover:text-green-700'
                      }`}
                      title="Grid View"
                    >
                      <Grid3x3 size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded transition ${
                        viewMode === 'list'
                          ? 'bg-white text-green-700 shadow-md'
                          : 'text-gray-600 hover:text-green-700'
                      }`}
                      title="List View"
                    >
                      <List size={18} />
                    </button>
                  </div>

                  <select
                    value={filters.limit}
                    onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white font-medium text-gray-700 text-sm"
                  >
                    <option value={6}>6 per page</option>
                    <option value={12}>12 per page</option>
                    <option value={24}>24 per page</option>
                    <option value={48}>48 per page</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-100 border-t-green-700"></div>
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-brand border border-green-50 p-16 text-center">
                <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-xl font-semibold text-gray-600 mb-2">No products found</p>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search criteria</p>
                <button
                  onClick={resetFilters}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                {/* Products Grid */}
                {viewMode === 'grid' ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedProducts.map((product) => (
                      <ProductCard
                        key={product._id || product.productId || product.id}
                        product={product}
                        viewMode="grid"
                        onOpenDetails={openProductDetail}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paginatedProducts.map((product) => (
                      <ProductCard
                        key={product._id || product.productId || product.id}
                        product={product}
                        viewMode="list"
                        onOpenDetails={openProductDetail}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-12 mb-8">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handleFilterChange('page', i + 1)}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                          currentPage === i + 1
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 border hover:border-green-600 hover:text-green-700'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
