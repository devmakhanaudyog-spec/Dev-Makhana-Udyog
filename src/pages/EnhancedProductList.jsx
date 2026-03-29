import React, { useState, useCallback } from 'react';
import { Search, Filter, ShoppingCart, Heart, Grid3x3, List, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/api.js';
import { useQuery } from 'react-query';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';
import ProductQuickView from '../components/ProductQuickView';

export default function EnhancedProductList() {
  const navigate = useNavigate();
  const { addToCart, addToWishlist, isInWishlist } = useCart();
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    minPrice: 0,
    maxPrice: 10000,
    tempMinPrice: 0,
    tempMaxPrice: 10000,
    availability: 'all',
    rating: 0,
    sort: 'featured',
    page: 1,
    limit: 12
  });

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [expandedFilters, setExpandedFilters] = useState({
    category: true,
    availability: true,
    price: true,
    rating: true
  });

  const makhanaCategories = [
    { name: 'Plain Makhana', value: 'plain-makhana' },
    { name: 'Roasted Makhana', value: 'roasted-makhana' },
    { name: 'Makhana Powder', value: 'makhana-powder' },
    { name: 'Makhana Shake', value: 'makhana-shake' },
    { name: 'Makhana Recipes', value: 'makhana-recipes' },
  ];

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category !== 'all') params.append('category', filters.category);
      params.append('minPrice', filters.minPrice);
      params.append('maxPrice', filters.maxPrice);
      if (filters.availability !== 'all') params.append('availability', filters.availability);
      if (filters.rating > 0) params.append('rating', filters.rating);
      params.append('sort', filters.sort);
      params.append('page', filters.page);
      params.append('limit', filters.limit);

      const res = await axios.get(`/api/products?${params}`);
      return res.data;
    } catch (error) {
      toast.error('Failed to load products');
      throw error;
    }
  }, [filters]);

  const { data, isLoading } = useQuery(
    ['products', filters],
    fetchProducts,
    { staleTime: 5 * 60 * 1000 }
  );

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const handlePriceApply = () => {
    setFilters({
      ...filters,
      minPrice: filters.tempMinPrice,
      maxPrice: filters.tempMaxPrice,
      page: 1
    });
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      minPrice: 0,
      maxPrice: 10000,
      tempMinPrice: 0,
      tempMaxPrice: 10000,
      availability: 'all',
      rating: 0,
      sort: 'featured',
      page: 1,
      limit: 12
    });
  };

  const handleAddToCart = (e, product) => {
    e?.preventDefault();
    e?.stopPropagation();
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const handleAddToWishlist = (product) => {
    if (isInWishlist(product._id)) {
      toast.info('Already in wishlist');
      return;
    }
    addToWishlist(product);
    toast.success('Added to wishlist!');
  };

  const toggleFilterSection = (section) => {
    setExpandedFilters({
      ...expandedFilters,
      [section]: !expandedFilters[section]
    });

  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-pink-500 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Premium Makhana Products</h1>
          <p className="text-pink-100">Discover our complete range of hand-picked, premium quality makhana from Dev Makhana Udyog</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white shadow-sm sticky top-0 z-30 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search makhana products..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24 max-h-[calc(100vh-100px)] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                <button
                  onClick={resetFilters}
                  className="text-xs font-semibold text-pink-600 hover:text-pink-700 hover:bg-pink-50 px-3 py-1 rounded-lg transition"
                >
                  Reset All
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6 pb-6 border-b">
                <button
                  onClick={() => toggleFilterSection('category')}
                  className="flex justify-between items-center w-full mb-3 text-gray-900 font-semibold hover:text-pink-600 transition"
                >
                  <span>Category</span>
                  {expandedFilters.category ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expandedFilters.category && (
                  <div className="space-y-2 ml-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        checked={filters.category === 'all'}
                        onChange={() => handleFilterChange('category', 'all')}
                        className="cursor-pointer"
                      />
                      <span className="text-gray-700 group-hover:text-pink-600 transition">All Products</span>
                    </label>
                    {makhanaCategories.map((cat) => (
                      <label key={cat.value} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          checked={filters.category === cat.value}
                          onChange={() => handleFilterChange('category', cat.value)}
                          className="cursor-pointer"
                        />
                        <span className="text-gray-700 group-hover:text-pink-600 transition">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Availability Filter */}
              <div className="mb-6 pb-6 border-b">
                <button
                  onClick={() => toggleFilterSection('availability')}
                  className="flex justify-between items-center w-full mb-3 text-gray-900 font-semibold hover:text-pink-600 transition"
                >
                  <span>Availability</span>
                  {expandedFilters.availability ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expandedFilters.availability && (
                  <div className="space-y-2 ml-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        checked={filters.availability === 'all'}
                        onChange={() => handleFilterChange('availability', 'all')}
                        className="cursor-pointer"
                      />
                      <span className="text-gray-700 group-hover:text-pink-600 transition">All Products</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        checked={filters.availability === 'inStock'}
                        onChange={() => handleFilterChange('availability', 'inStock')}
                        className="cursor-pointer"
                      />
                      <span className="text-gray-700 group-hover:text-green-600 transition">
                        ✓ In Stock
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        checked={filters.availability === 'outOfStock'}
                        onChange={() => handleFilterChange('availability', 'outOfStock')}
                        className="cursor-pointer"
                      />
                      <span className="text-gray-700 group-hover:text-red-600 transition">
                        ✗ Out of Stock
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Price Range Filter */}
              <div className="mb-6 pb-6 border-b">
                <button
                  onClick={() => toggleFilterSection('price')}
                  className="flex justify-between items-center w-full mb-3 text-gray-900 font-semibold hover:text-pink-600 transition"
                >
                  <span>Price Range</span>
                  {expandedFilters.price ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expandedFilters.price && (
                  <div className="space-y-3 ml-2">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Min Price</label>
                      <input
                        type="number"
                        min="0"
                        value={filters.tempMinPrice}
                        onChange={(e) => setFilters({ ...filters, tempMinPrice: parseInt(e.target.value) || 0 })}
                        className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="₹0"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Max Price</label>
                      <input
                        type="number"
                        max="10000"
                        value={filters.tempMaxPrice}
                        onChange={(e) => setFilters({ ...filters, tempMaxPrice: parseInt(e.target.value) || 10000 })}
                        className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="₹10000"
                      />
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900">
                        ₹{filters.tempMinPrice} — ₹{filters.tempMaxPrice}
                      </p>
                    </div>
                    <button
                      onClick={handlePriceApply}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition"
                    >
                      Apply Price
                    </button>
                  </div>
                )}
              </div>

              {/* Rating Filter */}
              <div>
                <button
                  onClick={() => toggleFilterSection('rating')}
                  className="flex justify-between items-center w-full mb-3 text-gray-900 font-semibold hover:text-pink-600 transition"
                >
                  <span>Rating</span>
                  {expandedFilters.rating ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expandedFilters.rating && (
                  <div className="space-y-2 ml-2">
                    <select
                      value={filters.rating}
                      onChange={(e) => handleFilterChange('rating', parseInt(e.target.value))}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
          </div>

          {/* Products Section */}
          <div className="lg:col-span-4">
            {/* Top Bar - View Controls */}
            <div className="bg-white rounded-xl shadow-lg p-4 mb-6 sticky top-24 z-20">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                {/* Left: Filter Toggle + Product Count */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
                  >
                    <Filter size={18} />
                    Filters
                  </button>
                  <p className="text-sm text-gray-600 font-semibold">
                    {data?.products?.length || 0} of {data?.total || 0} products
                  </p>
                </div>

                {/* Middle: Sort */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-gray-700">Sort by:</label>
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white font-medium text-gray-700"
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
                          ? 'bg-white text-pink-600 shadow-md'
                          : 'text-gray-600 hover:text-pink-600'
                      }`}
                      title="Grid View"
                    >
                      <Grid3x3 size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded transition ${
                        viewMode === 'list'
                          ? 'bg-white text-pink-600 shadow-md'
                          : 'text-gray-600 hover:text-pink-600'
                      }`}
                      title="List View"
                    >
                      <List size={18} />
                    </button>
                  </div>

                  <select
                    value={filters.limit}
                    onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white font-medium text-gray-700 text-sm"
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
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-600"></div>
              </div>
            ) : data?.products?.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-16 text-center">
                <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-xl font-semibold text-gray-600 mb-2">No products found</p>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search criteria</p>
                <button
                  onClick={resetFilters}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                {/* Products Grid */}
                {viewMode === 'grid' ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data?.products?.map((product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        viewMode={viewMode}
                        onQuickView={setQuickViewProduct}
                        onAddToCart={(product) => handleAddToCart(null, product)}
                        onAddToWishlist={handleAddToWishlist}
                        isInWishlist={isInWishlist}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data?.products?.map((product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        viewMode={viewMode}
                        onQuickView={setQuickViewProduct}
                        onAddToCart={(product) => handleAddToCart(null, product)}
                        onAddToWishlist={handleAddToWishlist}
                        isInWishlist={isInWishlist}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {data?.pagination?.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-12 mb-8">
                    {[...Array(data.pagination.pages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handleFilterChange('page', i + 1)}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                          filters.page === i + 1
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 border hover:border-pink-500 hover:text-pink-600'
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

      {/* Quick View Modal */}
      {quickViewProduct && (
        <ProductQuickView
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          isInWishlist={isInWishlist(quickViewProduct._id)}
          onAddToWishlist={handleAddToWishlist}
        />
      )}
    </div>
  );
}
