// API Configuration (environment-driven)
const isProd = process.env.NODE_ENV === 'production';
const PROD_BACKEND_URL = 'https://dev-makhana-youdog.onrender.com';
const LEGACY_UNRESOLVABLE_API_URL = 'https://api.devmakhanaudyog.com';

const normalizeUrl = (url) => (url || '').trim().replace(/\/$/, '');
const configuredApiUrl = normalizeUrl(process.env.REACT_APP_API_URL);

// If an old DNS entry is still configured, rewrite to the known live backend.
const API_BASE_URL = configuredApiUrl === LEGACY_UNRESOLVABLE_API_URL
	? PROD_BACKEND_URL
	: (configuredApiUrl || (isProd ? PROD_BACKEND_URL : 'http://localhost:5000'));

const STRIPE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '';


export { API_BASE_URL, STRIPE_KEY };
