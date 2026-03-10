import React from 'react';
import BlogPostTemplate from '../../components/BlogPostTemplate';

const MakhanaRecipesArticle = () => (
  <div className="space-y-6">
    <p className="text-lg text-gray-700 leading-relaxed">
      Makhana (fox nuts) is not just a healthy snack - it's a versatile ingredient that can transform your meals! 
      From crunchy roasted snacks to creamy desserts, here are 7 delicious makhana recipes that are both nutritious and easy to make.
    </p>

    {/* Fresh Makhana Image */}
    <div className="my-8 rounded-xl overflow-hidden shadow-md">
      <img 
        src="https://res.cloudinary.com/dujkkenmf/image/upload/v1769242708/products/rtrnbzqs942qpk1bndb8.jpg" 
        alt="Premium Roasted Makhana" 
        className="w-full h-80 object-cover"
      />
      <p className="text-sm text-gray-600 text-center py-2 bg-gray-50">Premium Roasted Makhana - Perfect for Cooking</p>
    </div>

    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Classic Roasted Makhana</h2>
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="font-semibold text-lg mb-3">Ingredients:</h3>
      <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
        <li>2 cups makhana</li>
        <li>1 tbsp ghee or olive oil</li>
        <li>1/2 tsp salt</li>
        <li>1/4 tsp black pepper</li>
        <li>1/4 tsp chaat masala (optional)</li>
      </ul>
      <h3 className="font-semibold text-lg mb-3">Method:</h3>
      <ol className="list-decimal list-inside space-y-2 text-gray-700">
        <li>Heat ghee in a pan on low flame</li>
        <li>Add makhana and roast for 8-10 minutes, stirring continuously</li>
        <li>When crispy, turn off heat and add salt, pepper, and chaat masala</li>
        <li>Let cool completely. Store in an airtight container</li>
      </ol>
      <p className="mt-4 text-sm text-gray-600">⏱️ Prep Time: 2 mins | Cook Time: 10 mins | Calories: ~170 per serving</p>
    </div>

    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Makhana Kheer (Fox Nut Pudding)</h2>
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="font-semibold text-lg mb-3">Ingredients:</h3>
      <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
        <li>1 cup makhana, crushed</li>
        <li>1 liter full-fat milk</li>
        <li>4-5 tbsp sugar (or to taste)</li>
        <li>1/4 tsp cardamom powder</li>
        <li>10-12 almonds and cashews, chopped</li>
        <li>Few strands of saffron</li>
      </ul>
      <h3 className="font-semibold text-lg mb-3">Method:</h3>
      <ol className="list-decimal list-inside space-y-2 text-gray-700">
        <li>Dry roast makhana until crispy, then crush coarsely</li>
        <li>Boil milk and add crushed makhana</li>
        <li>Simmer for 20 minutes, stirring occasionally</li>
        <li>Add sugar, cardamom, and saffron</li>
        <li>Garnish with nuts. Serve hot or chilled</li>
      </ol>
      <p className="mt-4 text-sm text-gray-600">⏱️ Prep Time: 5 mins | Cook Time: 25 mins | Perfect for festivals!</p>
    </div>

    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Spicy Masala Makhana</h2>
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="font-semibold text-lg mb-3">Ingredients:</h3>
      <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
        <li>2 cups makhana</li>
        <li>1 tbsp ghee</li>
        <li>1/2 tsp cumin powder</li>
        <li>1/2 tsp red chili powder</li>
        <li>1/4 tsp turmeric powder</li>
        <li>1/2 tsp chaat masala</li>
        <li>Salt to taste</li>
        <li>1 tsp lemon juice</li>
      </ul>
      <h3 className="font-semibold text-lg mb-3">Method:</h3>
      <ol className="list-decimal list-inside space-y-2 text-gray-700">
        <li>Roast makhana in ghee until crispy</li>
        <li>In a bowl, mix all spices with lemon juice</li>
        <li>Add hot roasted makhana and toss well</li>
        <li>Perfect evening snack with tea!</li>
      </ol>
      <p className="mt-4 text-sm text-gray-600">⏱️ Prep Time: 3 mins | Cook Time: 10 mins | Spice level: Medium</p>
    </div>

    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Makhana Curry (Sabzi)</h2>
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="font-semibold text-lg mb-3">Ingredients:</h3>
      <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
        <li>2 cups makhana, roasted</li>
        <li>2 tomatoes, pureed</li>
        <li>1 onion, finely chopped</li>
        <li>1/2 cup cashew paste</li>
        <li>1 tsp ginger-garlic paste</li>
        <li>1 tsp garam masala</li>
        <li>1/2 tsp red chili powder</li>
        <li>Fresh cream for garnish</li>
      </ul>
      <h3 className="font-semibold text-lg mb-3">Method:</h3>
      <ol className="list-decimal list-inside space-y-2 text-gray-700">
        <li>Sauté onions until golden, add ginger-garlic paste</li>
        <li>Add tomato puree and cook until oil separates</li>
        <li>Add cashew paste and spices, cook for 5 mins</li>
        <li>Add roasted makhana and water, simmer for 10 mins</li>
        <li>Garnish with cream. Serve with roti or rice</li>
      </ol>
      <p className="mt-4 text-sm text-gray-600">⏱️ Prep Time: 10 mins | Cook Time: 25 mins | Serves: 4</p>
    </div>

    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Chocolate Makhana Energy Balls</h2>
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="font-semibold text-lg mb-3">Ingredients:</h3>
      <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
        <li>1 cup makhana, roasted and powdered</li>
        <li>1/2 cup dates, deseeded</li>
        <li>2 tbsp cocoa powder</li>
        <li>2 tbsp peanut butter</li>
        <li>1 tbsp honey</li>
        <li>Desiccated coconut for coating</li>
      </ul>
      <h3 className="font-semibold text-lg mb-3">Method:</h3>
      <ol className="list-decimal list-inside space-y-2 text-gray-700">
        <li>Blend dates into a paste</li>
        <li>Mix makhana powder, cocoa, peanut butter, honey, and date paste</li>
        <li>Roll into small balls and coat with coconut</li>
        <li>Refrigerate for 30 mins. Healthy dessert ready!</li>
      </ol>
      <p className="mt-4 text-sm text-gray-600">⏱️ Prep Time: 15 mins | No cooking! | Kid-friendly</p>
    </div>

    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Caramel Makhana</h2>
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="font-semibold text-lg mb-3">Ingredients:</h3>
      <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
        <li>2 cups roasted makhana</li>
        <li>1/2 cup sugar</li>
        <li>2 tbsp butter</li>
        <li>1/4 tsp salt</li>
        <li>1/4 tsp vanilla essence</li>
      </ul>
      <h3 className="font-semibold text-lg mb-3">Method:</h3>
      <ol className="list-decimal list-inside space-y-2 text-gray-700">
        <li>Melt butter and sugar in a pan until caramelized</li>
        <li>Add roasted makhana and coat well</li>
        <li>Add salt and vanilla, mix well</li>
        <li>Spread on parchment paper to cool. Break into clusters</li>
      </ol>
      <p className="mt-4 text-sm text-gray-600">⏱️ Prep Time: 5 mins | Cook Time: 10 mins | Sweet treat!</p>
    </div>

    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Makhana Trail Mix</h2>
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="font-semibold text-lg mb-3">Ingredients:</h3>
      <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
        <li>1 cup roasted makhana</li>
        <li>1/2 cup mixed nuts (almonds, cashews, walnuts)</li>
        <li>1/4 cup dried cranberries</li>
        <li>1/4 cup pumpkin seeds</li>
        <li>2 tbsp dark chocolate chips</li>
        <li>Pinch of sea salt</li>
      </ul>
      <h3 className="font-semibold text-lg mb-3">Method:</h3>
      <ol className="list-decimal list-inside space-y-2 text-gray-700">
        <li>Mix all ingredients in a bowl</li>
        <li>Store in an airtight container</li>
        <li>Perfect on-the-go snack with protein, fiber, and healthy fats!</li>
      </ol>
      <p className="mt-4 text-sm text-gray-600">⏱️ Prep Time: 5 mins | No cooking! | Travel-friendly</p>
    </div>

    <div className="bg-green-50 border-l-4 border-green-500 p-6 mt-8">
      <h3 className="text-xl font-bold text-green-900 mb-3">Pro Tips for Perfect Makhana Recipes</h3>
      <ul className="list-disc list-inside space-y-2 text-gray-700">
        <li>Always roast makhana on low flame for even crispiness</li>
        <li>Store roasted makhana in airtight containers to maintain crunch</li>
        <li>Use ghee for traditional flavor and better health benefits</li>
        <li>Grind makhana fresh for recipes - don't use pre-ground</li>
        <li>Add makhana to curries just before serving to retain texture</li>
      </ul>
    </div>

    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mt-8">
      <h3 className="text-xl font-bold text-blue-900 mb-3">Order Premium GI-Tagged Makhana</h3>
      <p className="text-gray-700 leading-relaxed">
        Get the best quality makhana for your recipes! Our GI-certified Mithila makhana has high pop rate and low moisture, 
        ensuring perfect texture every time. Available in 7 Suta, 8 Suta, and Lawa grades. Order now and get free samples!
      </p>
    </div>
  </div>
);

export default function MakhanaRecipesPost() {
  return (
    <BlogPostTemplate
      title="7 Delicious Makhana Recipes - Easy & Healthy Fox Nut Dishes 2026"
      excerpt="Transform your makhana into amazing dishes! From roasted snacks to creamy kheer, discover 7 easy recipes with step-by-step instructions. Perfect for healthy eating and weight loss."
      content={<MakhanaRecipesArticle />}
      author="Chef Anjali Mehta"
      date="2026-02-07"
      category="Recipes"
      tags={[
        "makhana recipes",
        "fox nuts recipes",
        "healthy snacks",
        "Indian recipes",
        "makhana kheer",
        "roasted makhana",
        "makhana curry"
      ]}
      featuredImage="https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1200"
      slug="makhana-recipes"
    />
  );
}
