import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import { Package, ShieldCheck, AlertCircle } from "lucide-react";

import { API_BASE_URL } from "../config";

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const loaderRef = useRef(null);

  // Always show these products at the top in this order if present
  // Update: Use new product names as per user request
  const getOrderedProducts = useCallback((products) => {
    const orderedNames = [
      "7 suta makhana",
      "6 suta makhana",
      "5 suta makhana",
      "4 suta makhana",
      "raw makhana",
      "roasted makhana",
      "flavoured makhna"
    ];
    const nameMap = {};
    products.forEach(p => {
      if (p.name) nameMap[p.name.trim().toLowerCase()] = p;
    });
    const ordered = orderedNames
      .map(name => nameMap[name.trim().toLowerCase()])
      .filter(Boolean);
    const rest = products.filter(
      p => !orderedNames.some(name => p.name && p.name.trim().toLowerCase() === name.trim().toLowerCase())
    );
    return [...ordered, ...rest];
  }, []);

  const safeProducts = useMemo(() => {
    if (products.length) {
      // Only show products with category 'Makhana', custom order
      return getOrderedProducts(products.filter(p => (p.category === 'Makhana')));
    }
    return [];
  }, [products, getOrderedProducts]);
  
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        if (page === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError("");
        const res = await fetch(`${API_BASE_URL}/api/products?limit=12&page=${page}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
        const data = await res.json();
        const nextProducts = Array.isArray(data.products) ? data.products : [];
        if (isMounted) {
          setProducts(prev => {
            const existingIds = new Set(prev.map(p => p._id || p.productId || p.id));
            const merged = [...prev];
            nextProducts.forEach(item => {
              const itemId = item._id || item.productId || item.id;
              if (!existingIds.has(itemId)) merged.push(item);
            });
            return merged;
          });
          const totalPages = data.pagination?.pages;
          if (typeof totalPages === "number") {
            setHasMore(page < totalPages);
          } else {
            setHasMore(nextProducts.length === 12);
          }
        }
      } catch (err) {
        if (!isMounted || err.name === "AbortError") return;
        console.error("Products fetch failed", err);
        setError("Live data unavailable. Please refresh.");
        setHasMore(false);
      } finally {
        if (isMounted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [page]);

  useEffect(() => {
    if (!loaderRef.current || loading || loadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setPage(prev => prev + 1);
        }
      },
      { root: null, rootMargin: "200px", threshold: 0 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loading, loadingMore, hasMore]);
  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Buy Premium Makhana Products | GI-Certified Fox Nuts | Makhaantraa Foods</title>
        <meta name="description" content="Shop authentic GI-certified makhana products from Mithila, Bihar. 7 Suta, 6 Suta, roasted & flavored varieties. Lab-tested, <3% moisture, 98%+ pop rate. Order now!" />
        <meta name="keywords" content="buy makhana, premium makhana, fox nuts online, lotus seeds, 7 suta makhana, roasted makhana, flavored makhana, GI certified makhana, makhana price, wholesale makhana" />
        <link rel="canonical" href="https://www.makhaantraafoods.com/products" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Buy Premium Makhana Products | GI-Certified Fox Nuts" />
        <meta property="og:description" content="Shop authentic GI-certified makhana from Mithila, Bihar. Multiple varieties available." />
        <meta property="og:url" content="https://www.makhaantraafoods.com/products" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="bg-brand-soft min-h-screen">
      <section className="bg-brand-gradient text-white">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2 max-w-2xl">
            <p className="pill-brand bg-white/15 text-white inline-flex items-center gap-2"><ShieldCheck size={16} /> GI-tagged Mithila lots</p>
            <h1 className="text-3xl font-bold">Best Selling Makhana </h1>
            <p className="text-white/90 text-sm">Curated SKUs from 7 Suta flagship to flavored RTE. Each lot includes COA, pop-rate, and moisture data.</p>
            <div className="flex gap-2 flex-wrap">
              <Link to="/makhana-sample" className="bg-white text-brand px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-95 transition shadow-brand">Get Sample</Link>
              <Link to="/order-bulk" className="btn-brand-ghost bg-white text-brand px-4 py-2 rounded-lg text-sm font-semibold">Order in Bulk</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/10 p-3 rounded-xl">
              <div className="text-xl font-bold">99%+</div>
              <div className="opacity-80 text-xs">Pop rate (flagship)</div>
            </div>
            <div className="bg-white/10 p-3 rounded-xl">
              <div className="text-xl font-bold">&lt; 3%</div>
              <div className="opacity-80 text-xs">Moisture</div>
            </div>
            <div className="bg-white/10 p-3 rounded-xl">
              <div className="text-xl font-bold">GI</div>
              <div className="opacity-80 text-xs">Mithila origin</div>
            </div>
            <div className="bg-white/10 p-3 rounded-xl">
              <div className="text-xl font-bold">24-48h</div>
              <div className="opacity-80 text-xs">Sample dispatch</div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12 space-y-6">
        {/* <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-3xl font-bold text-slate-900">Best Selling Makhana</h2>
          <p className="text-sm text-slate-600">Seven GI-certified SKUs.</p>
        </div> */}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && !safeProducts.length && (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="bg-white rounded-2xl shadow-brand border border-green-50 p-6 flex flex-col gap-3 animate-pulse"
              >
                <div className="w-full h-56 rounded-xl bg-green-50" />
                <div className="h-4 w-24 bg-slate-200 rounded" />
                <div className="h-6 w-3/4 bg-slate-200 rounded" />
                <div className="h-4 w-full bg-slate-200 rounded" />
                <div className="h-4 w-2/3 bg-slate-200 rounded" />
                <div className="h-6 w-28 bg-slate-200 rounded" />
                <div className="h-10 w-full bg-slate-200 rounded-lg" />
              </div>
            ))
          )}
          {!loading && safeProducts.map((p) => {
            const displayImage = p.image || p.mainImage || (p.images && p.images[0]);
            return (
            <div
              key={p._id || p.productId || p.id}
              onClick={() => navigate(`/product/${p.productId || p._id || p.id}`)}
              className="text-left bg-white rounded-2xl shadow-brand border border-green-50 p-6 flex flex-col gap-3 transition hover:-translate-y-1 hover:shadow-lg cursor-pointer"
            >
              {displayImage && (
                <div className="w-full h-56 rounded-xl bg-green-50 overflow-hidden">
                  <img
                    src={displayImage}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="flex items-center gap-2 text-brand font-semibold text-sm"><Package size={18} /> {p.grade}</div>
              <h3 className="text-2xl font-bold text-slate-900">{p.name}</h3>
              <p className="text-slate-700 text-sm leading-relaxed">{p.description}</p>
              <div className="flex items-baseline gap-2 text-slate-900">
                <span className="text-xl font-bold text-brand">₹{p.price ?? "-"}</span>
                {p.originalPrice ? <span className="text-sm text-gray-400 line-through">₹{p.originalPrice}</span> : null}
                {p.discount ? <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">{p.discount}% OFF</span> : null}
              </div>
              {/* Removed pop rate, moisture, packaging, use case for product cards as requested */}
              <div className="flex items-center justify-between text-sm text-slate-700">
                <span className="flex items-center gap-2">
                  <span>MOQ: <span className="font-semibold">{p.moq || "-"}</span></span>
                  <span className={`text-xs font-semibold ${
                    typeof p.stock === "number" 
                      ? (p.stock === 0 ? "text-red-600" : "text-green-600")
                      : "text-slate-500"
                  }`}>| Stock: {typeof p.stock === "number" ? p.stock : "-"}</span>
                </span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold shadow hover:from-green-700 hover:to-emerald-700 transition-all focus:outline-none focus:ring-2 focus:ring-green-300"
                  onClick={e => { e.stopPropagation(); navigate(`/product/${p.productId || p._id || p.id}`); }}
                >
                  View Details <span className="text-lg">→</span>
                </button>
              </div>
            </div>
          );
          })}
        </div>

        {loadingMore && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`skeleton-more-${index}`}
                className="bg-white rounded-2xl shadow-brand border border-green-50 p-6 flex flex-col gap-3 animate-pulse"
              >
                <div className="w-full h-56 rounded-xl bg-green-50" />
                <div className="h-4 w-24 bg-slate-200 rounded" />
                <div className="h-6 w-3/4 bg-slate-200 rounded" />
                <div className="h-4 w-full bg-slate-200 rounded" />
                <div className="h-4 w-2/3 bg-slate-200 rounded" />
                <div className="h-6 w-28 bg-slate-200 rounded" />
                <div className="h-10 w-full bg-slate-200 rounded-lg" />
              </div>
            ))}
          </div>
        )}

        <div ref={loaderRef} className="h-1" />

        {error && (
          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        {loading && (
          <div className="text-sm text-slate-600">Loading live catalog...</div>
        )}
      </section>
    </div>
    </>
  );
}
