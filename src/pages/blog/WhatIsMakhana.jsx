import React from 'react';
import BlogPostTemplate from '../../components/BlogPostTemplate';

const WhatIsMakhanaArticle = () => (
  <div className="space-y-6">
    <p className="text-lg text-gray-700 leading-relaxed">
      Makhana, also called fox nuts, lotus seeds, or phool makhana, is a popular superfood in India that's gaining worldwide recognition. 
      But what exactly is makhana, and why is it suddenly everywhere? This complete guide answers all your questions.
    </p>

    {/* Makhana Pond/Plant Image */}
    <div className="my-8 rounded-xl overflow-hidden shadow-md">
      <img 
        src="https://res.cloudinary.com/dujkkenmf/image/upload/v1769243225/products/xh9lpswvcabiuqysqcwa.webp" 
        alt="Makhana Growing in Mithila Wetlands" 
        className="w-full h-80 object-cover"
      />
      <p className="text-sm text-gray-600 text-center py-2 bg-gray-50">Makhana Growing in Traditional Mithila Wetlands</p>
    </div>

    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">What is Makhana? The Basics</h2>
    <p className="text-gray-700 leading-relaxed">
      Makhana are the seeds of the Euryale Fox plant (scientific name: <em>Euryale ferox</em>), which grows in stagnant water bodies, 
      particularly in North Bihar's Mithila region. These seeds are harvested from lotus flowers, roasted, and popped to create the 
      white, crunchy puffs we know as makhana.
    </p>

    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mt-6">
      <h3 className="text-lg font-bold text-blue-900 mb-2">Quick Facts About Makhana</h3>
      <ul className="list-disc list-inside space-y-1 text-gray-700">
        <li><strong>Other Names:</strong> Fox nuts, lotus seeds, phool makhana, gorgon nuts</li>
        <li><strong>Origin:</strong> Mithila region of Bihar, India</li>
        <li><strong>Plant:</strong> Euryale ferox (water lily family)</li>
        <li><strong>Harvest Season:</strong> November to February</li>
        <li><strong>GI Tag:</strong> Makhana from Mithila has Geographical Indication certification</li>
      </ul>
    </div>

    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How is Makhana Made?</h2>
    <p className="text-gray-700 leading-relaxed">
      The process of making makhana is labor-intensive and requires skilled workers:
    </p>

    {/* Processing Image */}
    <div className="my-8 rounded-xl overflow-hidden shadow-md">
      <img 
        src="https://res.cloudinary.com/dujkkenmf/image/upload/v1769243016/products/nevehoaogbeowjdrwewa.webp" 
        alt="Traditional Makhana Processing" 
        className="w-full h-80 object-cover"
      />
      <p className="text-sm text-gray-600 text-center py-2 bg-gray-50">Traditional Makhana Processing Method</p>
    </div>

    <ol className="list-decimal list-inside space-y-3 text-gray-700 mt-4">
      <li><strong>Collection:</strong> Seeds are collected from lotus ponds in Mithila region</li>
      <li><strong>Sun Drying:</strong> Seeds are dried in the sun for several days</li>
      <li><strong>Roasting:</strong> Seeds are roasted in hot sand at high temperature</li>
      <li><strong>Popping:</strong> Heat causes seeds to pop and expand into white puffs</li>
      <li><strong>Polishing:</strong> Black outer shell is removed by hand to reveal white makhana</li>
      <li><strong>Grading:</strong> Sorted by size into grades (7 Suta, 8 Suta, Lawa, etc.)</li>
    </ol>

    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Nutritional Profile of Makhana</h2>
    <p className="text-gray-700 leading-relaxed mb-4">
      Makhana is incredibly nutritious. Here's what 100g of makhana contains:
    </p>
    <div className="bg-gray-50 p-6 rounded-lg">
      <ul className="space-y-2 text-gray-700">
        <li>✅ <strong>Calories:</strong> 347 kcal</li>
        <li>✅ <strong>Protein:</strong> 9.7g (excellent plant-based protein)</li>
        <li>✅ <strong>Carbohydrates:</strong> 76.9g</li>
        <li>✅ <strong>Fat:</strong> 0.1g (extremely low fat)</li>
        <li>✅ <strong>Fiber:</strong> High (aids digestion)</li>
        <li>✅ <strong>Calcium:</strong> 60mg (for strong bones)</li>
        <li>✅ <strong>Magnesium:</strong> 90mg (heart health)</li>
        <li>✅ <strong>Potassium:</strong> 500mg (blood pressure control)</li>
        <li>✅ <strong>Iron:</strong> 1.4mg</li>
        <li>✅ <strong>Antioxidants:</strong> Rich in kaempferol</li>
      </ul>
    </div>

    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Different Types and Grades of Makhana</h2>
    <p className="text-gray-700 leading-relaxed">
      Makhana is graded based on size. Larger sizes are premium quality:
    </p>
    <ul className="list-disc list-inside space-y-2 text-gray-700 mt-4">
      <li><strong>Lawa:</strong> Smallest grade, broken pieces, most affordable</li>
      <li><strong>Rasgulla:</strong> Small whole seeds</li>
      <li><strong>Samundari:</strong> Medium-sized seeds</li>
      <li><strong>7 Suta:</strong> Large premium seeds (most popular)</li>
      <li><strong>8 Suta:</strong> Extra-large premium seeds (highest quality)</li>
    </ul>

    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Health Benefits of Makhana</h2>
    <div className="grid md:grid-cols-2 gap-4 mt-4">
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-bold text-green-900 mb-2">✅ Weight Management</h3>
        <p className="text-sm text-gray-700">Low calorie, high fiber - keeps you full longer</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-bold text-green-900 mb-2">✅ Heart Health</h3>
        <p className="text-sm text-gray-700">Rich in magnesium and potassium</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-bold text-green-900 mb-2">✅ Diabetes Control</h3>
        <p className="text-sm text-gray-700">Low glycemic index stabilizes blood sugar</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-bold text-green-900 mb-2">✅ Anti-Aging</h3>
        <p className="text-sm text-gray-700">Antioxidants fight free radicals</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-bold text-green-900 mb-2">✅ Bone Strength</h3>
        <p className="text-sm text-gray-700">High calcium content strengthens bones</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-bold text-green-900 mb-2">✅ Gluten-Free</h3>
        <p className="text-sm text-gray-700">Perfect for celiac disease patients</p>
      </div>
    </div>

    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How to Use Makhana?</h2>
    <p className="text-gray-700 leading-relaxed mb-4">
      Makhana is incredibly versatile. Here are popular ways to consume it:
    </p>
    <ul className="list-disc list-inside space-y-2 text-gray-700">
      <li><strong>Roasted Snacks:</strong> Simply roast in ghee with salt and spices</li>
      <li><strong>Makhana Kheer:</strong> Traditional Indian dessert</li>
      <li><strong>Curries:</strong> Add to vegetable or paneer curries</li>
      <li><strong>Trail Mix:</strong> Mix with nuts and dried fruits</li>
      <li><strong>Soups:</strong> Add crunch to creamy soups</li>
      <li><strong>Desserts:</strong> Make ladoos, barfi, or energy balls</li>
    </ul>

    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Why Mithila Makhana is Special?</h2>
    <p className="text-gray-700 leading-relaxed">
      Makhana from the Mithila region of Bihar (Darbhanga, Madhubani, Samastipur districts) has been granted GI (Geographical Indication) tag. 
      This certification recognizes that Mithila makhana is superior in quality due to:
    </p>
    <ul className="list-disc list-inside space-y-2 text-gray-700 mt-4">
      <li>Unique climatic conditions of the region</li>
      <li>Traditional harvesting and processing methods</li>
      <li>Lower moisture content (below 3%)</li>
      <li>Higher pop rate (above 85%)</li>
      <li>Better taste and crunchiness</li>
      <li>Longer shelf life</li>
    </ul>

    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Makhana vs Other Snacks</h2>
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full bg-white border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 border-b text-left">Snack</th>
            <th className="py-3 px-4 border-b text-left">Calories (100g)</th>
            <th className="py-3 px-4 border-b text-left">Fat</th>
            <th className="py-3 px-4 border-b text-left">Protein</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-3 px-4 border-b font-bold">Makhana</td>
            <td className="py-3 px-4 border-b">347</td>
            <td className="py-3 px-4 border-b">0.1g</td>
            <td className="py-3 px-4 border-b">9.7g</td>
          </tr>
          <tr className="bg-gray-50">
            <td className="py-3 px-4 border-b">Potato Chips</td>
            <td className="py-3 px-4 border-b">536</td>
            <td className="py-3 px-4 border-b">34g</td>
            <td className="py-3 px-4 border-b">6.6g</td>
          </tr>
          <tr>
            <td className="py-3 px-4 border-b">Popcorn</td>
            <td className="py-3 px-4 border-b">387</td>
            <td className="py-3 px-4 border-b">4.5g</td>
            <td className="py-3 px-4 border-b">12.9g</td>
          </tr>
          <tr className="bg-gray-50">
            <td className="py-3 px-4 border-b">Almonds</td>
            <td className="py-3 px-4 border-b">579</td>
            <td className="py-3 px-4 border-b">50g</td>
            <td className="py-3 px-4 border-b">21g</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How to Store Makhana?</h2>
    <ul className="list-disc list-inside space-y-2 text-gray-700">
      <li>Store in airtight containers to prevent moisture absorption</li>
      <li>Keep in a cool, dry place away from sunlight</li>
      <li>Quality makhana with &lt;3% moisture lasts 12+ months</li>
      <li>If makhana becomes soft, re-roast on low flame to regain crispness</li>
      <li>Don't store with strong-smelling foods (absorbs odors)</li>
    </ul>

    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Who Should Eat Makhana?</h2>
    <p className="text-gray-700 leading-relaxed mb-4">
      Makhana is suitable for almost everyone:
    </p>
    <ul className="list-disc list-inside space-y-2 text-gray-700">
      <li>✅ People trying to lose weight</li>
      <li>✅ Diabetes patients (low glycemic index)</li>
      <li>✅ Heart patients (low sodium, high potassium)</li>
      <li>✅ Pregnant and nursing mothers</li>
      <li>✅ Children above 2 years</li>
      <li>✅ Elderly people (easy to digest)</li>
      <li>✅ Athletes (good source of energy)</li>
      <li>✅ People with gluten intolerance</li>
    </ul>

    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mt-8">
      <h3 className="text-xl font-bold text-yellow-900 mb-3">⚠️ Any Side Effects?</h3>
      <p className="text-gray-700 leading-relaxed">
        Makhana is generally very safe. However, consume in moderation (20-30g per day). Excessive consumption may cause:
      </p>
      <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2">
        <li>Bloating or gas (due to high fiber)</li>
        <li>Constipation if not drinking enough water</li>
        <li>Allergic reactions in rare cases</li>
      </ul>
    </div>

    <div className="bg-green-50 border-l-4 border-green-500 p-6 mt-8">
      <h3 className="text-xl font-bold text-green-900 mb-3">Where to Buy Authentic Makhana?</h3>
      <p className="text-gray-700 leading-relaxed">
        Look for GI-certified Mithila makhana with lab-tested quality certifications. At Makhaantraa Foods, we offer:
      </p>
      <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2">
        <li>✅ <strong>GI-Tagged:</strong> Authentic Mithila makhana</li>
        <li>✅ <strong>Low Moisture:</strong> Less than 3% for maximum crispness</li>
        <li>✅ <strong>High Pop Rate:</strong> Above 85% for quality assurance</li>
        <li>✅ <strong>Lab Tested:</strong> Quality certificates available</li>
        <li>✅ <strong>Multiple Grades:</strong> 7 Suta, 8 Suta, Lawa available</li>
        <li>✅ <strong>Free Samples:</strong> Try before you buy!</li>
      </ul>
    </div>
  </div>
);

export default function WhatIsMakhanaPost() {
  return (
    <BlogPostTemplate
      title="What is Makhana? Complete Guide to Fox Nuts (Lotus Seeds) 2026"
      excerpt="Everything you need to know about makhana (fox nuts). Learn what it is, how it's made, nutritional benefits, types, uses, and why Mithila makhana is the best. Complete beginner's guide."
      content={<WhatIsMakhanaArticle />}
      author="Rajesh Kumar, Food Scientist"
      date="2026-02-06"
      category="Education"
      tags={[
        "what is makhana",
        "fox nuts",
        "lotus seeds",
        "makhana benefits",
        "GI tagged makhana",
        "Mithila makhana",
        "phool makhana"
      ]}
      featuredImage="https://images.unsplash.com/photo-1587049352846-4a222e784l94?w=1200"
      slug="what-is-makhana"
    />
  );
}
