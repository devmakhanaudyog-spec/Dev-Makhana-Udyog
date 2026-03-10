import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from '../context/AuthContext';

export default function Contact() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = useState({ state: null, message: "" });

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Prefill from profile when logged in
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  async function submit(e) {
    e.preventDefault();
    setStatus({ state: "loading", message: "" });
    try {
      const { data } = await axios.post("/api/contact/submit", form);
      setStatus({ state: "sent", message: data?.message || "Sent successfully!" });
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (e) {
      const errorMessage = e?.response?.data?.error || "Error sending message";
      setStatus({ state: "error", message: errorMessage });
    }
  }

  return (
    <main className="min-h-screen bg-brand-soft flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left content */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-gray-800">Get in Touch</h1>
          <p className="text-gray-600">
            We’d love to hear from you! Whether you have a question about our products, need support, or just want to share feedback, our team is here to help.
          </p>
          <div className="space-y-4 text-gray-700">
            <div>
              <strong>Email:</strong> support@makhaantraafoods.com
            </div>
            <div>
              <strong>Phone:</strong> +91 9142252059
            </div>
            <div>
              <strong>Address:</strong> Madhubani,Bihar, India
            </div>
          </div>
        </div>

        {/* Form box */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-semibold mb-4 text-gray-800 text-center">Contact Us</h2>
          <p className="text-gray-600 mb-6 text-center">
            Fill out the form below and we'll get back to you as soon as possible.
          </p>
          <form onSubmit={submit} className="space-y-4">
            <input
              className="w-full px-4 py-2 input-brand"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required={!user}
            />
            <input
              className="w-full px-4 py-2 input-brand"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required={!user}
            />
            <input
              className="w-full px-4 py-2 input-brand"
              placeholder="Phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required={!user}
            />
            <input
              className="w-full px-4 py-2 input-brand"
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              required
            />
            <textarea
              className="w-full px-4 py-2 input-brand"
              placeholder="Message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={5}
              required
            />
            <button
              type="submit"
              className="w-full bg-brand-gradient text-white py-2 rounded-lg hover:opacity-95 transition font-medium shadow-brand disabled:opacity-70"
              disabled={status.state === "loading"}
            >
              Send Message
            </button>
            {status.state === "sent" && <div className="text-green-600 text-center mt-2">{status.message || "Sent successfully!"}</div>}
            {status.state === "error" && <div className="text-red-600 text-center mt-2">{status.message || "Error sending message"}</div>}
            {status.state === "loading" && <div className="text-gray-600 text-center mt-2">Sending...</div>}
          </form>
        </div>
      </div>
    </main>
  );
}
