import React, { useState, useCallback } from 'react';
import { Search, Filter, ShoppingCart, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/api.js';
import { useQuery } from 'react-query';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function EnhancedProductList() {
  const navigate = useNavigate();
  const { addToCart, addToWishlist, isInWishlist } = useCart();
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    minPrice: 0,
    maxPrice: 10000,
    rating: 0,
    sort: '-createdAt',
    page: 1
  });

  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category !== 'all') params.append('category', filters.category);
      params.append('minPrice', filters.minPrice);
      params.append('maxPrice', filters.maxPrice);
      if (filters.rating > 0) params.append('rating', filters.rating);
      params.append('sort', filters.sort);
      params.append('page', filters.page);
      params.append('limit', 20);

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

  const categories = ['Home Decor', 'Jewelry', 'Pottery', 'Textiles', 'Accessories', 'Art'];

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      minPrice: 0,
      maxPrice: 10000,
      rating: 0,
      sort: '-createdAt',
      page: 1
    });
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const handleAddToWishlist = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(product._id)) {
      toast.info('Already in wishlist');
      return;
    }
    addToWishlist(product);
    toast.success('Added to wishlist!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar */}
      <div className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block md:col-span-1`}>
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Filters</h3>
                <button onClick={resetFilters} className="text-sm text-pink-600 hover:text-pink-700">
                  Reset
                </button>
              </div>

              {/* Category */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Category</h4>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Price Range</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm">
                    <span>₹{filters.minPrice}</span>
                    <span>₹{filters.maxPrice}</span>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Rating</h4>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', parseInt(e.target.value))}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value={0}>All Ratings</option>
                  <option value={4}>4★ & above</option>
                  <option value={3}>3★ & above</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <h4 className="font-semibold mb-3">Sort By</h4>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="-createdAt">Newest</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-price">Price: High to Low</option>
                  <option value="-rating">Rating: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="md:col-span-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 mb-4 px-4 py-2 bg-white rounded-lg shadow"
            >
              <Filter size={20} />
              Filters
            </button>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
              </div>
            ) : data?.products?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No products found matching your filters</p>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data?.products?.map((product) => (
                    <div
                      key={product._id}
                      className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden group flex flex-col"
                    >
                      <a 
                        href={`/product/${product._id}`} 
                        className="block"
                      >
                        <div className="relative overflow-hidden bg-gray-200 h-48">
                          <img
                            src={product.mainImage || product.images?.[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition"
                          />
                          {product.discount > 0 && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                              -{product.discount}%
                            </div>
                          )}
                          {product.stock <= 0 && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">OUT OF STOCK</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex-grow">
                          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 h-12">{product.name}</h3>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex text-yellow-400">
                              {'★'.repeat(Math.round(product.rating || 0))}
                              {'☆'.repeat(5 - Math.round(product.rating || 0))}
                            </div>
                            <span className="text-xs text-gray-600">({product.numReviews || 0})</span>
                          </div>

                          <div className="flex justify-between items-center mb-3">
                            <div>
                              <span className="text-lg font-bold text-pink-600">₹{product.price}</span>
                              {product.discount > 0 && (
                                <span className="text-xs text-gray-400 line-through ml-2">
                                  ₹{Math.round(product.price / (1 - product.discount / 100))}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </a>
                      
                      {/* Action Buttons */}
                      <div className="p-4 pt-0 flex gap-2">
                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={product.stock <= 0}
                          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <ShoppingCart size={18} />
                          {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        <button
                          onClick={() => navigate('/cart')}
                          disabled={product.stock <= 0}
                          className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {product.stock <= 0 ? 'Out of Stock' : 'Go to Cart'}
                        </button>
                        <button
                          onClick={(e) => handleAddToWishlist(e, product)}
                          className={`p-2 rounded-lg border-2 transition ${
                            isInWishlist(product._id)
                              ? 'border-red-500 bg-red-50 text-red-600'
                              : 'border-pink-500 text-pink-600 hover:bg-pink-50'
                          }`}
                          title="Add to Wishlist"
                        >
                          <Heart size={20} fill={isInWishlist(product._id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {data?.pagination?.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {[...Array(data.pagination.pages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handleFilterChange('page', i + 1)}
                        className={`px-4 py-2 rounded-lg transition ${
                          filters.page === i + 1
                            ? 'bg-pink-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
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
