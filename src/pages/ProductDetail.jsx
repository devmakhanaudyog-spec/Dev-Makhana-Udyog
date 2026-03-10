import React, { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import { makhanaProducts } from "../data/makhana";
import { API_BASE_URL } from "../config";
import { Shield, Truck, Sparkles, ClipboardList, Star, ShoppingCart, Heart, Minus, Plus, Gift } from "lucide-react";
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { generateProductSchema, generateBreadcrumbSchema } from '../utils/structuredData';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Use same ID logic as cart to ensure isInCart works correctly
  const productKey = product ? (product._id || product.id) : null;
  const imageList = useMemo(() => {
    if (!product) return [];
    if (product.images && product.images.length) return product.images;
    if (product.image) return [product.image];
    if (product.mainImage) return [product.mainImage];
    return [];
  }, [product]);
  const [activeImage, setActiveImage] = useState(imageList[0]);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewState, setReviewState] = useState("");
  const [reviewDistrict, setReviewDistrict] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [quantity, setQuantity] = useState(1);
  // Pack size selector logic (like cart)
  const PACK_OPTIONS = [
    { label: '200g', value: 0.2 },
    { label: '1kg', value: 1 },
    { label: '6kg', value: 6 },
    { label: '7kg', value: 7 },
    { label: '10kg', value: 10 },
  ];
  const [packSize, setPackSize] = useState(1); // default to 1kg
  const { cart, addToCart, addToWishlist, isInCart, isInWishlist } = useCart();

  // Scroll to top when component loads or product changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    setActiveImage(imageList[0]);
  }, [imageList]);

  // Load reviews from API
  useEffect(() => {
    if (!productKey) return;
    let isMounted = true;
    setReviewsLoading(true);

    fetch(`${API_BASE_URL}/api/reviews/${productKey}?limit=50`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to load feedback');
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setReviews(Array.isArray(data.reviews) ? data.reviews : []);
        }
      })
      .catch(() => {
        if (isMounted) setReviews([]);
      })
      .finally(() => {
        if (isMounted) setReviewsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productKey]);

  // Prefill reviewer info from profile when logged in
  useEffect(() => {
    if (!user) return;
    setReviewName((prev) => prev || user.name || "");
    setReviewState((prev) => prev || user.state || "");
    setReviewDistrict((prev) => prev || user.district || "");
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fallbackProduct = makhanaProducts.find((p) => p.id === id) || makhanaProducts[0];

    const hydrate = (p) => ({
      ...p,
      productId: p.productId || p.id,
      _id: p._id || p.id || p.productId,
    });

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        // Try listing endpoint for productId match
        const res = await fetch(`${API_BASE_URL}/api/products?limit=200`, { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
        const data = await res.json();
        const liveProducts = Array.isArray(data.products) ? data.products : [];
        const byProductId = liveProducts.find((p) => p.productId === id);
        const byLegacyId = liveProducts.find((p) => p._id === id);
        const chosen = byProductId || byLegacyId;

        if (isMounted) {
          if (chosen) {
            setProduct(hydrate(chosen));
            return;
          }
        }

        // Fallback to direct fetch by id (covers Mongo _id route)
        try {
          const detailRes = await fetch(`${API_BASE_URL}/api/products/${id}`, { signal: controller.signal });
          if (detailRes.ok) {
            const detail = await detailRes.json();
            if (isMounted) {
              setProduct(hydrate(detail));
              return;
            }
          } else {
            console.warn("Direct fetch by id failed", detailRes.status, await detailRes.text());
          }
        } catch (innerErr) {
          if (innerErr.name !== "AbortError") {
            console.warn("Direct product fetch fallback failed", innerErr);
          }
        }

        // Static fallback to keep page usable
        if (isMounted) {
          setError("Live product not available. Showing static data.");
          setProduct(hydrate(fallbackProduct));
        }
      } catch (err) {
        if (!isMounted || err.name === "AbortError") return;
        console.error("Product fetch failed", err);
        setError("Live product not available. Showing static data.");
        setProduct(hydrate(fallbackProduct));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id]);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Login to submit feedback');
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }
    if (!reviewText.trim() || !productKey) return;

    const payload = {
      rating: reviewRating,
      comment: reviewText.trim(),
      state: reviewState.trim(),
      district: reviewDistrict.trim(),
      name: reviewName.trim()
    };

    const token = localStorage.getItem('token');
    const headers = token
      ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      : { 'Content-Type': 'application/json' };

    fetch(`/api/reviews/${productKey}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Could not submit feedback');
        }
        return res.json();
      })
      .then((data) => {
        if (data?.review) {
          setReviews((prev) => [data.review, ...prev]);
        }
        toast.success('Feedback submitted');
        setReviewName("");
        setReviewState("");
        setReviewDistrict("");
        setReviewText("");
        setReviewRating(5);
      })
      .catch((err) => {
        toast.error(err.message || 'Failed to submit feedback');
      });
  };

  const handleAddToCart = () => {
    if (!product) return;
    const inCart = isInCart(productKey);
    console.log('Product key:', productKey, 'Is in cart:', inCart, 'Cart:', cart);
    if (inCart) {
      navigate('/cart');
      return;
    }
    addToCart(product, quantity);
    toast.success(`Added ${quantity} ${product.name} to cart!`);
  };

  const handleAddToWishlist = () => {
    if (!product) return;
    if (isInWishlist(productKey)) {
      toast.info('Already in wishlist');
      return;
    }
    addToWishlist(product);
    toast.success('Added to wishlist!');
  };

  const increaseQty = () => setQuantity(prev => Math.min(prev + 1, 10));
  const decreaseQty = () => setQuantity(prev => Math.max(prev - 1, 1));

  if (loading && !product) {
    return (
      <div className="bg-brand-soft min-h-screen flex items-center justify-center text-slate-700">
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-brand-soft min-h-screen flex items-center justify-center text-slate-700">
        Product not found.
      </div>
    );
  }


  return (
    <>
      {/* SEO Meta Tags and Structured Data */}
      <Helmet>
        <title>{product.name} | Buy Premium Makhana | Makhaantraa Foods</title>
        <meta name="description" content={`${product.description} Order ${product.name} at ₹${product.price}. ${product.grade} grade, ${product.popRate} pop rate. GI-certified Mithila makhana.`} />
        <meta name="keywords" content={`${product.name}, buy makhana, ${product.grade}, makhana price, ${product.category}, fox nuts, lotus seeds`} />
        <link rel="canonical" href={`https://www.makhaantraafoods.com/product/${productKey}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${product.name} | Makhaantraa Foods`} />
        <meta property="og:description" content={product.description} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`https://www.makhaantraafoods.com/product/${productKey}`} />
        <meta property="og:image" content={activeImage || product.mainImage || product.image} />
        <meta property="product:price:amount" content={product.price} />
        <meta property="product:price:currency" content="INR" />
        
        {/* Product Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(generateProductSchema(product))}
        </script>
        
        {/* Breadcrumb Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(generateBreadcrumbSchema([
            { name: "Home", url: "https://www.makhaantraafoods.com" },
            { name: "Products", url: "https://www.makhaantraafoods.com/products" },
            { name: product.name, url: `https://www.makhaantraafoods.com/product/${productKey}` }
          ]))}
        </script>
      </Helmet>

      <div className="bg-brand-soft min-h-screen">
      <section className="bg-white shadow-brand border-b border-green-50">
        <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <p className="pill-brand inline-flex items-center gap-2"><Shield size={16} /> GI-tagged Mithila</p>
            <h1 className="text-4xl font-bold text-slate-900">{product.name}</h1>
            <p className="text-slate-700 text-lg leading-relaxed">{product.description}</p>
            <div className="grid grid-cols-2 gap-3 text-sm text-slate-700">
              <div className="bg-green-50 rounded-lg p-3"><div className="text-xs text-slate-500">Grade</div><div className="font-semibold">{product.grade || "-"}</div></div>
              <div className="bg-green-50 rounded-lg p-3"><div className="text-xs text-slate-500">Pop Rate</div><div className="font-semibold">{product.popRate || "-"}</div></div>
              <div className="bg-green-50 rounded-lg p-3"><div className="text-xs text-slate-500">Moisture</div><div className="font-semibold">{product.moisture || "-"}</div></div>
              <div className="bg-green-50 rounded-lg p-3"><div className="text-xs text-slate-500">Packaging</div><div className="font-semibold">{product.packaging || "-"}</div></div>
            </div>



            {/* Price and Cart Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-4xl font-bold text-brand">₹{Math.round((product.price || 999) * packSize * quantity)}</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-400 line-through">₹{Math.round(product.originalPrice * packSize * quantity)}</span>
                )}
                {product.discount && (
                  <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-semibold">
                    {product.discount}% OFF
                  </span>
                )}
                <span className="text-xs text-gray-500 ml-2">({packSize}kg × {quantity})</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-700 mb-4">
                <span className="bg-white px-3 py-1 rounded-full border border-green-100 font-semibold">MOQ: {product.moq || "-"}</span>
                <span className={`px-3 py-1 rounded-full font-semibold ${
                  typeof product.stock === "number"
                    ? (product.stock === 0 
                        ? "bg-red-50 text-red-600 border border-red-200" 
                        : "bg-green-50 text-green-600 border border-green-200")
                    : "bg-white border border-green-100"
                }`}>Stock: {typeof product.stock === "number" ? product.stock : "-"}</span>
                {product.active === false && (
                  <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100 font-semibold">Inactive</span>
                )}
              </div>

              {/* Pack Size Selector - moved here above Add to Cart */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1 mb-2">
                  <Gift size={14} className="text-green-600" />
                  Pack Size
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PACK_OPTIONS.map((opt) => {
                    const active = Number(opt.value) === Number(packSize);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPackSize(opt.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          active
                            ? 'bg-green-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={decreaseQty}
                    className="w-10 h-10 rounded-lg border-2 border-brand text-brand hover:bg-brand hover:text-white transition flex items-center justify-center font-bold"
                  >
                    <Minus size={18} />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                    className="w-20 text-center text-xl font-bold border-2 border-gray-200 rounded-lg py-2"
                    min="1"
                    max="10"
                  />
                  <button
                    onClick={increaseQty}
                    className="w-10 h-10 rounded-lg border-2 border-brand text-brand hover:bg-brand hover:text-white transition flex items-center justify-center font-bold"
                  >
                    <Plus size={18} />
                  </button>
                  <span className="text-sm text-gray-600 ml-2">(Max 10)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={`flex-1 px-6 py-4 rounded-lg font-bold hover:opacity-95 transition shadow-brand flex items-center justify-center gap-2 text-lg ${
                    product.stock <= 0
                      ? 'bg-gray-400 text-white cursor-not-allowed opacity-60'
                      : isInCart(productKey)
                        ? 'bg-blue-600 text-white'
                        : 'bg-brand-gradient text-white'
                  }`}
                >
                  <ShoppingCart size={24} />
                  {product.stock <= 0 ? 'Out of Stock' : isInCart(productKey) ? 'Go to Cart' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleAddToWishlist}
                  className={`px-4 py-4 rounded-lg border-2 transition ${
                    isInWishlist(productKey) 
                      ? 'border-red-500 bg-red-50 text-red-600' 
                      : 'border-brand text-brand hover:bg-brand hover:text-white'
                  }`}
                  title="Add to Wishlist"
                >
                  <Heart size={24} fill={isInWishlist(productKey) ? 'currentColor' : 'none'} />
                </button>
              </div>

              <Link to="/cart" className="block text-center text-brand font-semibold hover:underline mb-2">
                View Cart
              </Link>
            </div>

            <div className="flex gap-3 pt-4 flex-wrap">
              <Link to="/makhana-sample" className="btn-brand-ghost px-5 py-3 rounded-lg font-semibold">Get Sample</Link>
              <Link to="/order-bulk" className="btn-brand-ghost px-5 py-3 rounded-lg font-semibold">Bulk Order</Link>
              <Link to="/products" className="text-brand font-semibold underline self-center">← Back to Products</Link>
              {error && <span className="text-xs text-amber-600">{error}</span>}
            </div>
          </div>
          <div className="space-y-4">
            {activeImage && (
              <div className="w-full h-80 rounded-2xl overflow-hidden bg-green-50 shadow-brand">
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            {imageList.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {imageList.map((img) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border ${activeImage === img ? 'border-brand ring-2 ring-brand/30' : 'border-green-50'} bg-green-50 flex-shrink-0`}
                  >
                    <img src={img} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
            <div className="bg-brand-gradient text-white rounded-2xl p-6 shadow-brand">
              <h3 className="text-xl font-semibold mb-3">Available for All Order Sizes</h3>
              <ul className="space-y-2 text-white/90 text-sm">
                <li className="flex gap-2"><Sparkles size={18} /> Retail packs to wholesale quantities available</li>
                <li className="flex gap-2"><Truck size={18} /> Fast delivery across India for all order types</li>
                <li className="flex gap-2"><ClipboardList size={18} /> COA + moisture report with every lot</li>
                <li className="flex gap-2"><Shield size={18} /> FSSAI compliant, GI-tagged origin</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-brand border border-green-50 p-6 md:col-span-2">
          <h3 className="text-2xl font-bold text-brand mb-2">Product overview</h3>
          <p className="text-slate-600 text-sm mb-4">Key specifications and quality metrics for this makhana grade</p>
          <p className="text-slate-700 leading-relaxed mb-4">
            GI-certified Mithila makhana with controlled moisture and high pop-rate, sorted for uniform size and color. Ideal for retail-ready packs, flavoring lines, and export documentation-driven buyers.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-sm text-slate-700">
            <div className="bg-green-50 rounded-lg p-3"><div className="text-xs text-slate-500">Use cases</div><div className="font-semibold">{product.use}</div></div>
            <div className="bg-green-50 rounded-lg p-3"><div className="text-xs text-slate-500">MOQ</div><div className="font-semibold">{product.moq}</div></div>
            <div className="bg-green-50 rounded-lg p-3"><div className="text-xs text-slate-500">Packaging</div><div className="font-semibold">{product.packaging}</div></div>
            <div className="bg-green-50 rounded-lg p-3"><div className="text-xs text-slate-500">Pop rate</div><div className="font-semibold">{product.popRate}</div></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-brand border border-green-50 p-6">
          <h3 className="text-2xl font-bold text-brand mb-2">Compliance & logistics</h3>
          <p className="text-slate-600 text-sm mb-4">Quality certifications and delivery information</p>
          <ul className="space-y-3 text-slate-700 text-sm">
            <li className="flex gap-2"><span className="text-brand font-bold">•</span> <span><strong>FSSAI Certified</strong> - Compliant with Indian food safety standards and GI-tagged Mithila origin.</span></li>
            <li className="flex gap-2"><span className="text-brand font-bold">•</span> <span><strong>COA Available</strong> - Lot-wise Certificate of Analysis with moisture and pop-rate data.</span></li>
            <li className="flex gap-2"><span className="text-brand font-bold">•</span> <span><strong>Nitrogen-Flushed Packs</strong> - Preserves freshness; palletized export available on request.</span></li>
            <li className="flex gap-2"><span className="text-brand font-bold">•</span> <span><strong>Fast Dispatch</strong> - Sample dispatch within 24-48 hours; bulk orders shipped with tracking.</span></li>
          </ul>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-14">
        <div className="bg-white rounded-2xl shadow-brand border border-green-50 p-6 space-y-4">
          <h3 className="text-2xl font-bold text-brand">Product description</h3>
          <p className="text-slate-600 text-sm">Complete details about sourcing, processing, and quality standards</p>
          <p className="text-slate-700 leading-relaxed">
            Sourced directly from Mithila ponds in Bihar, these premium fox nuts are hand-sorted for size, color, and pop performance. Our quality control ensures every batch meets strict international standards. Moisture is carefully controlled to preserve crunch and extend shelf life, with nitrogen-flushed options available to preserve freshness during transit and storage.
          </p>
          <p className="text-slate-700 leading-relaxed">
            This product is ideal for: premium retail packs with private labels, flavoring and seasoning lines, foodservice providers, D2C brands, and export cartons to international markets. Every lot ships with a detailed Certificate of Analysis (COA) and moisture data. For export customers, we prepare palletized loads and provide complete documentation including FSSAI certificates, invoices, and packing lists.
          </p>
          <p className="text-slate-700 leading-relaxed">
            <strong>Quick Response Time:</strong> Samples dispatch in 24-48 hours. Bulk orders are processed with personalized attention to packaging, quantity, and delivery timeline.
          </p>
          <div className="flex gap-3 flex-wrap pt-4">
            <Link to="/order-bulk" className="bg-brand-gradient text-white px-5 py-3 rounded-lg font-semibold hover:opacity-95 transition shadow-brand">Request Quote</Link>
            <Link to="/makhana-sample" className="btn-brand-ghost px-5 py-3 rounded-lg font-semibold">Get Sample</Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-14 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold text-slate-900">Buyer feedback</h3>
            <div className="flex items-center gap-1 text-amber-500">
              {Array(5).fill(0).map((_, i) => <Star key={i} size={16} fill="currentColor" stroke="none" />)}
            </div>
          </div>
          <p className="text-slate-600 text-sm">Real reviews from retailers, wholesalers, and export customers - Share your experience with this lot</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-brand border border-green-50 p-6 space-y-3 md:col-span-1">
            <h4 className="text-lg font-semibold text-slate-900">Write a review</h4>
            {!user && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
                Please login to submit feedback.
                <button
                  type="button"
                  onClick={() => navigate('/login', { state: { from: `/product/${id}` } })}
                  className="ml-2 underline font-semibold text-amber-900"
                >
                  Go to login
                </button>
              </div>
            )}
            <form className="space-y-3" onSubmit={handleSubmitReview}>
              <div className="flex items-center gap-2 text-amber-500">
                {Array(5).fill(0).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReviewRating(i + 1)}
                    className="focus:outline-none"
                    aria-label={`Rate ${i + 1} star`}
                  >
                    <Star size={18} fill={reviewRating > i ? "currentColor" : "none"} stroke="currentColor" />
                  </button>
                ))}
                <span className="text-sm text-slate-700 ml-2">{reviewRating}.0</span>
              </div>
              <input
                className="input-brand p-3 w-full"
                placeholder="Full Name"
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                required
                disabled={!user}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  className="input-brand p-3 w-full"
                  placeholder="State"
                  value={reviewState}
                  onChange={(e) => setReviewState(e.target.value)}
                  required
                  disabled={!user}
                />
                <input
                  className="input-brand p-3 w-full"
                  placeholder="District"
                  value={reviewDistrict}
                  onChange={(e) => setReviewDistrict(e.target.value)}
                  required
                  disabled={!user}
                />
              </div>
              <textarea
                className="input-brand p-3 w-full"
                rows={3}
                placeholder={`Share results for ${product.name} (pop rate, moisture, packaging, transit, etc.).`}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                required
                disabled={!user}
              ></textarea>
              <button type="submit" className="w-full bg-brand-gradient text-white py-3 rounded-lg font-semibold hover:opacity-95 transition shadow-brand disabled:opacity-50 disabled:cursor-not-allowed" disabled={!user}>
                Submit feedback
              </button>
            </form>
          </div>

          <div className="md:col-span-2 space-y-3">
            {reviewsLoading && (
              <div className="bg-white rounded-xl shadow-brand border border-green-50 p-4 text-slate-600 text-sm leading-snug">
                Loading feedback...
              </div>
            )}
            {!reviewsLoading && reviews.length === 0 && (
              <div className="bg-white rounded-xl shadow-brand border border-green-50 p-4 text-slate-600 text-sm leading-snug">
                No reviews yet. Be the first to share your experience for this lot.
              </div>
            )}
            {reviews.map((fb) => (
              <div
                key={fb._id}
                className="bg-white rounded-xl shadow-brand border border-green-50 p-4 space-y-2 md:flex md:items-start md:gap-4"
              >
                <div className="flex items-center gap-2 text-amber-500 text-sm">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} size={14} fill={fb.rating > i ? "currentColor" : "none"} stroke="currentColor" />
                  ))}
                  <span className="text-xs text-slate-600">{Number(fb.rating).toFixed(1)}</span>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="font-semibold text-slate-900 text-sm">{fb.name || 'Anonymous'}</div>
                  {(fb.state || fb.district) && (
                    <div className="text-[11px] text-slate-600">{[fb.district, fb.state].filter(Boolean).join(', ')}</div>
                  )}
                  <p className="text-slate-700 text-sm leading-relaxed">
                    “{fb.comment}”
                  </p>
                  <div className="text-[11px] text-slate-500">{fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
