import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react';

/**
 * SEO-Optimized Blog Post Template
 * 
 * Usage:
 * <BlogPostTemplate
 *   title="Health Benefits of Makhana for Weight Loss"
 *   excerpt="Discover how makhana can help you lose weight naturally..."
 *   content={<YourContentComponent />}
 *   author="Makhaantraa Team"
 *   date="2026-02-08"
 *   category="Health & Nutrition"
 *   tags={["makhana benefits", "weight loss", "healthy snacking"]}
 *   featuredImage="https://..."
 * />
 */

const BlogPostTemplate = ({
  title,
  excerpt,
  content,
  author = "Makhaantraa Team",
  date,
  category = "Makhana",
  tags = [],
  featuredImage,
  slug
}) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Generate article schema for Google Rich Results
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": excerpt,
    "image": featuredImage || "https://res.cloudinary.com/dujkkenmf/image/upload/v1769632767/products/aj7bbsmresc1skoofaol.jpg",
    "author": {
      "@type": "Person",
      "name": author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Makhaantraa Foods",
      "logo": {
        "@type": "ImageObject",
        "url": "https://res.cloudinary.com/dujkkenmf/image/upload/v1769632767/products/aj7bbsmresc1skoofaol.jpg"
      }
    },
    "datePublished": date,
    "dateModified": date,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.makhaantraafoods.com/blog/${slug}`
    }
  };

  // Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.makhaantraafoods.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://www.makhaantraafoods.com/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": title,
        "item": `https://www.makhaantraafoods.com/blog/${slug}`
      }
    ]
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{title} | Makhaantraa Foods Blog</title>
        <meta name="description" content={excerpt} />
        <meta name="keywords" content={tags.join(', ')} />
        <link rel="canonical" href={`https://www.makhaantraafoods.com/blog/${slug}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://www.makhaantraafoods.com/blog/${slug}`} />
        {featuredImage && <meta property="og:image" content={featuredImage} />}
        <meta property="article:published_time" content={date} />
        <meta property="article:author" content={author} />
        <meta property="article:section" content={category} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={excerpt} />
        {featuredImage && <meta name="twitter:image" content={featuredImage} />}
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      <div className="bg-brand-soft min-h-screen">
        {/* Breadcrumb Navigation */}
        <div className="max-w-4xl mx-auto px-4 pt-24 pb-4">
          <nav className="flex items-center gap-2 text-sm text-slate-600">
            <Link to="/" className="hover:text-green-600 transition">Home</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-green-600 transition">Blog</Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">{category}</span>
          </nav>
        </div>

        {/* Article Header */}
        <article className="max-w-4xl mx-auto px-4 pb-12">
          <header className="mb-8">
            {/* Category Badge */}
            <Link 
              to={`/blog?category=${category}`}
              className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4 hover:bg-green-200 transition"
            >
              <Tag size={16} />
              {category}
            </Link>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-4">
              {title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-slate-600 mb-6">
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>{author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <time dateTime={date}>{new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
              </div>
            </div>

            {/* Excerpt */}
            <p className="text-xl text-slate-700 leading-relaxed border-l-4 border-green-500 pl-4">
              {excerpt}
            </p>
          </header>

          {/* Featured Image */}
          {featuredImage && (
            <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={featuredImage} 
                alt={title}
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-lg max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-green-600 prose-strong:text-slate-900">
            {content}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Link
                    key={index}
                    to={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm hover:bg-green-100 hover:text-green-700 transition"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back to Blog */}
          <div className="mt-12">
            <Link 
              to="/blog"
              className="inline-flex items-center gap-2 text-green-600 font-semibold hover:text-green-700 transition"
            >
              <ArrowLeft size={20} />
              Back to Blog
            </Link>
          </div>
        </article>

        {/* Related CTA */}
        <section className="bg-green-50 border-t border-green-100 py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Try Our Premium Makhana
            </h2>
            <p className="text-slate-700 mb-6">
              Experience the quality difference with GI-tagged Mithila makhana
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/products"
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-lg"
              >
                Shop Now
              </Link>
              <Link 
                to="/makhana-sample"
                className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition border-2 border-green-600"
              >
                Get Sample
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default BlogPostTemplate;
