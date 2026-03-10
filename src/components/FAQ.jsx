import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = ({ faqs, title = "Frequently Asked Questions", subtitle = "Everything you need to know about our makhana products" }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Generate FAQ Schema markup for Google Rich Results
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      {/* Add FAQ Schema to page */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">{title}</h2>
          {subtitle && <p className="text-slate-600 text-lg">{subtitle}</p>}
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-green-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-5 text-left focus:outline-none focus:ring-2 focus:ring-green-200 rounded-xl"
                aria-expanded={openIndex === index}
              >
                <h3 className="text-lg font-semibold text-slate-900 pr-4">
                  {faq.question}
                </h3>
                {openIndex === index ? (
                  <ChevronUp className="flex-shrink-0 w-5 h-5 text-green-600" />
                ) : (
                  <ChevronDown className="flex-shrink-0 w-5 h-5 text-slate-400" />
                )}
              </button>

              {openIndex === index && (
                <div className="px-5 pb-5">
                  <div className="pt-2 border-t border-green-50">
                    <p className="text-slate-700 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default FAQ;

// Default Makhana FAQs - can be imported and used anywhere
export const makhaanaFAQs = [
  {
    question: "What is makhana and where does it come from?",
    answer: "Makhana, also known as fox nuts or lotus seeds, are edible seeds from the Euryale Fox plant. Our makhana is sourced from GI-tagged Mithila region in Bihar, India, known for producing the highest quality makhana in the world with superior crunch and nutritional value."
  },
  {
    question: "Is your makhana GI-certified and what does that mean?",
    answer: "Yes, our makhana has the GI (Geographical Indication) tag from Mithila, Bihar. This certification ensures authentic origin, superior quality standards, traditional processing methods, and guaranteed nutrition content. It's like a seal of quality that cannot be replicated elsewhere."
  },
  {
    question: "What are the health benefits of makhana?",
    answer: "Makhana is a superfood packed with protein, fiber, calcium, magnesium, and antioxidants. It's low in calories, has a low glycemic index, is gluten-free, and excellent for weight management, heart health, and diabetes management. It's also rich in kaempferol which has anti-inflammatory and anti-aging properties."
  },
  {
    question: "How should I store makhana to keep it fresh?",
    answer: "Store makhana in an airtight container in a cool, dry place away from direct sunlight. Once opened, keep it sealed to maintain crunchiness. For extended freshness, you can refrigerate it. Properly stored, our makhana stays fresh for 6-12 months due to our nitrogen-flushed packaging."
  },
  {
    question: "Do you offer bulk orders or wholesale rates?",
    answer: "Yes! We cater to all order sizes - from small retail packs to bulk wholesale quantities. We offer special pricing for bulk orders (50kg+) and export-ready packaging. Contact us for wholesale rates, MOQ details, and custom packaging options for your business needs."
  },
  {
    question: "Can I get a free sample before placing a bulk order?",
    answer: "Absolutely! We offer free samples for qualified buyers and businesses interested in bulk orders. Simply fill out our sample request form with your details and requirements. Samples are dispatched within 24-48 hours so you can test the quality before committing to larger orders."
  },
  {
    question: "What is the moisture content and pop rate of your makhana?",
    answer: "Our premium makhana maintains moisture content below 3% through controlled processing and nitrogen-flushed packaging. The pop rate (expansion during roasting) is 98%+ for our flagship grades, ensuring consistent quality, superior crunch, and longer shelf life."
  },
  {
    question: "How is your makhana processed and is it chemical-free?",
    answer: "Our makhana undergoes traditional hand-sorting and modern hygienic processing without any chemicals. We use heat processing for puffing, followed by grading, cleaning, and nitrogen flushing for packaging. It's 100% natural with no preservatives, artificial colors, or additives."
  },
  {
    question: "What sizes and grades of makhana do you offer?",
    answer: "We offer 7 different grades: 7 Suta (16mm+ premium), 6 Suta (14-16mm), 5 Suta (12-14mm), 4 Suta (10-12mm), Raw Makhana, Roasted Makhana, and Flavored Makhana. Each grade is suited for different applications from premium retail to bulk processing."
  },
  {
    question: "Do you ship pan-India and internationally?",
    answer: "Yes, we provide pan-India delivery with reliable courier partners. For international orders and exports, we offer documentation support, export-grade packaging with proper labeling, and assistance with customs. Contact us for international shipping rates and lead times."
  }
];
