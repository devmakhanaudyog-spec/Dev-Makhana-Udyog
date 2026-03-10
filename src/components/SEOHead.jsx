import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEOHead({ 
  title = 'Dev Mkahna Udyog - Premium Makhana Products', 
  description = 'Shop premium quality makhana products with secure checkout and fast delivery.',
  image = '/mainimage.jpg',
  url = 'https://your-domain.example'
}) {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional SEO */}
      <meta name="keywords" content="makhana, fox nuts, healthy snacks, premium makhana, online store" />
      <meta name="author" content="Dev Mkahna Udyog" />
      <meta name="robots" content="index, follow" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* Structured Data (Schema.org) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "Organization",
          "name": "Dev Mkahna Udyog",
          "url": "https://your-domain.example",
          "logo": "https://your-domain.example/logo.png",
          "description": description,
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Service",
            "email": "support@your-domain.example"
          }
        })}
      </script>
    </Helmet>
  );
}
