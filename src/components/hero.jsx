import React, { useEffect, useState } from "react";
import { useSettings } from '../context/SettingsContext';
import { makhanaProducts } from "../data/makhana";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Award, Package, Star, CheckCircle2, TrendingUp, Users, ArrowUp, Leaf, ClipboardList, FlaskConical, DollarSign } from "lucide-react";
import { API_BASE_URL } from '../config';
import FAQ, { makhaanaFAQs } from './FAQ';

/* ---------------------- Skeleton ---------------------- */
const Skeleton = ({ height = "20px", width = "100%", className = "" }) => (
  <div
    className={`bg-gray-300 animate-pulse ${className}`}
    style={{ height, width, borderRadius: "4px" }}
  ></div>
);

/* ---------------------- HERO WITH STATS & TRUST BADGES ---------------------- */
function HeroSection() {
  const { settings } = useSettings();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!loaded) {
    return (
      <div className="max-w-[1500px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-4 py-6 md:py-6">
        <div className="space-y-4">
          <Skeleton height="60px" width="80%" />
          <Skeleton height="24px" width="90%" />
          <Skeleton height="20px" width="60%" />
          <div className="flex gap-4 mt-4">
            <Skeleton height="40px" width="120px" />
            <Skeleton height="40px" width="120px" />
          </div>
        </div>
        <div className="flex justify-center">
          <Skeleton height="300px" width="100%" />
        </div>
      </div>
    );
  }

  // Support Cloudinary or local images
  let heroImage = settings?.heroImage;
  if (heroImage) {
    if (heroImage.startsWith('http') && heroImage.includes('cloudinary')) {
      // Use Cloudinary URL as is
    } else if (heroImage.startsWith('/')) {
      heroImage = process.env.PUBLIC_URL ? process.env.PUBLIC_URL + heroImage : heroImage;
    } else {
      heroImage = process.env.PUBLIC_URL ? process.env.PUBLIC_URL + '/' + heroImage : '/' + heroImage;
    }
  } else {
    heroImage = process.env.PUBLIC_URL ? process.env.PUBLIC_URL + '/product_image/makhana.jpeg' : '/product_image/makhana.jpeg';
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Main Hero Content */}
      <div className="max-w-[1500px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-4 py-8 md:py-12">
        <div className="text-center md:text-left">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Shield className="w-4 h-4" />
            <span>GI-Certified Mithila Makhana</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-slate-800 leading-tight">
            Premium Makhana for
            <span className="block bg-clip-text text-transparent bg-brand-gradient">
              Everyone - Retail to Wholesale
            </span>
          </h1>
          
          <p className="mt-6 text-xl text-slate-700 leading-relaxed">
            Moisture-controlled (&lt;3%), 98%+ pop rate, nitrogen-flushed packaging. 
            <span className="font-semibold text-green-700"> Order from small packs to bulk quantities.</span> samples available.
          </p>
          
          {/* Key Features Pills */}
          <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-green-100">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-slate-700">All Order Sizes</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-green-100">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-slate-700">Pan-India Delivery</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-green-100">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-slate-700">FSSAI Certified</span>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center md:justify-start gap-4">
            <Link 
              to="/makhana-sample" 
              className="bg-gradient-to-r from-green-700 via-green-600 to-green-400 text-white px-8 py-4 rounded-lg font-semibold hover:opacity-95 transition-all text-lg shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transform"
            >
              Order Sample →
            </Link>
            <Link 
              to="/products" 
              className="px-8 py-4 rounded-lg font-semibold text-lg bg-white border-2 border-green-600 text-green-700 hover:bg-green-50 transition-all"
            >
              View Products
            </Link>
          </div>
        </div>

        {/* Hero Image */}
        <div className="flex justify-center items-center relative">
          <div className="relative w-96 h-96 md:w-[450px] md:h-[450px]">
            {/* Professional Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-200 via-emerald-100 to-transparent rounded-2xl blur-3xl opacity-30 -z-10"></div>
            
            <img 
              src={heroImage}
              alt="Premium Makhana" 
              className="rounded-2xl shadow-2xl w-full h-full object-cover border-4 border-green-100 hover:shadow-3xl transition-shadow duration-300"
            />
            {/* Floating Badge */}
            <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-2xl p-6 border-4 border-green-100">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700">98%+</div>
                <div className="text-sm text-slate-600 font-medium">Pop Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-t border-b border-green-100">
        <div className="max-w-[1500px] mx-auto px-4 py-8">
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-700 mb-1">1000+</div>
              <div className="text-xs md:text-sm text-slate-600 font-medium">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-700 mb-1">2+</div>
              <div className="text-xs md:text-sm text-slate-600 font-medium">Countries Served</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-700 mb-1">7</div>
              <div className="text-xs md:text-sm text-slate-600 font-medium">Premium Grades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-700 mb-1">Fast</div>
              <div className="text-xs md:text-sm text-slate-600 font-medium">Delivery Across India</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Featured Categories ---------------------- */
function FeaturedCategories() {
  const [loaded, setLoaded] = useState(false);
  const [products, setProducts] = useState([]);
  useEffect(() => {
    setLoaded(false);
    fetch(`${API_BASE_URL}/api/products?limit=100`)
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data.products) && data.products.length ? data.products : makhanaProducts);
        setLoaded(true);
      })
      .catch(() => { setProducts(makhanaProducts); setLoaded(true); });
  }, []);

  if (!loaded) {
    return (
      <section className="max-w-6xl mx-auto px-4 py-12">
        <Skeleton height="32px" width="200px" className="mb-6" />
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} height="150px" width="100%" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-20 bg-gradient-to-b from-white to-green-50">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <Package className="w-4 h-4" />
          <span>Complete Product Range</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Shop by Makhana Grade</h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">From premium 7 Suta export quality to ready-to-eat flavored varieties</p>
      </div>
      <div className="relative">
        <AutoScrollScroller>
          <div className="flex gap-6 pb-4">
            {products.map(product => (
              <Link
                key={product._id || product.productId || product.id}
                to={`/product/${product.productId || product._id || product.id}`}
                className="min-w-[300px] max-w-xs group block overflow-hidden rounded-3xl bg-white shadow-lg border-2 border-green-50 hover:shadow-2xl hover:border-green-200 transition-all duration-300 hover:-translate-y-2"
              >
                <div className="h-56 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden relative">
                  <img
                    src={product.mainImage || (product.images && product.images[0])}
                    alt={product.name}
                    className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-500"
                    onError={e => { e.target.onerror = null; e.target.src = 'https://res.cloudinary.com/dujkkenmf/image/upload/v1769632767/products/aj7bbsmresc1skoofaol.jpg'; }}
                  />
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                    {product.grade}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <h4 className="font-bold text-xl text-slate-900 mb-2 group-hover:text-green-700 transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-sm font-semibold text-green-700 mb-2">{product.description}</p>
                  <p className="text-xs text-slate-600 mb-4">MOQ: {product.moq} | Pop Rate: {product.popRate}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-green-700 font-bold text-sm group-hover:text-green-800">View Details</span>
                    <span className="text-green-700 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </AutoScrollScroller>
      </div>
      <div className="text-center mt-12">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-white border-2 border-green-600 text-green-700 px-8 py-4 rounded-xl font-bold hover:bg-green-600 hover:text-white transition-all shadow-lg hover:shadow-xl"
        >
          <span>View All Grades</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}

/* ---------------------- Deals Banner ---------------------- */
function DealsBanner() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!loaded) {
    return (
      <section className="max-w-6xl mx-auto px-4 py-10">
        <Skeleton height="120px" width="100%" />
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="rounded-3xl bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white p-10 md:p-14 flex flex-col md:flex-row justify-between items-center shadow-2xl relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 mb-6 md:mb-0">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-4 w-fit">
            <Leaf className="w-4 h-4" />
            <span>100% Natural and Ethically Sourced</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-bold mb-3">
            Get Sample for All Orders
          </h3>
          <p className="text-green-50 text-lg max-w-xl">
            Try before you buy! Get a complimentary sample with quality certificate. Available for retail, wholesale & bulk orders.
          </p>
        </div>
        
        <Link 
          to="/makhana-sample" 
          className="relative z-10 bg-white text-green-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 transform"
        >
          Order Sample →
        </Link>
      </div>
    </section>
  );
}

const canonicalFeatured = [
  { id: "7-suta", displayName: "7 Suta Makhana", aliases: ["7 suta makhana", "7 suta makhana hand picked"] },
  { id: "6-suta", displayName: "6 Suta Makhana", aliases: ["6 suta makhana"] },
  { id: "5-suta", displayName: "5 Suta Makhana", aliases: ["5 suta makhana"] },
  { id: "roasted-makhana", displayName: "Roasted Makhana", aliases: ["roasted makhana"] }
];

const normalizeFeaturedName = (value = "") =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const getFeaturedProductKey = (product) =>
  (product?.productId || product?.id || "").toString().toLowerCase();

const localFeaturedMap = new Map(makhanaProducts.map((product) => [getFeaturedProductKey(product), product]));

const pickCanonicalProduct = (target, products) => {
  const byId = products.find((product) => getFeaturedProductKey(product) === target.id);
  if (byId) return byId;

  const aliasSet = new Set(target.aliases.map(normalizeFeaturedName));
  const byName = products.find((product) => aliasSet.has(normalizeFeaturedName(product?.name || "")));
  if (byName) return byName;

  return localFeaturedMap.get(target.id) || null;
};

/* ---------------------- Featured Products ---------------------- */
function FeaturedProducts() {
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState([]);

  useEffect(() => {
    setLoaded(false);
    const localFallback = canonicalFeatured
      .map((target) => localFeaturedMap.get(target.id))
      .filter(Boolean);

    fetch(`${API_BASE_URL}/api/products?limit=100`)
      .then(res => res.json())
      .then(data => {
        const apiProducts = Array.isArray(data.products) ? data.products : [];
        setCatalog(apiProducts.length ? apiProducts : localFallback);
        setLoaded(true);
      })
      .catch(() => {
        setCatalog(localFallback);
        setLoaded(true);
      });
  }, []);

  if (!loaded) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-12">
        <Skeleton height="32px" width="250px" className="mb-6" />
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} height="300px" width="100%" />
          ))}
        </div>
      </section>
    );
  }

  const featuredToShow = canonicalFeatured
    .map((target) => ({
      displayName: target.displayName,
      product: pickCanonicalProduct(target, catalog)
    }))
    .filter((item) => Boolean(item.product));

  return (
    <section className="max-w-7xl mx-auto px-4 py-20 bg-white">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <Star className="w-4 h-4 fill-current" />
          <span>Bestsellers</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Featured Makhana Products</h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">Handpicked selection of our most popular grades</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {featuredToShow.map(({ product: p, displayName }) => (
          <button
            key={p._id || p.productId || p.id || displayName}
            onClick={() => navigate(`/product/${p.productId || p._id || p.id}`)}
            className="group text-left bg-white rounded-3xl shadow-lg border-2 border-gray-100 overflow-hidden hover:shadow-2xl hover:border-green-200 transition-all duration-300 hover:-translate-y-2"
          >
            <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden relative">
              <img
                src={p.mainImage || p.image || (p.images && p.images[0]) || 'https://res.cloudinary.com/dujkkenmf/image/upload/v1769632767/products/aj7bbsmresc1skoofaol.jpg'}
                alt={p.name}
                className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-500"
                onError={(e) => { e.target.src = 'https://res.cloudinary.com/dujkkenmf/image/upload/v1769632767/products/aj7bbsmresc1skoofaol.jpg'; }}
              />
              <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                {p.grade}
              </div>
            </div>

            <div className="p-6">
              <h3 className="font-bold text-xl text-slate-900 mb-3 group-hover:text-green-700 transition-colors">
                {displayName}
              </h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Pop Rate:</span>
                  <span className="font-semibold text-green-700">{p.popRate}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Moisture:</span>
                  <span className="font-semibold text-green-700">{p.moisture}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">MOQ:</span>
                  <span className="font-semibold text-slate-900">{p.moq}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-green-700 font-bold group-hover:text-green-800">View Details</span>
                <span className="text-green-700 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ---------------------- How It Works ---------------------- */
function HowItWorks(){
  const [loaded, setLoaded] = useState(false);
  const steps = [
    { id:1, Icon: ClipboardList, bg:"from-blue-100 to-blue-200",   fg:"text-blue-700",   title:"Browse & Select",  desc:"Choose from our premium makhana grades for any order size from the Products page." },
    { id:2, Icon: Package,       bg:"from-amber-100 to-amber-200", fg:"text-amber-700",  title:"Request Sample",   desc:"Order a sample to test quality before placing your bulk order. Fill the Order-Sample Form." },
    { id:3, Icon: CheckCircle2,  bg:"from-green-100 to-green-200", fg:"text-green-700",  title:"Place Your Order", desc:"Order from small packs to bulk quantities — we serve all. Cart for small packs, Bulk-Order form for wholesale." }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!loaded) {
    return (
      <section className="max-w-6xl mx-auto px-4 py-12">
        <Skeleton height="32px" width="200px" className="mb-6" />
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map(s => <Skeleton key={s.id} height="150px" width="100%" />)}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-white">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <TrendingUp className="w-4 h-4" />
          <span>Simple Process</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">How It Works</h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">Get started with our premium makhana in 3 easy steps</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 relative">
        {/* Connection Lines */}
        <div className="hidden md:block absolute top-1/4 left-1/4 right-1/4 h-1 bg-gradient-to-r from-green-300 via-green-400 to-green-300"></div>
        
        {steps.map((s, idx) => (
          <div key={s.id} className="relative bg-white rounded-3xl p-8 shadow-lg border-2 border-green-100 hover:shadow-2xl hover:border-green-300 transition-all hover:-translate-y-2">
            {/* Step Number */}
            <div className="absolute -top-6 left-8 w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg">
              {idx + 1}
            </div>
            
            <div className={`w-20 h-20 mb-6 mt-4 flex items-center justify-center bg-gradient-to-br ${s.bg} rounded-3xl shadow-md`}>
              <s.Icon className={`w-10 h-10 ${s.fg}`} />
            </div>
            <h4 className="font-bold text-2xl text-slate-900 mb-3">{s.title}</h4>
            <p className="text-slate-600 leading-relaxed text-lg">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <Link 
          to="/makhana-sample" 
          className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 transform"
        >
          <span>Start Your Order</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </section>
  );
}

/* ---------------------- Why Choose Us ---------------------- */
function WhyChooseUs(){
  const [loaded, setLoaded] = useState(false);
  const features = [
    { id:1, Icon: Award,        bg:"from-amber-100 to-amber-200",   fg:"text-amber-700",  title:"GI-Certified",       desc:"Authentic Mithila Makhana with geographical indication tag" },
    { id:2, Icon: FlaskConical, bg:"from-blue-100 to-blue-200",     fg:"text-blue-700",   title:"Lab-Tested Quality", desc:"Every batch tested for moisture, pop rate & foreign matter" },
    { id:3, Icon: Package,      bg:"from-green-100 to-green-200",   fg:"text-green-700",  title:"Flexible Quantities",desc:"From small retail packs to bulk wholesale orders — we serve all" },
    { id:4, Icon: DollarSign,   bg:"from-purple-100 to-purple-200", fg:"text-purple-700", title:"Best Pricing",       desc:"Competitive rates for all order sizes with volume discounts" }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!loaded) {
    return (
      <section className="max-w-6xl mx-auto px-4 py-12">
        <Skeleton height="32px" width="250px" className="mb-6" />
        <div className="grid md:grid-cols-4 gap-6">
          {features.map(f => <Skeleton key={f.id} height="180px" width="100%" />)}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-20 bg-white">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <Award className="w-4 h-4" />
          <span>Our Commitment</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Why Choose Dev Makhana Udyog</h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">GI-certified quality with complete traceability and transparency</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f) => (
          <div
            key={f.id}
            className="bg-gradient-to-br from-white to-green-50 rounded-3xl p-8 shadow-lg border-2 border-green-100 hover:shadow-2xl hover:border-green-300 transition-all duration-300 hover:-translate-y-2 text-center group"
          >
            <div className={`w-20 h-20 mx-auto mb-5 bg-gradient-to-br ${f.bg} rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md`}>
              <f.Icon className={`w-10 h-10 ${f.fg}`} />
            </div>
            <h4 className="font-bold text-xl text-slate-900 mb-3 group-hover:text-green-700 transition-colors">
              {f.title}
            </h4>
            <p className="text-slate-600 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------------- Testimonials ---------------------- */
function Testimonials(){
  const [loaded, setLoaded] = useState(false);
  const quotes = [
    { 
      id: 1, 
      name: "Priya M.", 
      role: "Home Customer", 
      company: "Mumbai",
      text: "Ordered 2kg for home use. Amazing quality and freshness! Delivery was quick and packaging was excellent." 
    },
    { 
      id: 2, 
      name: "Lalan Yadav", 
      role: "Export Manager", 
      company: "Global Foods, Bihar",
      text: "Palletized export was seamless. Documentation and moisture reports shared upfront. Will definitely order again." 
    },
    { 
      id: 3, 
      name: "Sunil K.", 
      role: "Retailer", 
      company: "Healthy Bites, Delhi",
      text: "Perfect for my store! Can order in retail packs or wholesale. Great quality and my customers keep coming back." 
    },
    { 
      id: 4, 
      name: "Rohit T.", 
      role: "Restaurant Owner", 
      company: "Fine Dining Chain",
      text: "Consistent 6 Suta grade for our restaurants. Flexible order sizes and excellent bulk pricing structure." 
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!loaded) {
    return (
      <section className="max-w-6xl mx-auto px-4 py-12">
        <Skeleton height="32px" width="200px" className="mb-6 mx-auto" />
        <div className="grid md:grid-cols-2 gap-6">
          {quotes.map(q => <Skeleton key={q.id} height="120px" width="100%" />)}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-20 bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <Users className="w-4 h-4" />
          <span>Client Success Stories</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Trusted by Customers Worldwide</h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">Real feedback from home customers, retailers, wholesalers, and exporters</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {quotes.map(q => (
          <div 
            key={q.id} 
            className="bg-white p-8 rounded-3xl shadow-lg border-2 border-green-100 hover:shadow-2xl hover:border-green-300 transition-all duration-300 hover:-translate-y-1"
          >
            {/* Star Rating */}
            <div className="flex gap-1 text-amber-500 mb-4 text-xl">
              {Array(5).fill(0).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            
            {/* Quote */}
            <p className="text-slate-700 leading-relaxed text-lg mb-6 italic">
              "{q.text}"
            </p>
            
            {/* Author Info */}
            <div className="flex items-center gap-4 pt-4 border-t border-green-100">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {q.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-lg">{q.name}</div>
                <div className="text-sm text-slate-600">{q.role}</div>
                <div className="text-xs text-green-700 font-semibold">{q.company}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center mt-12">
        <Link 
          to="/contact" 
          className="inline-flex items-center gap-2 bg-white border-2 border-green-600 text-green-700 px-8 py-4 rounded-xl font-bold hover:bg-green-600 hover:text-white transition-all shadow-lg hover:shadow-xl"
        >
          <span>Read More Reviews</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}

/* ---------------------- Newsletter ---------------------- */
function Newsletter(){
  const [loaded, setLoaded] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  function submit(e){
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const apiBase = process.env.REACT_APP_API_URL || "";
    fetch(`${apiBase}/api/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        setMessage(`Error: ${data.error}`);
      } else {
        setMessage("✅ Subscribed successfully! Check your email for updates.");
        setEmail("");
      }
      setLoading(false);
    })
    .catch(err => {
      setMessage("Error subscribing. Please try again.");
      setLoading(false);
    });
  }

  if (!loaded) {
    return (
      <section className="max-w-6xl mx-auto px-4 py-12">
        <Skeleton height="150px" width="100%" />
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-12 md:p-16 relative overflow-hidden shadow-2xl">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-600/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-6">
            <Package className="w-4 h-4" />
            <span>Newsletter</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Get Latest Offers & Updates
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Subscribe to receive special offers, new product arrivals, and exclusive deals for all order types
          </p>
          
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={loading}
              className="flex-1 px-6 py-4 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-green-500/50 shadow-lg text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 transform text-lg whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Subscribing..." : "Subscribe →"}
            </button>
          </form>
          
          {message && (
            <p className={`text-sm mt-6 ${message.includes("Error") ? "text-red-400" : "text-green-400"}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------------- Scroll To Top Button ---------------------- */
function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisible = () => {
      const scrolled = document.documentElement.scrollTop;
      setVisible(scrolled > 300);
    };

    window.addEventListener('scroll', toggleVisible);
    return () => window.removeEventListener('scroll', toggleVisible);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-24 right-6 md:right-8 z-40 bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-full shadow-2xl hover:from-green-700 hover:to-green-800 transition-all duration-300 hover:scale-110 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16 pointer-events-none'}`}
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-6 h-6" />
    </button>
  );
}

/* ---------------------- MAIN EXPORT ---------------------- */
export default function Hero() {
  return (
    <>
      <HeroSection />
      <FeaturedCategories />
      <DealsBanner />
      <FeaturedProducts />
      <HowItWorks />
      <WhyChooseUs />
      <Testimonials />
      <FAQ faqs={makhaanaFAQs} />
      <Newsletter />
      <ScrollToTopButton />
    </>
  );
}

// Auto-scrolling wrapper for horizontal scroller
function AutoScrollScroller({ children, speed = 1 }) {
  const containerRef = React.useRef(null);
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let frame;
    let scrollLeft = 0;
    let running = true;
    function animate() {
      if (!running) return;
      scrollLeft += speed;
      if (scrollLeft >= container.scrollWidth - container.clientWidth) {
        scrollLeft = 0;
      }
      container.scrollLeft = scrollLeft;
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => {
      running = false;
      cancelAnimationFrame(frame);
    };
  }, [speed]);
  return (
    <div ref={containerRef} className="overflow-x-auto scrollbar-thin scrollbar-thumb-green-200 scrollbar-track-green-50">
      {children}
    </div>
  );
}
