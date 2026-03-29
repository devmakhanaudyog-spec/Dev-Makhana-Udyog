import React from 'react';
import { ShoppingCart, Heart, Eye } from 'lucide-react';

export default function ProductCard({ product, onQuickView, onAddToCart, onAddToWishlist, isInWishlist, viewMode = 'grid' }) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-4 mb-4">
        <div className="flex gap-6">
          {/* Image */}
          <div className="flex-shrink-0">
            <div className="relative w-32 h-32 bg-gray-200 rounded-lg overflow-hidden group">
              <img
                src={product.mainImage || product.images?.[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition"
              />
              {product.discount > 0 && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                  -{product.discount}%
                </div>
              )}
              {product.stock <= 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">OUT OF STOCK</span>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-grow">
            <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
            
            <div className="flex items-center gap-2 mb-2">
              <div className="flex text-yellow-400 text-sm">
                {'★'.repeat(Math.round(product.rating || 0))}
                {'☆'.repeat(5 - Math.round(product.rating || 0))}
              </div>
              <span className="text-xs text-gray-600">({product.numReviews || 0})</span>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-pink-600">₹{product.price}</span>
                {product.discount > 0 && (
                  <span className="text-sm text-gray-400 line-through">
                    ₹{Math.round(product.price / (1 - product.discount / 100))}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onQuickView(product)}
                  className="p-2 rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 transition tooltip"
                  title="Quick View"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => onAddToCart(product)}
                  disabled={product.stock <= 0}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                >
                  <ShoppingCart size={16} />
                  Add
                </button>
                <button
                  onClick={() => onAddToWishlist(product)}
                  className={`p-2 rounded-lg border-2 transition ${
                    isInWishlist(product._id)
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-pink-500 text-pink-600 hover:bg-pink-50'
                  }`}
                  title="Add to Wishlist"
                >
                  <Heart size={18} fill={isInWishlist(product._id) ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-2xl transition overflow-hidden group flex flex-col h-full">
      {/* Image Section */}
      <div className="relative overflow-hidden bg-gray-200 h-56">
        <img
          src={product.mainImage || product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
        />
        
        {/* Badges */}
        {product.discount > 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            -{product.discount}%
          </div>
        )}

        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold z-10">OUT OF STOCK</span>
          </div>
        )}

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center">
          <button
            onClick={() => onQuickView(product)}
            className="opacity-0 group-hover:opacity-100 transition transform group-hover:scale-100 scale-90 bg-white text-gray-900 px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Eye size={20} />
            Quick View
          </button>
        </div>

        {/* Stock Status */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-orange-500 text-white text-xs font-bold text-center py-1">
            Only {product.stock} left in stock!
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 h-14 flex items-center text-sm md:text-base">
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex text-yellow-400 text-sm">
            {'★'.repeat(Math.round(product.rating || 0))}
            {'☆'.repeat(5 - Math.round(product.rating || 0))}
          </div>
          <span className="text-xs text-gray-600">({product.numReviews || 0})</span>
        </div>

        {/* Price */}
        <div className="mb-3 flex-grow">
          <div className="flex items-baseline gap-2">
            <span className="text-xl md:text-2xl font-bold text-pink-600">₹{product.price}</span>
            {product.discount > 0 && (
              <span className="text-xs md:text-sm text-gray-400 line-through">
                ₹{Math.round(product.price / (1 - product.discount / 100))}
              </span>
            )}
          </div>
          {product.discount > 0 && (
            <p className="text-xs text-green-600 font-semibold mt-1">Save {product.discount}%</p>
          )}
        </div>

        {/* Description Preview */}
        {product.grade && (
          <p className="text-xs text-gray-600 mb-3">
            <span className="font-semibold">{product.grade}</span>
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 pt-0 space-y-2">
        <button
          onClick={() => onAddToCart(product)}
          disabled={product.stock <= 0}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
        >
          <ShoppingCart size={16} />
          {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => onQuickView(product)}
            className="flex-1 py-2 px-3 border-2 border-blue-500 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition text-sm flex items-center justify-center gap-1"
          >
            <Eye size={16} />
            View
          </button>
          <button
            onClick={() => onAddToWishlist(product)}
            className={`p-2 rounded-lg border-2 transition flex-shrink-0 ${
              isInWishlist(product._id)
                ? 'border-red-500 bg-red-50 text-red-600'
                : 'border-pink-500 text-pink-600 hover:bg-pink-50'
            }`}
            title="Add to Wishlist"
          >
            <Heart size={18} fill={isInWishlist(product._id) ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  );
}
