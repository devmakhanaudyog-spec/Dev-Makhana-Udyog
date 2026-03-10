import React, { useState, useEffect, useRef } from "react";
import axios from '../utils/api.js';
import { ClipboardList, CheckCircle2, ShieldCheck, MessageCircle } from "lucide-react";
import { useAuth } from '../context/AuthContext';
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
  
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await axios.post('/api/bulk-orders/submit', form);
      setStatus("sent");
      setForm({
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
            
            <select className="input-brand p-3 md:col-span-2" value={form.makhanaType} onChange={(e) => setForm({...form, makhanaType: e.target.value})} required>
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
            
            <select className="input-brand p-3 md:col-span-2" value={form.packaging} onChange={(e) => setForm({...form, packaging: e.target.value})} required>
              <option value="" disabled>Select Packaging Size</option>
              <option value="200g">200g</option>
              <option value="1kg">1 Kg</option>
              <option value="6kg">6 Kg</option>
              <option value="7kg">7 Kg</option>
              <option value="10kg">10 Kg</option>
            </select>
            
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
