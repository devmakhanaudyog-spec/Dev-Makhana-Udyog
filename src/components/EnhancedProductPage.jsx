import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Heart, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function ProductPage() {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedVariants, setSelectedVariants] = useState({});
  const [loading, setLoading] = useState(true);

  const { cart, addToCart, isInCart, isInWishlist, addToWishlist, removeFromWishlist } = useCart();
  const { user } = useAuth();

  const fetchProduct = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/products/${productId}`);
      setProduct(res.data);
      setReviews(res.data.reviews || []);
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId, fetchProduct]);

  const handleAddToCart = () => {
    if (!product) return;
    const productId = product._id || product.id;
    const inCart = isInCart(productId);
    console.log('Product ID:', productId, 'Is in cart:', inCart, 'Cart:', cart);
    if (inCart) {
      navigate('/cart');
      return;
    }
    addToCart(product, quantity);
    toast.success(`Added ${quantity} to cart`);
    setQuantity(1);
  };

  const handleWishlist = () => {
    if (!user) {
      toast.error('Please login first');
      return;
    }

    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to review');
      return;
    }

    try {
      await axios.post(`/api/reviews/${productId}`, {
        rating,
        comment,
        images: []
      });

      toast.success('Review submitted successfully');
      setShowReviewForm(false);
      setComment('');
      setRating(5);
      
      // Refresh reviews
      fetchProduct();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-12">Product not found</div>;
  }

  const images = product.images || [product.mainImage];
  const inWishlist = isInWishlist(product._id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <div className="flex gap-2 mb-8 text-sm text-gray-600">
        <a href="/" className="hover:text-pink-600">Home</a>
        <span>/</span>
        <a href="/products" className="hover:text-pink-600">Products</a>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div>
          <div className="mb-4">
            <img 
              src={images[selectedImage]} 
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg bg-gray-100"
            />
          </div>
          <div className="flex gap-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                  selectedImage === idx ? 'border-pink-500' : 'border-gray-200'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div>
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">({product.numReviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-pink-600">₹{product.price}</span>
                {product.discount > 0 && (
                  <>
                    <span className="text-lg text-gray-400 line-through">₹{product.originalPrice || product.price}</span>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                      {product.discount}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                {product.variants.map((variant) => (
                  <div key={variant.name} className="mb-4">
                    <label className="block text-sm font-medium mb-2">{variant.name}</label>
                    <div className="flex gap-2">
                      {variant.options.map((option) => (
                        <button
                          key={option}
                          onClick={() => setSelectedVariants({...selectedVariants, [variant.name]: option})}
                          className={`px-4 py-2 border rounded-lg transition ${
                            selectedVariants[variant.name] === option
                              ? 'bg-pink-500 text-white border-pink-500'
                              : 'border-gray-300 hover:border-pink-500'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <div className="flex items-center border rounded-lg w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 text-center border-l border-r"
                  min="1"
                  max="10"
                />
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3 rounded-lg font-semibold hover:opacity-90 transition ${
                  isInCart(product._id || product.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gradient-to-r from-pink-500 to-red-500 text-white'
                }`}
              >
                {isInCart(product._id || product.id) ? 'Go to Cart' : 'Add to Cart'}
              </button>
              <button
                onClick={handleWishlist}
                className={`px-6 py-3 rounded-lg border-2 font-semibold transition ${
                  inWishlist
                    ? 'bg-red-50 border-red-500 text-red-500'
                    : 'border-gray-300 text-gray-700 hover:border-pink-500'
                }`}
              >
                <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} className="inline mr-2" />
                Wishlist
              </button>
            </div>

            {/* Product Info */}
            <div className="space-y-3 border-t pt-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Stock:</span>
                <span className={product.stock > 0 ? 'text-green-600 font-semibold' : 'text-red-600'}>
                  {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-semibold">{product.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery:</span>
                <span className="font-semibold">{product.delivery}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-16 border-t pt-8">
        <h2 className="text-2xl font-bold mb-4">Description</h2>
        <p className="text-gray-700 leading-relaxed mb-8">{product.description}</p>
      </div>

      {/* Reviews Section */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-bold mb-8">Reviews</h2>

        {user && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="mb-8 px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            Write a Review
          </button>
        )}

        {showReviewForm && user && (
          <form onSubmit={handleSubmitReview} className="mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1"
                  >
                    <Star
                      size={32}
                      className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this product..."
              className="w-full p-3 border rounded-lg mb-4"
              rows="4"
              required
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Submit Review
            </button>
          </form>
        )}

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-gray-600">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold">{review.userName}</div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  </div>
                  {review.verified && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Verified Purchase
                    </span>
                  )}
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
