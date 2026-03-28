import React, { useEffect, useState } from 'react';
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  const whatsappNumber = '+919142252059';
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^\d+]/g, '')}`;

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) {
      setIsAppInstalled(true);
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPromptEvent(event);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setInstallPromptEvent(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!installPromptEvent) {
      alert('Install option is not available right now. Open this site in Chrome mobile and browse for a few seconds, then try again.');
      return;
    }

    installPromptEvent.prompt();
    const choiceResult = await installPromptEvent.userChoice;
    if (choiceResult?.outcome === 'accepted') {
      setIsAppInstalled(true);
    }
    setInstallPromptEvent(null);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const apiBase = process.env.REACT_APP_API_URL || "";
    fetch(`${apiBase}/api/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        setMessage(`Error: ${data.error}`);
      } else {
        setMessage("✅ Subscribed successfully!");
        setEmail("");
      }
      setLoading(false);
    })
    .catch(err => {
      setMessage("Error subscribing. Please try again.");
      setLoading(false);
    });
  };

  return (
    <footer className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 text-slate-100">
      <div className="max-w-[1500px] mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <img
            src="/devmakhanalogo.png"
            alt="Dev Makhana Udyog logo"
            className="h-12 w-12 rounded-full object-cover border border-white/20 bg-white"
            loading="lazy"
          />
          <div>
            <p className="text-white text-lg font-bold leading-tight">Dev Makhana Udyog</p>
            <p className="text-slate-300 text-sm">Premium GI-tagged Mithila Makhana</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Company</h3>
            <ul>
              <li className="mb-2"><a href="/about" className="text-slate-300 hover:text-green-400 transition-colors">About Us</a></li>
              <li className="mb-2"><a href="/careers" className="text-slate-300 hover:text-green-400 transition-colors">Careers</a></li>
              <li className="mb-2"><a href="/press" className="text-slate-300 hover:text-green-400 transition-colors">Press</a></li>
              <li className="mb-2"><a href="/blog" className="text-slate-300 hover:text-green-400 transition-colors">Blog</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Support</h3>
            <ul>
              <li className="mb-2"><a href="/contact" className="text-slate-300 hover:text-green-400 transition-colors">Contact Us</a></li>
              <li className="mb-2"><a href="/faq" className="text-slate-300 hover:text-green-400 transition-colors">FAQ</a></li>
              <li className="mb-2"><a href="/help-center" className="text-slate-300 hover:text-green-400 transition-colors">Help Center</a></li>

            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Legal</h3>
            <ul>
              <li className="mb-2"><a href="/privacy-policy" className="text-slate-300 hover:text-green-400 transition-colors">Privacy Policy</a></li>
              <li className="mb-2"><a href="/terms-of-service" className="text-slate-300 hover:text-green-400 transition-colors">Terms of Service</a></li>
              <li className="mb-2"><a href="/cookie-policy" className="text-slate-300 hover:text-green-400 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
          <div>
             <h3 className="text-lg font-bold mb-4 text-white">Subscribe to our Newsletter</h3>
             <p className="mb-4 text-slate-300">Get the latest news, articles, and resources, sent to your inbox weekly.</p>
             <form className="flex flex-col sm:flex-row gap-2" onSubmit={handleSubscribe}>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" 
                  required
                  disabled={loading}
                  className="flex-1 px-3 py-2 rounded-md text-white border border-slate-600 bg-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed" 
                  style={{ color: 'white', '::placeholder': { color: '#cbd5e1' } }}
                />
                <button 
                  type="submit" 
                  disabled={loading}
                  className="text-white px-4 py-2 rounded-md bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition shadow-lg disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {loading ? "..." : "Subscribe"}
                </button>
             </form>
             {message && (
               <p className={`text-xs mt-2 ${message.includes("Error") ? "text-red-300" : "text-green-300"}`}>
                 {message}
               </p>
             )}
          </div>
        </div>
        <div className="border-t border-slate-700 pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="text-center md:text-left space-y-1">
            <p className="text-sm text-slate-400">
              &copy; Dev Makhana Udyog. All Rights Reserved.
            </p>
            <p className="text-xs text-slate-500">Made with love by the Dev Makhana Udyog team.</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="text-slate-400 hover:text-green-400 transition-colors"><FaFacebook size={24} /></a>
              <a href="https://www.instagram.com/devmakhanaudyog/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-green-400 transition-colors"><FaInstagram size={24} /></a>
              <a href="https://twitter.com" className="text-slate-400 hover:text-green-400 transition-colors"><FaTwitter size={24} /></a>
              <a href="https://in.linkedin.com/in/makhaantra%C3%A3-foods-96a241397" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-green-400 transition-colors"><FaLinkedin size={24} /></a>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="text-slate-400 hover:text-green-400 transition-colors"><FaWhatsapp size={24} /></a>
            </div>
            <button
              className="ml-4 flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 text-white font-bold shadow-lg hover:scale-105 hover:from-emerald-600 hover:to-emerald-800 transition-all duration-200 text-base border-2 border-white/10 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ minWidth: 120, letterSpacing: '0.02em' }}
              onClick={handleInstallApp}
              disabled={isAppInstalled}
              title={isAppInstalled ? 'Already installed' : 'Install Dev Makhana Udyog app'}
            >
              {isAppInstalled ? 'App Installed' : 'Install App'}
            </button>
            <button
              className="ml-4 flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white font-bold shadow-lg hover:scale-105 hover:from-green-500 hover:to-green-700 transition-all duration-200 text-base border-2 border-white/10"
              style={{ minWidth: 120, letterSpacing: '0.02em' }}
              onClick={() => {
                const shareUrl = 'https://www.devmakhana.com/';
                const shareData = { url: shareUrl };
                if (navigator.share) {
                  navigator.share(shareData).catch(() => {});
                } else if (navigator.clipboard) {
                  navigator.clipboard.writeText(shareUrl).then(() => {
                    alert('Website link copied to clipboard!');
                  });
                } else {
                  window.prompt('Copy this link:', shareUrl);
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25V6a3 3 0 00-6 0v2.25m6 0A2.25 2.25 0 0117.25 10.5h.75A2.25 2.25 0 0120.25 12.75v4.5A2.25 2.25 0 0118 19.5h-12A2.25 2.25 0 013.75 17.25v-4.5A2.25 2.25 0 016 10.5h.75A2.25 2.25 0 019 8.25m6 0h-6" />
              </svg>
              Share Website
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
