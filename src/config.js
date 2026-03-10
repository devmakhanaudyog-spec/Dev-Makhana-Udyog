// API Configuration (environment-driven)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const STRIPE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '';


export { API_BASE_URL, STRIPE_KEY };
