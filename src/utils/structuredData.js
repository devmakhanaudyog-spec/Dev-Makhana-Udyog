// Product structured data helper for SEO
// Add this to product detail pages to show rich snippets in Google Search

export const generateProductSchema = (product) => {
  if (!product) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name || "",
    "description": product.description || "",
    "image": product.mainImage || product.image || (product.images && product.images[0]) || "",
    "brand": {
      "@type": "Brand",
      "name": "Makhaantraa Foods"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://www.makhaantraafoods.com/product/${product._id || product.productId || product.id}`,
      "priceCurrency": "INR",
      "price": product.price || 0,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      "seller": {
        "@type": "Organization",
        "name": "Makhaantraa Foods"
      }
    },
    "aggregateRating": product.rating ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating || 5,
      "reviewCount": product.numReviews || 1,
      "bestRating": 5,
      "worstRating": 1
    } : undefined,
    "sku": product.productId || product._id || product.id,
    "category": product.category || "Makhana",
    "mpn": product.productId || product._id || product.id
  };
};

// Breadcrumb structured data
export const generateBreadcrumbSchema = (breadcrumbs) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  };
};

// Review structured data
export const generateReviewSchema = (reviews, productName) => {
  if (!reviews || reviews.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productName,
    "review": reviews.map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.name || review.user?.name || "Anonymous"
      },
      "datePublished": review.createdAt || new Date().toISOString(),
      "reviewBody": review.comment || "",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating || 5,
        "bestRating": 5,
        "worstRating": 1
      }
    }))
  };
};

// Organization structured data (use on homepage)
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Makhaantraa Foods",
  "alternateName": "Makhaantraa",
  "url": "https://www.makhaantraafoods.com",
  "logo": "https://res.cloudinary.com/dujkkenmf/image/upload/v1769632767/products/aj7bbsmresc1skoofaol.jpg",
  "description": "Premium GI-tagged Mithila makhana (fox nuts) supplier from Bihar, India. Offering wholesale, retail, and export-grade makhana with lab testing and certification.",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "IN",
    "addressRegion": "Bihar"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-9142252059",
    "contactType": "Customer Service",
    "areaServed": "IN",
    "availableLanguage": ["English", "Hindi"]
  },
  "sameAs": []
};

// Local Business Schema (if you have physical location)
export const generateLocalBusinessSchema = (location) => {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Makhaantraa Foods",
    "image": "https://res.cloudinary.com/dujkkenmf/image/upload/v1769632767/products/aj7bbsmresc1skoofaol.jpg",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": location.street || "",
      "addressLocality": location.city || "",
      "addressRegion": location.state || "",
      "postalCode": location.pincode || "",
      "addressCountry": "IN"
    },
    "geo": location.coordinates ? {
      "@type": "GeoCoordinates",
      "latitude": location.coordinates.lat,
      "longitude": location.coordinates.lng
    } : undefined,
    "telephone": "+91-9142252059",
    "priceRange": "₹₹",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    ]
  };
};
