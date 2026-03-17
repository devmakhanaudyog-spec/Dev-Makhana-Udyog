import React, { useRef, useState, useEffect } from "react";
import axios from '../utils/api.js';
import { CheckCircle, Leaf, Shield, Truck, Factory, Sparkles, ClipboardList, MessageCircle } from "lucide-react";
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

export default function Makhana() {
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
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { settings } = useSettings();
  const waNumber = '919142252059';
  const waMsg = encodeURIComponent('Hi! I am interested to Order makhana sample.');
  const waUrl = `https://wa.me/${waNumber}?text=${waMsg}`;
  
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
    requirement: "",
    message: "",
    samplePackage: "",
    paymentMethod: "",
  });

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

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await axios.post('/api/free-samples/submit', form);
      setStatus("sent");
      setForm({
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
        requirement: "",
        message: "",
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
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
                        <select className="w-full input-brand p-3 md:col-span-2" value={form.makhanaType} onChange={(e) => setForm({ ...form, makhanaType: e.target.value })} required>
              <option value="" disabled>Select Makhana Type</option>
              <option value="7-suta">7 Suta Premium (16mm+, 99% Pop Rate) - Export Grade</option>
              <option value="6-suta">6 Suta Grade (14-16mm, 98% Pop Rate) - Popular Choice</option>
              <option value="5-suta">5 Suta Grade (12-14mm, 97% Pop Rate) - Standard</option>
              <option value="4-suta">4 Suta Grade (10-12mm) - Budget Friendly</option>
              <option value="raw-makhana">Raw Makhana (Unprocessed Bulk)</option>
              <option value="roasted-makhana">Roasted Makhana (Lightly Roasted)</option>
              <option value="flavored-makhana">Flavored RTE (Ready-to-Eat)</option>
              <option value="multiple">Multiple Types (Specify in notes)</option>
            </select>
                        <input className="w-full input-brand p-3 md:col-span-2 placeholder:text-xs md:placeholder:text-sm" placeholder="Expected quantity after sample (e.g., 100kg/month)" value={form.requirement} onChange={(e) => setForm({ ...form, requirement: e.target.value })} />
                        <textarea className="w-full input-brand p-3 md:col-span-2 placeholder:text-xs md:placeholder:text-sm" placeholder="Any specific specs or notes" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                        {/* Sample Package Selector */}
                        <select className="w-full input-brand p-3 md:col-span-2" value={form.samplePackage} onChange={e => setForm({ ...form, samplePackage: e.target.value })} required>
                          <option value="" disabled>Select Sample Package (Required)</option>
                          <option value="650">Sample Package ‍“ â‚¹850 (includes shipping, 1x premium pack)</option>
                          <option value="1000">Sample Package ‍“ â‚¹1700 (includes shipping, 2x premium packs)</option>
                        </select>
                        {/* Payment Method Selector */}
                        <div className="w-full md:col-span-2 flex flex-col gap-2 mt-2">
                          <label className="font-semibold text-brand">Select Payment Method</label>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                              <input type="radio" name="paymentMethod" value="upi" checked={form.paymentMethod === 'upi'} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} required />
                              <span>UPI</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input type="radio" name="paymentMethod" value="razorpay" checked={form.paymentMethod === 'razorpay'} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} required />
                              <span>Razorpay</span>
                            </label>
                          </div>
                          {form.paymentMethod === 'upi' && (
                            <div className="bg-green-50 border border-green-200 rounded p-3 mt-2 text-sm">
                              <div className="font-semibold mb-1">Pay via UPI</div>
                              <div>UPI ID: <span className="font-mono">Dev Makhana Udyog@upi</span></div>
                              <div className="text-xs text-slate-500">(After submitting the form, please pay the selected amount and share the transaction ID with our team on WhatsApp.)</div>
                            </div>
                          )}
                          {form.paymentMethod === 'razorpay' && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-2 text-sm">
                              <div className="font-semibold mb-1">Pay via Razorpay</div>
                              <div>Razorpay payment link will be shared after form submission.</div>
                            </div>
                          )}
                        </div>
            <div className="md:col-span-2 flex flex-wrap gap-3 items-center justify-between">
              <div className="text-sm text-slate-600 flex items-center gap-2">
                <Shield className="text-brand" size={18} /> We respect your privacy and only use this to ship your sample.
              </div>
              <button type="submit" disabled={loading} className="bg-brand-gradient text-white px-6 py-3 rounded-lg font-semibold hover:opacity-95 transition shadow-brand disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Submitting...' : 'Submit Request'}
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
