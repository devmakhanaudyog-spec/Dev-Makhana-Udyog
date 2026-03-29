import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function ProductQuickView({ product, onClose, onOpenDetails, isInWishlist, onAddToWishlist }) {
  const { addToCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const images = product.images && product.images.length > 0 ? product.images : [product.mainImage];
  const currentImage = images[currentImageIndex];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart!`);
    setQuantity(1);
    onClose();
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToWishlist(product);
  };

  const originalPrice = product.discount > 0 
    ? Math.round(product.price / (1 - product.discount / 100))
    : product.price;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">Quick View</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="flex flex-col gap-4">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden h-72 md:h-96 flex items-center justify-center">
                {currentImage ? (
                  <img 
                    src={currentImage} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">No image available</div>
                )}
                {product.discount > 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                    -{product.discount}%
                  </div>
                )}
                {product.stock <= 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold text-lg">OUT OF STOCK</span>
                  </div>
                )}
              </div>

              {/* Image Navigation */}
              {images.length > 1 && (
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevImage}
                    className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex gap-2 flex-1">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`flex-1 rounded-lg overflow-hidden border-2 transition ${
                          idx === currentImageIndex ? 'border-green-600' : 'border-gray-300 hover:border-green-400'
                        }`}
                      >
                        <img src={img} alt={`View ${idx + 1}`} className="w-full h-16 object-cover" />
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleNextImage}
                    className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="flex flex-col justify-between">
              <div>
                <h3 className="text-3xl font-bold mb-2">{product.name}</h3>
                
                {/* Rating */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex text-yellow-400">
                    {'★'.repeat(Math.round(product.rating || 0))}
                    {'☆'.repeat(5 - Math.round(product.rating || 0))}
                  </div>
                  <span className="text-sm text-gray-600">({product.numReviews || 0} reviews)</span>
                </div>

                {/* Price */}
                <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-brand">₹{product.price}</span>
                    {product.discount > 0 && (
                      <>
                        <span className="text-xl text-gray-400 line-through">₹{originalPrice}</span>
                        <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                          Save {product.discount}%
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description || 'Premium quality makhana product from Dev Makhana Udyog. Expertly selected and processed for maximum taste and nutritional value.'}
                  </p>
                </div>

                {/* Product Details */}
                {product.grade && (
                  <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
                    {product.grade && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Grade</p>
                        <p className="font-semibold text-gray-900">{product.grade}</p>
                      </div>
                    )}
                    {product.popRate && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Pop Rate</p>
                        <p className="font-semibold text-gray-900">{product.popRate}</p>
                      </div>
                    )}
                    {product.moisture && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Moisture</p>
                        <p className="font-semibold text-gray-900">{product.moisture}</p>
                      </div>
                    )}
                    {product.packaging && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Packaging</p>
                        <p className="font-semibold text-gray-900">{product.packaging}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Stock Status */}
                <div className="mb-6">
                  {product.stock > 0 ? (
                    <p className="text-sm text-green-600 font-semibold">✓ In Stock ({product.stock} available)</p>
                  ) : (
                    <p className="text-sm text-red-600 font-semibold">✗ Out of Stock</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {product.stock > 0 ? (
                  <>
                    <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm font-semibold text-gray-700">Quantity:</span>
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-200 transition"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-12 text-center border-l border-r py-1 focus:outline-none"
                          min="1"
                        />
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-200 transition"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:shadow-lg transition"
                    >
                      <ShoppingCart size={20} />
                      Add to Cart
                    </button>
                  </>
                ) : (
                  <button disabled className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-bold cursor-not-allowed">
                    Out of Stock
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onOpenDetails(product)}
                  className="w-full py-3 rounded-lg font-bold border-2 border-green-600 text-green-700 hover:bg-green-50 transition"
                >
                  View Full Details
                </button>

                <button
                  onClick={handleAddToWishlist}
                  className={`w-full py-3 rounded-lg font-bold border-2 transition flex items-center justify-center gap-2 ${
                    isInWishlist
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-green-600 text-green-700 hover:bg-green-50'
                  }`}
                >
                  <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
                  {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
