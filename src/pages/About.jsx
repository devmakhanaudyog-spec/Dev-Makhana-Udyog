import React, { useEffect } from "react";
import { Link } from "react-router-dom";

export default function About() {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="bg-brand-soft min-h-screen">
    <main className="p-2 md:p-4 max-w-5xl mx-auto space-y-12 bg-gray-50 min-h-screen">
      {/* Header with Hero Image */}
      {/* Hero Section */}
      <section className="text-center flex flex-col items-center animate-fade-in-up duration-700 max-w-4xl mx-auto">
        <div className="relative w-full mb-8">
          <img
            src="https://res.cloudinary.com/dujkkenmf/image/upload/v1769243127/products/wo9lzrfabc3cpvjt4x7a.jpg"
            alt="Makhaantraa Hero"
            className="w-full h-[22rem] md:h-[28rem] object-cover rounded-2xl shadow-xl border-4 border-yellow-300"
          />
          {/* Decorative leaf accent */}
          <div className="w-14 h-14 absolute bottom-4 right-4 opacity-80 drop-shadow-md rotate-12"></div>
          <span className="absolute top-6 left-6 bg-yellow-400 text-gray-900 px-6 py-2 rounded-full text-lg font-bold shadow-lg z-20 border-2 border-white">India's Trusted GI-Tagged Makhana</span>
        </div>
        <h1 className="text-5xl font-extrabold mb-4 text-gray-900 tracking-tight">About Us</h1>
        <p className="text-xl text-gray-700 max-w-4xl mx-auto">
          Makhaantraa is dedicated to bringing authentic, GI-tagged Mithila makhana from the heart of Bihar directly to you—ensuring purity, traceability, and taste in every bite.
        </p>
      </section>

      {/* Stats Section */}
      <section className="flex flex-col md:flex-row justify-center gap-8 my-10 max-w-4xl mx-auto px-2 md:px-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 flex-1 text-center border-t-4 border-yellow-400">
          <h2 className="text-3xl font-bold text-green-700 mb-2">4800+</h2>
          <p className="text-gray-700 font-semibold">Curated Products</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 flex-1 text-center border-t-4 border-yellow-400">
          <h2 className="text-3xl font-bold text-green-700 mb-2">5+</h2>
          <p className="text-gray-700 font-semibold">Product Categories</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 flex-1 text-center border-t-4 border-yellow-400">
          <h2 className="text-3xl font-bold text-green-700 mb-2">100%</h2>
          <p className="text-gray-700 font-semibold">GI-Tagged & Certified</p>
        </div>
      </section>

      {/* Our Story */}
      <section className="flex flex-col md:flex-row items-center bg-white rounded-2xl shadow-lg p-8 gap-8 max-w-4xl mx-auto">
        <img
          src="https://res.cloudinary.com/dujkkenmf/image/upload/v1769242708/products/rtrnbzqs942qpk1bndb8.jpg"
          alt="Farmers at work"
          className="w-full md:w-1/2 rounded-2xl shadow-md object-cover h-56 md:h-72 border-2 border-green-200"
        />
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Story</h2>
          <p className="text-gray-700 text-lg mb-2">
            Founded in 2020, Makhaantraa started with a small collective of Mithila farmers and food technologists who wanted to champion authentic, nutrient-rich makhana. What began as a regional initiative has grown into a trusted brand serving homes and businesses across India.
          </p>
          <p className="text-gray-700 text-lg">
            We stay close to the source: transparent sourcing, careful grading, and packaging that preserves freshness so every batch tastes as intended.
          </p>
        </div>
      </section>

      {/* Certified Products */}
      <section className="flex flex-col md:flex-row items-center bg-white rounded-2xl shadow-lg p-8 gap-8 w-full mx-auto">
        <img src="https://res.cloudinary.com/dujkkenmf/image/upload/v1769243225/products/xh9lpswvcabiuqysqcwa.webp" alt="Certified Makhana" className="w-full md:w-1/3 rounded-2xl shadow-md object-cover h-40 md:h-56 border-2 border-yellow-200" />
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Certified Products</h2>
          <p className="text-gray-700 text-lg mb-2">We specialize in GI-Tagged Makhana (Fox Nuts) — certified, safe, and traceable. Our products meet global food safety standards (FSSAI, ISO, HACCP) and are perfect for health-conscious brands, retailers, and distributors worldwide.</p>
        </div>
      </section>

      {/* Product Categories */}
      <section className="bg-white rounded-2xl shadow-lg p-8 w-full mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">We Deal With Various Quality of Premium Makhana/Foxnut!</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <div className="bg-yellow-50 rounded-xl p-6 shadow text-center border border-yellow-200">
            <h3 className="font-bold text-lg mb-2">Raw Makhana (Lotus Seeds)</h3>
            <img src="https://res.cloudinary.com/dujkkenmf/image/upload/v1769243016/products/nevehoaogbeowjdrwewa.webp" alt="Raw Makhana" className="w-full h-32 object-cover rounded-lg mb-2" />
          </div>
          <div className="bg-yellow-50 rounded-xl p-6 shadow text-center border border-yellow-200">
            <h3 className="font-bold text-lg mb-2">Roasted Makhana (Plain & Flavored)</h3>
            <img src="https://res.cloudinary.com/dujkkenmf/image/upload/v1769242708/products/rtrnbzqs942qpk1bndb8.jpg" alt="Roasted Makhana" className="w-full h-32 object-cover rounded-lg mb-2" />
          </div>
          <div className="bg-yellow-50 rounded-xl p-6 shadow text-center border border-yellow-200">
            <h3 className="font-bold text-lg mb-2">Flavored & Seasoned Makhana Snacks</h3>
            <img src="https://res.cloudinary.com/dujkkenmf/image/upload/v1769243127/products/wo9lzrfabc3cpvjt4x7a.jpg" alt="Flavored Snacks" className="w-full h-32 object-cover rounded-lg mb-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 w-full">
          <div className="bg-yellow-50 rounded-xl p-6 shadow text-center border border-yellow-200">
            <h3 className="font-bold text-lg mb-2">Makhana Flour & Powder</h3>
            <img src="https://res.cloudinary.com/dujkkenmf/image/upload/v1769243225/products/xh9lpswvcabiuqysqcwa.webp" alt="Makhana Flour" className="w-full h-32 object-cover rounded-lg mb-2" />
          </div>
          <div className="bg-yellow-50 rounded-xl p-6 shadow text-center border border-yellow-200">
            <h3 className="font-bold text-lg mb-2">Private Label Makhana Packs</h3>
            <img src="https://res.cloudinary.com/dujkkenmf/image/upload/v1769242710/products/zyc6ysqfsknimwwly9sv.jpg" alt="Private Label Packs" className="w-full h-32 object-cover rounded-lg mb-2" />
          </div>
        </div>
        <div className="flex justify-center mt-8 w-full">
          <a href="/contact" className="inline-block bg-yellow-400 text-gray-900 font-bold px-8 py-3 rounded-full shadow-lg hover:bg-yellow-500 transition">Inquire Your Bulk Order</a>
        </div>
      </section>


      {/* Flavour Gallery */}
      <section className="bg-gradient-to-r from-yellow-100 via-pink-50 to-green-100 rounded-2xl shadow-lg p-8 mt-10 w-full mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6 text-pink-700">Flavour Gallery</h2>
        <div className="flex flex-wrap justify-center gap-8">
          <div className="w-48 flex flex-col items-center">
            <img src="https://res.cloudinary.com/dujkkenmf/image/upload/v1769242708/products/rtrnbzqs942qpk1bndb8.jpg" alt="Classic Roasted" className="rounded-xl shadow-lg h-32 w-32 object-cover mb-2" />
            <span className="font-semibold text-yellow-800">Classic Roasted</span>
          </div>
          <div className="w-48 flex flex-col items-center">
            <img src="https://res.cloudinary.com/dujkkenmf/image/upload/v1769243127/products/wo9lzrfabc3cpvjt4x7a.jpg" alt="Peri Peri" className="rounded-xl shadow-lg h-32 w-32 object-cover mb-2" />
            <span className="font-semibold text-pink-700">Peri Peri</span>
          </div>
          <div className="w-48 flex flex-col items-center">
            <img src="https://res.cloudinary.com/dujkkenmf/image/upload/v1769243016/products/nevehoaogbeowjdrwewa.webp" alt="Tangy Tomato" className="rounded-xl shadow-lg h-32 w-32 object-cover mb-2" />
            <span className="font-semibold text-red-700">Tangy Tomato</span>
          </div>
          <div className="w-48 flex flex-col items-center">
            <img src="https://res.cloudinary.com/dujkkenmf/image/upload/v1769243225/products/xh9lpswvcabiuqysqcwa.webp" alt="Cheese Burst" className="rounded-xl shadow-lg h-32 w-32 object-cover mb-2" />
            <span className="font-semibold text-yellow-600">Cheese Burst</span>
          </div>
        </div>
      </section>

      {/* Fun Facts */}
      <section className="bg-white rounded-2xl shadow-lg p-8 mt-10 w-full mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6 text-green-700">Did You Know?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🌱</span>
            <p className="text-lg text-gray-700">Makhana is a superfood—rich in protein, fiber, and antioxidants, and naturally gluten-free!</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-4xl">🔥</span>
            <p className="text-lg text-gray-700">It pops like popcorn when roasted, but with no oil needed for that perfect crunch.</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-4xl">🎉</span>
            <p className="text-lg text-gray-700">Makhana is 100% vegan and a favorite among fitness lovers and foodies alike.</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-4xl">🏆</span>
            <p className="text-lg text-gray-700">Makhaantraa brings you the boldest flavors and the cleanest supply chain—taste the difference!</p>
          </div>
        </div>
      </section>

      {/* Makhana Journey Timeline */}
      <section className="bg-gradient-to-r from-green-100 via-yellow-50 to-pink-100 rounded-2xl shadow-lg p-8 mt-10 w-full mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6 text-green-800">The Makhana Journey</h2>
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center">
            <span className="text-5xl mb-2">🌾</span>
            <span className="font-bold">Harvested</span>
            <span className="text-gray-600 text-sm">Direct from Mithila ponds</span>
          </div>
          <div className="h-12 w-1 bg-green-300 md:h-1 md:w-24 md:bg-green-300 md:my-0 my-4"></div>
          <div className="flex flex-col items-center">
            <span className="text-5xl mb-2">🧑‍🔬</span>
            <span className="font-bold">Graded & Tested</span>
            <span className="text-gray-600 text-sm">Lab-checked for quality</span>
          </div>
          <div className="h-12 w-1 bg-green-300 md:h-1 md:w-24 md:bg-green-300 md:my-0 my-4"></div>
          <div className="flex flex-col items-center">
            <span className="text-5xl mb-2">🔥</span>
            <span className="font-bold">Roasted</span>
            <span className="text-gray-600 text-sm">Popped to perfection</span>
          </div>
          <div className="h-12 w-1 bg-green-300 md:h-1 md:w-24 md:bg-green-300 md:my-0 my-4"></div>
          <div className="flex flex-col items-center">
            <span className="text-5xl mb-2">📦</span>
            <span className="font-bold">Packed & Delivered</span>
            <span className="text-gray-600 text-sm">Fresh to your door</span>
          </div>
        </div>
      </section>

      {/* Why People Love Us */}
      <section className="bg-gradient-to-r from-pink-100 via-yellow-50 to-green-100 rounded-2xl shadow-lg p-8 mt-10 w-full mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6 text-pink-700">Why People Love Us</h2>
        <div className="flex flex-wrap justify-center gap-8">
          <div className="flex flex-col items-center max-w-xs">
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png" alt="Customer 1" className="w-16 h-16 rounded-full mb-2 object-cover border-2 border-pink-300 bg-gray-200" />
            <p className="italic text-gray-800 mb-1">“The flavors are amazing and the quality is always top-notch!”</p>
            <span className="block text-sm text-gray-500">— Sunita, Delhi</span>
          </div>
          <div className="flex flex-col items-center max-w-xs">
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png" alt="Customer 2" className="w-16 h-16 rounded-full mb-2 object-cover border-2 border-yellow-300 bg-gray-200" />
            <p className="italic text-gray-800 mb-1">“I love knowing exactly where my makhana comes from. Super transparent!”</p>
            <span className="block text-sm text-gray-500">— Rajesh, Mumbai</span>
          </div>
          <div className="flex flex-col items-center max-w-xs">
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png" alt="Customer 3" className="w-16 h-16 rounded-full mb-2 object-cover border-2 border-green-300 bg-gray-200" />
            <p className="italic text-gray-800 mb-1">“Fast delivery and the best makhana I’ve ever tasted!”</p>
            <span className="block text-sm text-gray-500">— Meena, Bangalore</span>
          </div>
        </div>
      </section>

      {/* Sourcing Map */}
      <section className="bg-white rounded-2xl shadow-lg p-8 mt-10 w-full mx-auto flex flex-col items-center">
        <h2 className="text-3xl font-bold text-center mb-6 text-green-700">Our Sourcing Region</h2>
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/India_Bihar_locator_map.svg/600px-India_Bihar_locator_map.svg.png" alt="Bihar Map" className="w-64 h-48 object-contain rounded-xl shadow-md mb-2 border border-green-200" />
        <span className="text-gray-600 text-sm">All our makhana is sourced directly from the ponds of Mithila, Bihar.</span>
      </section>

      {/* Playful Divider */}
      <div className="w-full flex justify-center my-8">
        <svg height="32" width="200" className="opacity-60">
          <ellipse cx="100" cy="16" rx="90" ry="10" fill="#fbbf24" />
        </svg>
      </div>

      {/* Newsletter Signup */}
      <section className="bg-gradient-to-r from-green-200 via-yellow-100 to-pink-100 rounded-2xl shadow-lg p-8 mt-10 w-full mx-auto flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Get Exclusive Offers & Recipes!</h2>
        <p className="text-gray-700 mb-4 text-center">Sign up for our newsletter and get a discount on your first order, plus a free makhana recipe eBook.</p>
        <form className="flex flex-col md:flex-row gap-4 w-full max-w-xl justify-center">
          <input type="email" placeholder="Your email address" className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400" required />
          <button type="submit" className="bg-yellow-400 text-gray-900 font-bold px-6 py-2 rounded-lg shadow hover:bg-yellow-500 transition">Subscribe</button>
        </form>
      </section>



      {/* Closing Statement */}
      <section className="text-center mt-12 w-full">
        <h2 className="text-3xl font-bold mb-2 text-gray-900">Join Our Journey</h2>
        <p className="text-lg text-gray-700 mb-4">
          Whether you&apos;re sourcing for a kitchen, a store, or your family, we&apos;re here to deliver dependable quality and flavor in every pack.
        </p>
        <Link to="/products" className="inline-block bg-green-600 text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 transition shadow-lg">
          Shop Now
        </Link>
      </section>
    </main>
    </div>
  );
}
