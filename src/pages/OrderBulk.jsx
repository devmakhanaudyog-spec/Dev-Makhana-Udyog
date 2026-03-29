import React, { useState, useEffect, useRef } from "react";
import axios from '../utils/api.js';
import { ClipboardList, CheckCircle2, ShieldCheck, MessageCircle } from "lucide-react";
import { useAuth } from '../context/AuthContext';

const normalizeName = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

const stripTrailingWeight = (value) => {
  const text = String(value || '').trim();
  return text
    .replace(/\s*\(\s*\d+(?:\.\d+)?\s*(?:g|gm|grams|kg|kgs)\s*\)\s*$/i, '')
    .replace(/\s*[-,]?\s*\d+(?:\.\d+)?\s*(?:g|gm|grams|kg|kgs)\s*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

const isExcludedCategory = (value) => {
  const category = normalizeName(value).replace(/[-_]/g, ' ');
  return category === 'save on bundles' || category === 'save on bundle';
};

// localStorage utilities for bulk order form
const STORAGE_KEY = 'bulkOrderFormDraft';

const saveBulkOrderDraft = (formData, selectionState) => {
  try {
    const draft = {
      form: formData,
      selections: selectionState,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch (err) {
    console.error('Failed to save draft:', err);
  }
};

const loadBulkOrderDraft = () => {
  try {
    const draft = localStorage.getItem(STORAGE_KEY);
    if (!draft) return null;
    const parsed = JSON.parse(draft);
    // Only load draft if it's less than 7 days old
    if (Date.now() - parsed.timestamp > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load draft:', err);
    return null;
  }
};

const clearBulkOrderDraft = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear draft:', err);
  }
};

const FALLBACK_MAKHANA_CATALOG = {
  'Premium Grades': ['7 Suta Premium', '6 Suta Grade', '5 Suta Grade', '4 Suta Grade'],
  'Raw & Roasted': ['Raw Makhana', 'Roasted Makhana', 'Flavoured Makhana']
};

const PACKAGING_OPTIONS = ['200g', '1kg', '6kg', '7kg', '10kg'];

export default function OrderBulk() {
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
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [bulkTypeMode, setBulkTypeMode] = useState('single');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedTypesMulti, setSelectedTypesMulti] = useState([]);
  const [packagingMode, setPackagingMode] = useState('single');
  const [selectedPackaging, setSelectedPackaging] = useState('');
  const [selectedPackagingsMulti, setSelectedPackagingsMulti] = useState([]);
  const [makhanaTypeCatalog, setMakhanaTypeCatalog] = useState(FALLBACK_MAKHANA_CATALOG);
  const { user } = useAuth();
  const waNumber = '919142252059';
  const waMsg = encodeURIComponent('Hello! I want to discuss a bulk makhana order.');
  const waUrl = `https://wa.me/${waNumber}?text=${waMsg}`;
  
  const [form, setForm] = useState({
    fullName: "",
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
    monthlyVolume: "",
    packaging: "",
    postSampleQty: "",
    notes: ""
  });

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const loadMakhanaTypes = async () => {
      try {
        const response = await axios.get('/api/products?limit=2000');
        const products = Array.isArray(response.data?.products)
          ? response.data.products
          : Array.isArray(response.data)
            ? response.data
            : [];

        const catalog = {};
        const seenByCategory = {};

        products.forEach((product) => {
          const category = String(product?.category || '').trim().toLowerCase();
          const subCategoryRaw = String(product?.subCategory || '').trim();
          const subCategory = subCategoryRaw.toLowerCase();
          const name = String(product?.name || product?.title || product?.productName || '').trim();
          const cleanedName = stripTrailingWeight(name);
          const normalized = normalizeName(cleanedName);

          const isMakhana = category === 'makhana' || subCategory.includes('makhana') || normalized.includes('makhana');
          if (!isMakhana || !cleanedName) return;

          const finalCategory = subCategoryRaw || 'Makhana';
          if (isExcludedCategory(finalCategory)) return;

          if (!catalog[finalCategory]) {
            catalog[finalCategory] = [];
            seenByCategory[finalCategory] = new Set();
          }

          if (seenByCategory[finalCategory].has(normalized)) return;
          seenByCategory[finalCategory].add(normalized);
          catalog[finalCategory].push(cleanedName);
        });

        const normalizedCatalog = Object.entries(catalog).reduce((acc, [key, values]) => {
          acc[key] = values.sort((a, b) => a.localeCompare(b));
          return acc;
        }, {});

        if (isMounted && Object.keys(normalizedCatalog).length > 0) {
          setMakhanaTypeCatalog(normalizedCatalog);
        }
      } catch (loadErr) {
        // Keep fallback catalog if fetch fails.
      }
    };

    loadMakhanaTypes();

    return () => {
      isMounted = false;
    };
  }, []);
  
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (bulkTypeMode !== 'single') return;
    if (!selectedType) {
      setForm((prev) => ({ ...prev, makhanaType: '' }));
      return;
    }
    setForm((prev) => ({ ...prev, makhanaType: selectedType }));
  }, [bulkTypeMode, selectedType]);

  useEffect(() => {
    if (bulkTypeMode !== 'multiple') return;
    const joined = selectedTypesMulti.join(', ');
    setForm((prev) => ({ ...prev, makhanaType: joined }));
  }, [bulkTypeMode, selectedTypesMulti]);

  // Auto-sync packaging selection(s) to form.packaging
  useEffect(() => {
    if (packagingMode === 'single') {
      if (!selectedPackaging) {
        setForm((prev) => ({ ...prev, packaging: '' }));
        return;
      }
      setForm((prev) => ({ ...prev, packaging: selectedPackaging }));
    }
  }, [packagingMode, selectedPackaging]);

  useEffect(() => {
    if (packagingMode !== 'multiple') return;
    const joined = selectedPackagingsMulti.join(', ');
    setForm((prev) => ({ ...prev, packaging: joined }));
  }, [packagingMode, selectedPackagingsMulti]);

  // Auto-save form draft to localStorage (silently - no notification)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveBulkOrderDraft(form, {
        bulkTypeMode,
        selectedCategory,
        selectedType,
        selectedTypesMulti,
        packagingMode,
        selectedPackaging,
        selectedPackagingsMulti
      });
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(timer);
  }, [form, bulkTypeMode, selectedCategory, selectedType, selectedTypesMulti, packagingMode, selectedPackaging, selectedPackagingsMulti]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (bulkTypeMode === 'single' && !selectedType) {
      setError('Please select one Makhana type.');
      setLoading(false);
      return;
    }

    if (bulkTypeMode === 'multiple' && selectedTypesMulti.length === 0) {
      setError('Please select at least one Makhana type.');
      setLoading(false);
      return;
    }

    if (packagingMode === 'single' && !selectedPackaging) {
      setError('Please select one packaging size.');
      setLoading(false);
      return;
    }

    if (packagingMode === 'multiple' && selectedPackagingsMulti.length === 0) {
      setError('Please select at least one packaging size.');
      setLoading(false);
      return;
    }
    
    try {
      await axios.post('/api/bulk-orders/submit', form);
      setStatus("sent");
      clearBulkOrderDraft(); // Clear saved draft after successful submission
      setForm({
        fullName: user?.name || "",
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
        monthlyVolume: "",
        packaging: "",
        postSampleQty: "",
        notes: ""
      });
      setBulkTypeMode('single');
      setSelectedCategory('');
      setSelectedType('');
      setSelectedTypesMulti([]);
      setPackagingMode('single');
      setSelectedPackaging('');
      setSelectedPackagingsMulti([]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-brand-soft min-h-screen">
      <section className="bg-brand-gradient text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 space-y-4">
          <p className="pill-brand bg-white/15 text-white inline-flex items-center gap-2"><ShieldCheck size={16} /> All Order Sizes Welcome</p>
          <h1 className="text-4xl font-bold">Order Premium Makhana</h1>
          <p className="text-white/90 max-w-3xl">Whether you need small packs for retail or bulk quantities for wholesale - we serve all. Share your requirements and we'll provide the best pricing and delivery options.</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-brand border border-green-50 p-6 md:p-8 overflow-x-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <p className="pill-brand inline-flex items-center gap-2"><ClipboardList size={16} /> Get Quote</p>
              <h3 className="text-3xl font-bold text-brand mt-2">Tell us what you need</h3>
              <p className="text-slate-700">From retail packs to bulk orders - we have flexible options for everyone.</p>
            </div>
            <div className="flex flex-col md:items-end gap-2">
              <div className="text-sm text-slate-700 flex items-center gap-2"><CheckCircle2 className="text-brand" size={18} /> COA + moisture report available</div>
            </div>
          </div>

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

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <input className="w-full input-brand p-3 bg-gray-100 cursor-not-allowed" placeholder="Full Name" autoComplete="name" value={form.fullName} readOnly disabled required />
              <input className="w-full input-brand p-3" placeholder="Company / Brand" autoComplete="organization" value={form.company} onChange={(e) => setForm({...form, company: e.target.value})} />
              <input className="w-full input-brand p-3 bg-gray-100 cursor-not-allowed" placeholder="Phone" type="tel" autoComplete="tel" value={form.phone} readOnly disabled required />
              <input className="w-full input-brand p-3 bg-gray-100 cursor-not-allowed" placeholder="Email" type="email" autoComplete="email" value={form.email} readOnly disabled required />
            
              <input className="w-full input-brand p-3 md:col-span-2 placeholder:text-xs md:placeholder:text-sm" placeholder="Address Line 1 (House/Building No., Street)" autoComplete="address-line1" value={form.addressLine1} onChange={(e) => setForm({...form, addressLine1: e.target.value})} required />
              <input className="w-full input-brand p-3 md:col-span-2 placeholder:text-xs md:placeholder:text-sm" placeholder="Address Line 2 (Area, Locality)" autoComplete="address-line2" value={form.addressLine2} onChange={(e) => setForm({...form, addressLine2: e.target.value})} />
              <input className="w-full input-brand p-3 placeholder:text-xs md:placeholder:text-sm" placeholder="Landmark (Optional)" value={form.landmark} onChange={(e) => setForm({...form, landmark: e.target.value})} />
              <input className="w-full input-brand p-3 placeholder:text-xs md:placeholder:text-sm" placeholder="City" autoComplete="address-level2" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} required />
              <input className="w-full input-brand p-3 placeholder:text-xs md:placeholder:text-sm" placeholder="District" value={form.district} onChange={(e) => setForm({...form, district: e.target.value})} required />
              <input className="w-full input-brand p-3 placeholder:text-xs md:placeholder:text-sm" placeholder="State" autoComplete="address-level1" value={form.state} onChange={(e) => setForm({...form, state: e.target.value})} required />
              <input className="w-full input-brand p-3 placeholder:text-xs md:placeholder:text-sm" placeholder="PIN Code" type="text" pattern="[0-9]{6}" maxLength="6" autoComplete="postal-code" value={form.pincode} onChange={(e) => setForm({...form, pincode: e.target.value})} required />
                        {/* Draft Restore Notification */}
            
                        <div className="md:col-span-2 rounded-xl border border-green-100 p-4 bg-green-50/40">
              <label className="block font-semibold text-brand mb-3">Makhana Type Selection</label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setBulkTypeMode('single');
                    setSelectedTypesMulti([]);
                    setSelectedType('');
                    setSelectedCategory('');
                    setForm((prev) => ({ ...prev, makhanaType: '' }));
                  }}
                  className={`p-2 rounded-lg border text-sm font-semibold transition ${bulkTypeMode === 'single' ? 'bg-green-600 text-white border-green-700 shadow ring-2 ring-green-200' : 'bg-white border-green-200 text-slate-700 hover:border-green-300 hover:bg-green-50'}`}
                >
                  Single Type
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBulkTypeMode('multiple');
                    setSelectedType('');
                    setSelectedCategory('');
                    setForm((prev) => ({ ...prev, makhanaType: '' }));
                  }}
                  className={`p-2 rounded-lg border text-sm font-semibold transition ${bulkTypeMode === 'multiple' ? 'bg-green-600 text-white border-green-700 shadow ring-2 ring-green-200' : 'bg-white border-green-200 text-slate-700 hover:border-green-300 hover:bg-green-50'}`}
                >
                  Multiple Types
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {bulkTypeMode === 'single' && (
                  <>
                    <select
                      className="input-brand p-3"
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setSelectedType('');
                        setForm((prev) => ({ ...prev, makhanaType: '' }));
                      }}
                      required
                    >
                      <option value="" disabled>Select Category</option>
                      {Object.keys(makhanaTypeCatalog).map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>

                    <select
                      className="input-brand p-3"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      disabled={!selectedCategory}
                      required
                    >
                      <option value="" disabled>Select Makhana Type</option>
                      {(makhanaTypeCatalog[selectedCategory] || []).map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </>
                )}

                {bulkTypeMode === 'multiple' && (
                  <div className="md:col-span-2">
                    <div className="border border-green-200 rounded-lg bg-white p-3 max-h-[300px] overflow-y-auto">
                      {Object.keys(makhanaTypeCatalog).length === 0 ? (
                        <div className="text-xs text-slate-500 px-2 py-1">No types available</div>
                      ) : (
                        Object.entries(makhanaTypeCatalog).map(([category, types]) => (
                          <div key={category} className="mb-4 pb-4 border-b border-slate-200 last:border-b-0 last:mb-0 last:pb-0">
                            <p className="text-sm font-semibold text-slate-800 mb-2 text-green-700">{category}</p>
                            <div className="space-y-1 ml-2">
                              {types.map((type) => (
                                <label key={type} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-green-50 cursor-pointer text-sm text-slate-700">
                                  <input
                                    type="checkbox"
                                    checked={selectedTypesMulti.includes(type)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedTypesMulti((prev) => [...prev, type]);
                                      } else {
                                        setSelectedTypesMulti((prev) => prev.filter((item) => item !== type));
                                      }
                                    }}
                                  />
                                  <span>{type}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-600 mt-2">
                {bulkTypeMode === 'single'
                  ? 'Choose one Makhana type for this bulk request.'
                  : `Selected ${selectedTypesMulti.length} type(s). All selected types will be submitted together.`}
              </p>

              {/* Selected Items Preview */}
              {bulkTypeMode === 'single' && selectedType && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                  <p className="text-xs font-semibold text-slate-700 mb-2">✓ Selected Product:</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {selectedType}
                    </span>
                  </div>
                </div>
              )}
              
              {bulkTypeMode === 'multiple' && selectedTypesMulti.length > 0 && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                  <p className="text-xs font-semibold text-slate-700 mb-2">✓ Selected Products ({selectedTypesMulti.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTypesMulti.map((type) => (
                      <span key={type} className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {type}
                        <button
                          type="button"
                          onClick={() => setSelectedTypesMulti((prev) => prev.filter((t) => t !== type))}
                          className="text-green-600 hover:text-green-900 font-bold text-lg leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <select className="input-brand p-3 md:col-span-2" value={form.monthlyVolume} onChange={(e) => setForm({...form, monthlyVolume: e.target.value})} required>
              <option value="" disabled>Estimated Monthly Requirement</option>
              <option value="1-10kg">1-10 Kgs/month</option>
              <option value="10-50kg">10-50 Kgs/month</option>
              <option value="50-100kg">50-100 Kgs/month</option>
              <option value="100-500kg">100-500 Kgs/month</option>
              <option value="500-1000kg">500-1000 Kgs/month</option>
              <option value="1000-5000kg">1-5 Tons/month</option>
              <option value="5000kg+">5+ Tons/month</option>
            </select>
            
            <div className="md:col-span-2 rounded-xl border border-blue-100 p-4 bg-blue-50/40">
              <label className="block font-semibold text-brand mb-3">Packaging Size Selection</label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setPackagingMode('single');
                    setSelectedPackagingsMulti([]);
                    setSelectedPackaging('');
                    setForm((prev) => ({ ...prev, packaging: '' }));
                  }}
                  className={`p-2 rounded-lg border text-sm font-semibold transition ${packagingMode === 'single' ? 'bg-blue-600 text-white border-blue-700 shadow ring-2 ring-blue-200' : 'bg-white border-blue-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50'}`}
                >
                  Single Size
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPackagingMode('multiple');
                    setSelectedPackaging('');
                    setForm((prev) => ({ ...prev, packaging: '' }));
                  }}
                  className={`p-2 rounded-lg border text-sm font-semibold transition ${packagingMode === 'multiple' ? 'bg-blue-600 text-white border-blue-700 shadow ring-2 ring-blue-200' : 'bg-white border-blue-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50'}`}
                >
                  Multiple Sizes
                </button>
              </div>

              {packagingMode === 'single' ? (
                <select
                  className="input-brand p-3 w-full"
                  value={selectedPackaging}
                  onChange={(e) => setSelectedPackaging(e.target.value)}
                  required
                >
                  <option value="" disabled>Select Packaging Size</option>
                  {PACKAGING_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <div className="border border-blue-200 rounded-lg bg-white p-2 max-h-[180px] overflow-y-auto">
                  {PACKAGING_OPTIONS.length === 0 && (
                    <div className="text-xs text-slate-500 px-2 py-1">No options available</div>
                  )}
                  {PACKAGING_OPTIONS.map((option) => (
                    <label key={option} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-blue-50 cursor-pointer text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedPackagingsMulti.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPackagingsMulti((prev) => [...prev, option]);
                          } else {
                            setSelectedPackagingsMulti((prev) => prev.filter((item) => item !== option));
                          }
                        }}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              <p className="text-xs text-slate-600 mt-2">
                {packagingMode === 'single'
                  ? 'Choose one packaging size for this bulk request.'
                  : `Selected ${selectedPackagingsMulti.length} size(s). All selected sizes will be submitted together.`}
              </p>

              {/* Selected Packaging Preview */}
              {packagingMode === 'single' && selectedPackaging && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-slate-700 mb-2">✓ Selected Size:</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {selectedPackaging}
                    </span>
                  </div>
                </div>
              )}

              {packagingMode === 'multiple' && selectedPackagingsMulti.length > 0 && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-slate-700 mb-2">✓ Selected Sizes ({selectedPackagingsMulti.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPackagingsMulti.map((size) => (
                      <span key={size} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {size}
                        <button
                          type="button"
                          onClick={() => setSelectedPackagingsMulti((prev) => prev.filter((s) => s !== size))}
                          className="text-blue-600 hover:text-blue-900 font-bold text-lg leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <input
              className="input-brand p-3 md:col-span-2"
              type="text"
              placeholder="Immediate Order Quantity (e.g. 100 kg)"
              value={form.postSampleQty}
              onChange={(e) => setForm({ ...form, postSampleQty: e.target.value })}
              required
            />
            <textarea className="input-brand p-3 md:col-span-2 placeholder:text-xs md:placeholder:text-sm" rows={3} placeholder="Delivery location, timeline, packaging preference, or any special requirements" value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})}></textarea>
            <div className="md:col-span-2 flex flex-wrap items-center gap-3 justify-between">
              <div className="text-sm text-slate-600">Reply within 24 hours with pricing and dispatch plan.</div>
              <button type="submit" disabled={loading} className="bg-brand-gradient text-white px-6 py-3 rounded-lg font-semibold hover:opacity-95 transition shadow-brand disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
            {status === "sent" && (
              <div className="md:col-span-2 text-green-700 bg-green-50 border border-green-100 rounded-lg p-3 text-sm">
                Thank you! We have received your bulk order request and will contact you shortly with pricing and delivery details.
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
    </div>
  );
}
