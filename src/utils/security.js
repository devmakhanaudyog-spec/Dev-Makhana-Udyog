// Input validation utilities
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePhone = (phone) => {
  const regex = /^[0-9]{10,12}$/;
  return regex.test(phone.replace(/[^0-9]/g, ''));
};

export const validatePassword = (password) => {
  // At least 6 characters, 1 uppercase, 1 number
  const regex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
  return regex.test(password);
};

export const validatePAN = (pan) => {
  const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return regex.test(pan);
};

// XSS Prevention
export const sanitizeHTML = (html) => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

export const escapeXSS = (string) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return string.replace(/[&<>"']/g, (m) => map[m]);
};

// CSRF token management
export const getCSRFToken = () => {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
};

// SQL Injection prevention (parameterized queries are handled on backend)
export const validateInput = (input, type = 'text') => {
  const patterns = {
    text: /^[a-zA-Z0-9\s\-_.,!?()]*$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    number: /^[0-9]+$/,
    phone: /^[0-9\-+()]*$/,
    url: /^https?:\/\/.+/
  };

  return patterns[type]?.test(input) ?? true;
};

// Rate limiting utility
export const createRateLimiter = (maxRequests = 10, windowMs = 60000) => {
  const requests = [];
  
  return () => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Remove old requests
    while (requests.length > 0 && requests[0] < windowStart) {
      requests.shift();
    }
    
    if (requests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    requests.push(now);
    return true; // Request allowed
  };
};

// Content Security Policy helper
export const getCSPHeaders = () => {
  return {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' *.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  };
};
