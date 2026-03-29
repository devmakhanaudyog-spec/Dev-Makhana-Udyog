import React, { useRef, useState, useEffect } from "react";
import axios from '../utils/api.js';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Leaf, Shield, Truck, Factory, Sparkles, ClipboardList, MessageCircle } from "lucide-react";
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import RazorpayPayment from '../components/RazorpayPayment';

const WEIGHT_OPTIONS = [100];

const normalizeName = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

const isExcludedSampleCategory = (value) => {
  const category = normalizeName(value).replace(/[-_]/g, ' ');
  return category === 'save on bundles' || category === 'save on bundle';
};

const stripTrailingWeight = (value) => {
  const text = String(value || '').trim();
  return text
    .replace(/\s*\(\s*\d+(?:\.\d+)?\s*(?:g|gm|grams|kg|kgs)\s*\)\s*$/i, '')
    .replace(/\s*[-,]?\s*\d+(?:\.\d+)?\s*(?:g|gm|grams|kg|kgs)\s*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

const getEffectivePrice = (product) => {
  const basePrice = Number(product?.price) || 0;
  const discount = Number(product?.discount) || 0;
  if (discount > 0) {
    return Math.max(0, basePrice - (basePrice * discount / 100));
  }
  return basePrice;
};

const SAMPLE_TYPE_CATALOG = {
  'Premium Size Grades': [
    '7 Suta Premium (16mm+, 99% Pop Rate)',
    '6 Suta Grade (14-16mm, 98% Pop Rate)',
    '5 Suta Grade (12-14mm, 97% Pop Rate)',
    '4 Suta Grade (10-12mm)'
  ],
  'Raw Makhana': [
    'Raw Makhana Classic',
    'Raw Makhana Export Grade',
    'Raw Makhana Bulk Processing'
  ],
  'Roasted Makhana': [
    'Light Roasted Makhana',
    'Salted Roasted Makhana',
    'Roasted Trial Mix'
  ],
  'Flavoured Makhana': [
    'Peri Peri Flavoured Makhana',
    'Cheese Flavoured Makhana',
    'Mint Flavoured Makhana',
    'Masala Flavoured Makhana'
  ]
};

export default function Makhana() {
  const navigate = useNavigate();
  const [footerVisible, setFooterVisible] = useState(false);
  const footerRef = useRef(null);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    const footer = document.querySelector('footer');
    if (footer) {
      observer.observe(footer);
      footerRef.current = footer;
    }
    return () => {
      if (footerRef.current) observer.unobserve(footerRef.current);
    };
  }, []);
  const formRef = useRef(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedTypesMulti, setSelectedTypesMulti] = useState([]);
  const [selectedQty, setSelectedQty] = useState(100);
  const [selectedSamples, setSelectedSamples] = useState([]);
  const [sampleTypeCatalog, setSampleTypeCatalog] = useState(SAMPLE_TYPE_CATALOG);
  const [productPriceLookup, setProductPriceLookup] = useState({});
  const { user } = useAuth();
  const { settings } = useSettings();
  const waNumber = '919142252059';
  const waMsg = encodeURIComponent('Hi! I am interested to Order makhana sample.');
  const waUrl = `https://wa.me/${waNumber}?text=${waMsg}`;

  const packageBasicPrice = Number(settings?.samplePackageBasicPrice) || 850;
  const packagePremiumPrice = Number(settings?.samplePackagePremiumPrice) || 1700;
  
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    makhanaType: "",
    sampleRequestType: "single",
    requirement: "",
    message: "",
    samplePackage: "",
    paymentMethod: "razorpay",
  });

  const payableAmount = form.sampleRequestType === 'package'
    ? Number(form.samplePackage) || 0
    : Number(
        selectedSamples
          .reduce((sum, item) => sum + (Number(item.lineAmount) || 0), 0)
          .toFixed(2)
      );

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const loadProductBackedSampleTypes = async () => {
      try {
        const response = await axios.get('/api/products?limit=2000');
        const products = Array.isArray(response.data?.products)
          ? response.data.products
          : Array.isArray(response.data)
            ? response.data
            : [];

        const dynamicCatalog = {};
        const lookup = {};
        const globalSeenNames = new Set();

        products.forEach((product) => {
          const category = String(product?.subCategory || product?.category || '').trim();
          const typeName = String(product?.name || product?.title || product?.productName || '').trim();
          const cleanedTypeName = stripTrailingWeight(typeName);
          const normalizedTypeName = normalizeName(cleanedTypeName);
          const unitPrice = getEffectivePrice(product);

          if (!category || !typeName || !cleanedTypeName || !normalizedTypeName) return;
          if (isExcludedSampleCategory(category)) return;
          if (globalSeenNames.has(normalizedTypeName)) return;

          globalSeenNames.add(normalizedTypeName);
          if (!dynamicCatalog[category]) dynamicCatalog[category] = [];
          dynamicCatalog[category].push(cleanedTypeName);
          lookup[normalizedTypeName] = {
            name: cleanedTypeName,
            category,
            unitPrice,
          };
        });

        const dynamicCatalogObject = Object.entries(dynamicCatalog).reduce((acc, [category, typeSet]) => {
          acc[category] = Array.from(new Set(typeSet)).sort((a, b) => a.localeCompare(b));
          return acc;
        }, {});

        if (isMounted && Object.keys(dynamicCatalogObject).length > 0) {
          setSampleTypeCatalog(dynamicCatalogObject);
          setProductPriceLookup(lookup);
        }
      } catch (fetchError) {
        // Keep curated fallback catalog if product fetch fails.
      }
    };

    loadProductBackedSampleTypes();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (form.sampleRequestType === 'single' && selectedSamples.length > 1) {
      setSelectedSamples((prev) => prev.slice(0, 1));
    }
  }, [form.sampleRequestType, selectedSamples.length]);

  useEffect(() => {
    if (form.sampleRequestType !== 'multiple' || !selectedCategory) return;

    const selectedInCategory = selectedSamples
      .filter((item) => item.category === selectedCategory)
      .map((item) => item.type);
    setSelectedTypesMulti(selectedInCategory);
  }, [form.sampleRequestType, selectedCategory]);

  useEffect(() => {
    if (form.sampleRequestType !== 'single' || !selectedCategory || !selectedType) return;

    const normalizedType = normalizeName(selectedType);
    const unitPrice = Number(productPriceLookup[normalizedType]?.unitPrice) || 0;
    const qty = Number(selectedQty) || 0;
    const lineAmount = Number((unitPrice * (qty / 1000)).toFixed(2));

    setSelectedSamples([{ category: selectedCategory, type: selectedType, quantityG: qty, unitPrice, lineAmount }]);
    setError(null);
  }, [form.sampleRequestType, selectedCategory, selectedType, selectedQty, productPriceLookup]);

  useEffect(() => {
    if (form.sampleRequestType !== 'multiple' || !selectedCategory) return;

    const qty = Number(selectedQty) || 0;
    const nextEntries = [];

    for (const type of selectedTypesMulti) {
      const normalizedType = normalizeName(type);
      const unitPrice = Number(productPriceLookup[normalizedType]?.unitPrice) || 0;
      if (unitPrice <= 0 || qty < 1 || qty > 100) continue;
      const lineAmount = Number((unitPrice * (qty / 1000)).toFixed(2));
      nextEntries.push({ category: selectedCategory, type, quantityG: qty, unitPrice, lineAmount });
    }

    setSelectedSamples((prev) => {
      const preserved = prev.filter((item) => item.category !== selectedCategory);
      return [...preserved, ...nextEntries];
    });
    setError(null);
  }, [form.sampleRequestType, selectedCategory, selectedTypesMulti, selectedQty, productPriceLookup]);

  useEffect(() => {
    if (selectedSamples.length === 0 || Object.keys(productPriceLookup).length === 0) return;

    setSelectedSamples((prev) => prev.map((item) => {
      const normalizedType = normalizeName(item.type);
      const unitPrice = Number(productPriceLookup[normalizedType]?.unitPrice) || 0;
      const qty = Number(item.quantityG) || 0;
      const lineAmount = Number((unitPrice * (qty / 1000)).toFixed(2));
      return { ...item, unitPrice, lineAmount };
    }));
  }, [productPriceLookup]);

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('Please login first to continue with sample order payment.');
      navigate('/login?next=/makhana-sample');
      return;
    }

    if (form.sampleRequestType === 'package' && !form.samplePackage) {
      setError('Please select a sample package before payment.');
      return;
    }

    if (payableAmount <= 0) {
      setError('Unable to process payment amount. Please reselect request type or package.');
      return;
    }

    if (form.sampleRequestType !== 'package' && selectedSamples.length === 0) {
      setError('Please add at least one Makhana type for sample request.');
      return;
    }

    const invalidQtyItem = selectedSamples.find((item) => Number(item.quantityG) > 100 || Number(item.quantityG) < 1);
    if (invalidQtyItem) {
      setError('Each selected Makhana type must be between 1g and 100g.');
      return;
    }

    setShowPaymentModal(true);
  };

  const sampleCategories = Object.keys(sampleTypeCatalog);

  const addSampleType = () => {
    if (!selectedCategory) {
      setError('Please select a category first.');
      return;
    }

    const typesToAdd = selectedType
        ? [selectedType]
        : [];

    if (typesToAdd.length === 0) {
      setError('Please select a Makhana type.');
      return;
    }

    const qty = Number(selectedQty) || 0;
    if (qty < 1 || qty > 100) {
      setError('Sample quantity per type can be max 100g.');
      return;
    }

    const nextEntries = [];
    for (const type of typesToAdd) {
      const normalizedType = normalizeName(type);
      const unitPrice = Number(productPriceLookup[normalizedType]?.unitPrice) || 0;
      if (unitPrice <= 0) {
        setError(`Selected Makhana type price is unavailable: ${type}`);
        return;
      }
      const lineAmount = Number((unitPrice * (qty / 1000)).toFixed(2));
      nextEntries.push({ category: selectedCategory, type, quantityG: qty, unitPrice, lineAmount });
    }

    setError(null);

    if (form.sampleRequestType !== 'single') {
      return;
    }

    if (form.sampleRequestType === 'single') {
      setSelectedSamples([nextEntries[0]]);
      return;
    }

    setSelectedType('');
    setSelectedQty(100);
  };

  const removeSampleType = (index) => {
    setSelectedSamples((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSampleQty = (index, quantityG) => {
    const qty = Math.max(1, Math.min(100, Number(quantityG) || 1));
    setSelectedSamples((prev) => prev.map((item, i) => {
      if (i !== index) return item;
      const lineAmount = Number(((Number(item.unitPrice) || 0) * (qty / 1000)).toFixed(2));
      return { ...item, quantityG: qty, lineAmount };
    }));
  };

  const handlePaymentSuccess = async (paymentData) => {
    setLoading(true);
    setError(null);

    try {
      const sampleItems = selectedSamples.map((item) => ({
        category: item.category,
        type: item.type,
        quantityG: Number(item.quantityG) || 0,
        unitPrice: Number(item.unitPrice) || 0,
        lineAmount: Number(item.lineAmount) || 0,
      }));
      const makhanaTypeText = form.sampleRequestType === 'package'
        ? `Package Sample (${form.samplePackage})`
        : sampleItems.map((item) => `${item.type} (${item.quantityG}g)`).join(', ');

      const payload = {
        ...form,
        makhanaType: makhanaTypeText,
        sampleItems,
        paymentMethod: 'razorpay',
        paymentStatus: 'Paid',
        chargedAmount: payableAmount,
        paymentId: paymentData.paymentId,
        razorpayOrderId: paymentData.orderId,
        razorpayPaymentId: paymentData.paymentId,
        razorpaySignature: paymentData.signature,
      };

      await axios.post('/api/free-samples/submit', payload);
      setStatus("sent");
      setShowPaymentModal(false);
      setForm({
        name: user?.name || "",
        company: "",
        phone: user?.phone || "",
        email: user?.email || "",
        addressLine1: "",
        addressLine2: "",
        landmark: "",
        city: "",
        district: "",
        state: "",
        pincode: "",
        makhanaType: "",
        sampleRequestType: 'single',
        requirement: "",
        message: "",
        samplePackage: "",
        paymentMethod: "razorpay",
      });
      setSelectedCategory('');
      setSelectedType('');
      setSelectedQty(100);
      setSelectedSamples([]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit request after payment. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentFailure = (paymentError) => {
    setShowPaymentModal(false);
    setError(paymentError || 'Payment failed or cancelled. Please try again.');
  };

  const infoBlocks = [
    { title: "GI-tagged Mithila", desc: "Authentic Bihar-origin fox nuts with traceable sourcing." },
    { title: "Lab-tested", desc: "Moisture < 3%, premium grade, hand-sorted for crunch." },
    { title: "Healthy Fuel", desc: "High protein, low GI, gluten-free and roasted without oil." },
    { title: "Bulk Ready", desc: "Export-grade packaging with consistent lot-wise QC." },
  ];

  const specs = [
    { label: "Size", value: "Premium 14mm+ sorted" },
    { label: "Pop Rate", value: "98%+" },
    { label: "Moisture", value: "Below 3%" },
    { label: "Origin", value: "Mithila, Bihar (GI-tagged)" },
    { label: "Certifications", value: "FSSAI, ISO-ready lots" },
    { label: "Packaging", value: "200g / 1kg / 6kg / 7kg / 10kg nitrogen-flushed" },
  ];

  const faqs = [
    { q: "Is the sample free?", a: "No, the sample is Charged with Minimal Amount; confirm the shipping details; shipping Charge is Free." },
    { q: "Do you support bulk and export?", a: "Yes, we supply bulk and export-ready lots with documentation." },
    { q: "Are these roasted?", a: "Samples are raw premium grade so you can process to your flavor profile. Roasted Sample is also Avilable" },
    { q: "How fast can you ship?", a: "Samples dispatch in 12-24h; bulk timelines are shared lot-wise." },
  ];

  return (
    <div className="bg-brand-soft min-h-screen overflow-x-hidden">
      <section className="bg-brand-gradient text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm">
              <Leaf size={16} /> Premium Natural Makhana
            </p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Get Sample of Export-grade GI-tagged Makhana
            </h1>
            <p className="text-white/90 text-lg">
              Crispy, nutrient-dense fox nuts sourced directly from Bihar farmers. Limited free sample for qualified buyers and retailers.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={scrollToForm} className="bg-white text-brand font-semibold px-5 py-3 rounded-lg shadow-brand hover:opacity-95 transition">
                Get Sample
              </button>
              <button onClick={() => document.getElementById("specs")?.scrollIntoView({ behavior: "smooth" })} className="btn-brand-ghost px-5 py-3 rounded-lg bg-white text-brand font-semibold">
                View Specs
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4 text-sm text-white/90">
              <div className="flex items-center gap-2"><CheckCircle size={18} /> GI-tagged Mithila origin</div>
              <div className="flex items-center gap-2"><CheckCircle size={18} /> Lab-tested, moisture &lt; 3%</div>
              <div className="flex items-center gap-2"><CheckCircle size={18} /> FSSAI compliant lots</div>
              <div className="flex items-center gap-2"><CheckCircle size={18} /> Bulk & export ready</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur p-6 rounded-2xl border border-white/20 shadow-brand">
            <h3 className="text-xl font-semibold mb-4">Quick Facts</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold">98%+</div>
                <div className="opacity-80">Pop rate</div>
              </div>
              <div className="p-4 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold">&lt; 3%</div>
                <div className="opacity-80">Moisture &lt; 3%</div>
              </div>
              <div className="p-4 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold">GI</div>
                <div className="opacity-80">Mithila origin</div>
              </div>
              <div className="p-4 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold">24-48h</div>
                <div className="opacity-80">Sample dispatch</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-6">
        {infoBlocks.map((b) => (
          <div key={b.title} className="bg-white rounded-xl shadow-brand p-6 border border-green-50">
            <h4 className="font-semibold text-brand mb-2">{b.title}</h4>
            <p className="text-slate-700 text-sm">{b.desc}</p>
          </div>
        ))}
      </section>

      <section id="specs" className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10 items-start">
        <div className="space-y-4">
          <p className="pill-brand inline-flex items-center gap-2"><Shield size={16} /> Quality & Compliance</p>
          <h2 className="text-3xl font-bold text-brand">What makes our Makhana export-ready?</h2>
          <ul className="space-y-3 text-slate-700">
            <li className="flex gap-3"><Shield className="text-brand" size={20} /> Lot-wise COA and moisture control for crunch and shelf life.</li>
            <li className="flex gap-3"><Factory className="text-brand" size={20} /> Hygienic processing, hand-sorting for uniform size and color.</li>
            <li className="flex gap-3"><Truck className="text-brand" size={20} /> Nitrogen-flushed packs, 1kg to 25kg with palletized export option.</li>
            <li className="flex gap-3"><Sparkles className="text-brand" size={20} /> Neutral taste profile, ready for roasting, seasoning, or retail packing.</li>
          </ul>
        </div>
        <div className="bg-white rounded-2xl shadow-brand p-6 border border-green-50">
          <h3 className="text-xl font-semibold mb-4">Specifications</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {specs.map((s) => (
              <div key={s.label} className="p-3 rounded-lg bg-green-50/80">
                <div className="text-xs uppercase text-slate-500">{s.label}</div>
                <div className="font-semibold text-slate-800">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-6">
        {["Retail & D2C", "Foodservice", "Export & Private Label"].map((title) => (
          <div key={title} className="bg-white p-6 rounded-xl shadow-brand border border-green-50">
            <h4 className="font-semibold text-brand mb-2">{title}</h4>
            <p className="text-sm text-slate-700">Consistent lots, neutral flavor, ready for roasting and seasoning. Ideal for healthy snacking lines.</p>
          </div>
        ))}
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-brand p-6 md:p-8 border border-green-50" ref={formRef}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <p className="pill-brand inline-flex items-center gap-2"><ClipboardList size={16} /> Request Sample</p>
              <h3 className="text-3xl font-bold text-brand mt-2">Order your first Makhana sample</h3>
              <p className="text-slate-700">Share your details so we can dispatch a lot-matched sample within 24 hours.</p>
            </div>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-700 hover:text-brand transition">
              <MessageCircle className="text-[#25D366]" size={18} /> Need help?
            </a>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <input className="w-full input-brand p-3 placeholder:text-xs md:placeholder:text-sm bg-gray-100 cursor-not-allowed" placeholder="Full Name" value={form.name} readOnly disabled required />
            <input className="w-full input-brand p-3 placeholder:text-xs md:placeholder:text-sm" placeholder="Company / Brand" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            <input className="w-full input-brand p-3 placeholder:text-xs md:placeholder:text-sm bg-gray-100 cursor-not-allowed" placeholder="Phone" value={form.phone} readOnly disabled required />
            <input className="w-full input-brand p-3 placeholder:text-xs md:placeholder:text-sm bg-gray-100 cursor-not-allowed" placeholder="Email" type="email" value={form.email} readOnly disabled required />
            
            <input className="w-full input-brand p-3 md:col-span-2 placeholder:text-xs md:placeholder:text-sm" placeholder="Address Line 1 (House/Building No., Street)" value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} required />
            <input className="w-full input-brand p-3 md:col-span-2 placeholder:text-xs md:placeholder:text-sm" placeholder="Address Line 2 (Area, Locality)" value={form.addressLine2} onChange={(e) => setForm({ ...form, addressLine2: e.target.value })} />
            <input className="w-full input-brand p-3 placeholder:text-xs md:placeholder:text-sm" placeholder="Landmark (Optional)" value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} />
            <input className="w-full input-brand p-3 placeholder:text-xs md:placeholder:text-sm" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
            <input className="w-full input-brand p-3 placeholder:text-xs md:placeholder:text-sm" placeholder="District" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} required />
            <input className="w-full input-brand p-3 placeholder:text-xs md:placeholder:text-sm" placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
            <input className="w-full input-brand p-3 placeholder:text-xs md:placeholder:text-sm" placeholder="PIN Code" type="text" pattern="[0-9]{6}" maxLength="6" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} required />
            <div className="w-full md:col-span-2 rounded-xl border border-green-100 p-4 bg-green-50/40">
              <label className="block font-semibold text-brand mb-3">Sample Type Selection</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, sampleRequestType: 'single' })}
                  className={`p-2 rounded-lg border text-sm font-semibold transition ${form.sampleRequestType === 'single' ? 'bg-green-600 text-white border-green-700 shadow ring-2 ring-green-200' : 'bg-white border-green-200 text-slate-700 hover:border-green-300 hover:bg-green-50'}`}
                >
                  Single Type
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, sampleRequestType: 'multiple' })}
                  className={`p-2 rounded-lg border text-sm font-semibold transition ${form.sampleRequestType === 'multiple' ? 'bg-green-600 text-white border-green-700 shadow ring-2 ring-green-200' : 'bg-white border-green-200 text-slate-700 hover:border-green-300 hover:bg-green-50'}`}
                >
                  Multiple Types
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, sampleRequestType: 'package' })}
                  className={`p-2 rounded-lg border text-sm font-semibold transition ${form.sampleRequestType === 'package' ? 'bg-green-600 text-white border-green-700 shadow ring-2 ring-green-200' : 'bg-white border-green-200 text-slate-700 hover:border-green-300 hover:bg-green-50'}`}
                >
                  Package Only
                </button>
              </div>

              {form.sampleRequestType !== 'package' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                    <select
                      className="w-full input-brand p-3 md:col-span-4"
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setSelectedType('');
                        setSelectedTypesMulti([]);
                      }}
                    >
                      <option value="" disabled>Select Category</option>
                      {sampleCategories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>

                    {form.sampleRequestType === 'multiple' ? (
                      <div className="w-full md:col-span-5 border border-green-200 rounded-lg bg-white p-2">
                        <div className="flex items-center justify-between px-1 pb-2 border-b border-green-100">
                          <span className="text-xs font-semibold text-slate-600">Select multiple types</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">
                              {selectedTypesMulti.length} selected
                            </span>
                            {selectedTypesMulti.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setSelectedTypesMulti([])}
                                className="text-[11px] font-semibold text-slate-600 hover:text-red-600"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="max-h-[170px] overflow-y-auto mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {(sampleTypeCatalog[selectedCategory] || []).length === 0 && (
                            <div className="text-xs text-slate-500 px-2 py-1">No types available</div>
                          )}
                          {(sampleTypeCatalog[selectedCategory] || []).map((type) => {
                            const checked = selectedTypesMulti.includes(type);
                            return (
                              <label
                                key={type}
                                className={`flex items-start gap-2 px-2 py-1.5 rounded-md border cursor-pointer text-sm transition ${checked ? 'bg-green-50 border-green-300 text-green-900' : 'bg-white border-transparent text-slate-700 hover:bg-slate-50 hover:border-slate-200'}`}
                              >
                                <input
                                  type="checkbox"
                                  className="mt-0.5"
                                  checked={checked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedTypesMulti((prev) => [...prev, type]);
                                    } else {
                                      setSelectedTypesMulti((prev) => prev.filter((value) => value !== type));
                                    }
                                  }}
                                />
                                <span className="leading-snug">{type}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <select
                        className="w-full input-brand p-3 md:col-span-5"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        disabled={!selectedCategory}
                      >
                        <option value="" disabled>Select Makhana Type</option>
                        {(sampleTypeCatalog[selectedCategory] || []).map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    )}

                    <select
                      className="w-full input-brand p-3 md:col-span-2"
                      value={selectedQty}
                      onChange={(e) => setSelectedQty(Number(e.target.value))}
                    >
                      {WEIGHT_OPTIONS.map((weight) => (
                        <option key={weight} value={weight}>{weight}g</option>
                      ))}
                    </select>

                    <div className="md:col-span-1 flex items-center justify-center text-xs font-medium text-slate-600">
                      Auto-saved
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-2">Maximum quantity is 100g per selected Makhana type.</p>
                  {form.sampleRequestType === 'multiple' && selectedTypesMulti.length > 0 && (
                    <p className="text-xs text-green-700">Selected types are saved automatically for this category.</p>
                  )}

                  {selectedSamples.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {selectedSamples.map((item, index) => (
                        <div key={`${item.category}-${item.type}-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-white border border-green-100 rounded-lg p-2">
                          <div className="md:col-span-3 text-xs font-semibold text-brand">{item.category}</div>
                          <div className="md:col-span-6 text-sm text-slate-800">{stripTrailingWeight(item.type)}</div>
                          <select
                            className="md:col-span-2 input-brand p-2"
                            value={item.quantityG}
                            onChange={(e) => updateSampleQty(index, e.target.value)}
                          >
                            {WEIGHT_OPTIONS.map((weight) => (
                              <option key={weight} value={weight}>{weight}g</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => removeSampleType(index)}
                            className="md:col-span-1 text-red-600 hover:text-red-700 text-sm font-semibold"
                          >
                            Remove
                          </button>
                          <div className="md:col-span-12 text-xs text-slate-600">
                            Rate: INR {Number(item.unitPrice || 0).toFixed(2)} / kg • Line Total: INR {Number(item.lineAmount || 0).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {form.sampleRequestType === 'package' && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-700 bg-white border border-green-100 rounded-lg p-3">
                    Package only selected. Choose your package below.
                  </p>
                  <select
                    className="w-full input-brand p-3"
                    value={form.samplePackage}
                    onChange={e => setForm({ ...form, samplePackage: e.target.value })}
                    required
                  >
                    <option value="" disabled>Select Sample Package (Required)</option>
                    <option value={String(packageBasicPrice)}>Basic Package - 1x premium pack</option>
                    <option value={String(packagePremiumPrice)}>Premium Package - 2x premium packs</option>
                  </select>
                  <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-2">
                    Payable amount: INR {payableAmount.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
                        <input className="w-full input-brand p-3 md:col-span-2 placeholder:text-xs md:placeholder:text-sm" placeholder="Expected quantity after sample (e.g., 100kg/month)" value={form.requirement} onChange={(e) => setForm({ ...form, requirement: e.target.value })} />
                        <textarea className="w-full input-brand p-3 md:col-span-2 placeholder:text-xs md:placeholder:text-sm" placeholder="Any specific specs or notes" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                        {form.sampleRequestType !== 'package' && (
                          <div className="md:col-span-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">
                            Package selector is hidden for this mode. Dynamic amount from selected types: INR {payableAmount.toFixed(2)}.
                          </div>
                        )}
                        {form.sampleRequestType !== 'package' && selectedSamples.length > 0 && (
                          <div className="md:col-span-2 text-sm font-semibold text-brand bg-green-50 border border-green-200 rounded-lg p-3">
                            Final Amount: INR {payableAmount.toFixed(2)}
                          </div>
                        )}
                        {/* Payment Method (Razorpay Only) */}
                        <div className="w-full md:col-span-2 flex flex-col gap-2 mt-2">
                          <label className="font-semibold text-brand">Payment Method</label>
                          <div className="flex items-center gap-2 text-sm text-slate-700 bg-blue-50 border border-blue-200 rounded p-3">
                            <span className="font-semibold">Razorpay</span>
                            <span className="text-slate-500">(UPI, Card, Net Banking, Wallets)</span>
                          </div>
                          <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-2 text-sm">
                            <div className="font-semibold mb-1">Secure Razorpay Checkout</div>
                            <div>After clicking proceed, payment popup opens and your sample request is submitted only after successful payment.</div>
                          </div>
                        </div>
            <div className="md:col-span-2 flex flex-wrap gap-3 items-center justify-between">
              <div className="text-sm text-slate-600 flex items-center gap-2">
                <Shield className="text-brand" size={18} /> We respect your privacy and only use this to ship your sample.
              </div>
              <button type="submit" disabled={loading} className="bg-brand-gradient text-white px-6 py-3 rounded-lg font-semibold hover:opacity-95 transition shadow-brand disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Processing...' : 'Proceed to Razorpay'}
              </button>
            </div>
            {status === "sent" && (
              <div className="md:col-span-2 text-green-700 bg-green-50 border border-green-100 rounded-lg p-3 text-sm">
                Thank you! We have your request and will confirm dispatch within 24-48 hours.
              </div>
            )}
            {error && (
              <div className="md:col-span-2 text-red-700 bg-red-50 border border-red-100 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}
          </form>
        </div>
      </section>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[9999] animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-slideUp border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Razorpay Payment</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <RazorpayPayment
              amount={payableAmount}
              onSuccess={handlePaymentSuccess}
              onFailure={handlePaymentFailure}
              userData={{
                name: form.name,
                email: form.email,
                phone: form.phone
              }}
              orderId={`SAMPLE_${Date.now()}`}
            />
          </div>
        </div>
      )}

      <section className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <p className="pill-brand inline-flex items-center gap-2"><Sparkles size={16} /> FAQ</p>
          <h3 className="text-3xl font-bold text-brand">Common questions</h3>
          <p className="text-slate-700">If you need anything beyond these points, our team can share lab reports, images, and pricing tiers.</p>
        </div>
        <div className="space-y-3">
          {faqs.map((item) => (
            <div key={item.q} className="bg-white rounded-xl p-4 shadow-brand border border-green-50">
              <div className="font-semibold text-slate-800">{item.q}</div>
              <div className="text-sm text-slate-600 mt-1">{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-14">
        <div className="bg-brand-gradient text-white rounded-2xl p-8 shadow-brand flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold">Ready to taste the crunch?</h3>
            <p className="text-white/90">Order your first GI-tagged Mithila's Makhana sample today.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={scrollToForm} className="bg-white text-brand px-6 py-3 rounded-lg font-semibold hover:opacity-95 transition">Get Sample</button>
            <button onClick={() => window.open(`https://wa.me/${(settings?.whatsappNumber || '919999999999').replace(/[^\d+]/g, '')}?text=Hi%20Dev%20Makhana%20Udyog,%20I'd%20like%20to%20discuss%20Makhana%20orders.`, "_blank")} className="btn-brand-ghost px-6 py-3 rounded-lg bg-white text-brand font-semibold">Talk to Sales</button>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <a 
        href={waUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={`fixed ${footerVisible ? 'bottom-28' : 'bottom-6'} right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center justify-center group`}
        title="Chat on WhatsApp"
      >
        <MessageCircle size={28} fill="currentColor" />
        <span className="absolute right-full mr-3 bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Chat on WhatsApp
        </span>
      </a>
    </div>
  );
}
