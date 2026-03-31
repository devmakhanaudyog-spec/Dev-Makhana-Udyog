const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const morgan = require('morgan');

dotenv.config();

const app = express();
const isDev = process.env.NODE_ENV !== 'production';
const getEnv = (key) => (process.env[key] || '').trim();

const MONGODB_URI = getEnv('MONGODB_URI');
const CLIENT_URL = getEnv('CLIENT_URL') || getEnv('FRONTEND_URL');

const requiredEnv = [
  ['JWT_SECRET', getEnv('JWT_SECRET')],
  ['MONGODB_URI', MONGODB_URI],
  ['CLIENT_URL (or FRONTEND_URL)', CLIENT_URL]
];
const missingRequiredEnv = requiredEnv
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingRequiredEnv.length) {
  throw new Error(
    `Missing required environment variables: ${missingRequiredEnv.join(', ')}. Check server/.env.example for required keys.`
  );
}

// Trust proxy for Render/production deployments (MUST be before rate limiting)
if (!isDev) {
  app.set('trust proxy', 1);
}

if (!getEnv('ADMIN_EMAIL') || !getEnv('ADMIN_PASSWORD')) {
  console.warn('⚠️  WARNING: ADMIN_EMAIL or ADMIN_PASSWORD not set. Admin login will return configuration error until provided.');
}

// Security Middleware
app.use(helmet());
app.use(mongoSanitize());

// CORS Configuration (place before rate limiting so preflight gets headers)
const buildOriginVariants = (url) => {
  if (!url) return [];
  const cleanUrl = url.trim().replace(/\/$/, '');
  if (!cleanUrl) return [];
  const variants = new Set([cleanUrl]);
  try {
    const parsed = new URL(cleanUrl);
    const { protocol, hostname } = parsed;
    if (hostname.startsWith('www.')) {
      variants.add(`${protocol}//${hostname.replace(/^www\./, '')}`);
    } else {
      variants.add(`${protocol}//www.${hostname}`);
    }
  } catch (_) {
    // Ignore invalid URL format
  }
  return Array.from(variants);
};

const defaultOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];
const configuredOrigins = [
  ...buildOriginVariants(getEnv('CLIENT_URL')),
  ...buildOriginVariants(getEnv('FRONTEND_URL'))
];
const extraOrigins = (getEnv('ALLOWED_ORIGINS') || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const allowedOrigins = Array.from(new Set([...defaultOrigins, ...configuredOrigins, ...extraOrigins]));
const corsOptions = {
  origin: (origin, callback) => {
    if (isDev) {
      return callback(null, true); // allow all origins in dev to avoid local CORS blocks
    }
    if (!origin) {
      // Allow requests with no Origin (e.g., direct browser, server-to-server)
      return callback(null, true);
    }
    const normalizedOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    console.warn('❌ CORS blocked origin:', normalizedOrigin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Discourage indexing API endpoints in search engines (not a security control)
app.use('/api', (req, res, next) => {
  res.set('X-Robots-Tag', 'noindex, nofollow');
  next();
});

// Rate limiting (production only)
if (!isDev) {
  const toPositiveInt = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };

  const buildLimiter = ({ windowMs, max, message }) => rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      const retryAfterHeader = res.getHeader('Retry-After');
      const retryAfterSeconds = Number.parseInt(retryAfterHeader, 10) || Math.ceil(windowMs / 1000);
      return res.status(429).json({
        error: message,
        code: 'RATE_LIMITED',
        retryAfterSeconds
      });
    }
  });

  // Public customer API limiter (excluding auth/admin routes)
  const publicApiLimiter = buildLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: toPositiveInt(process.env.RATE_LIMIT_PUBLIC_MAX, 600),
    message: 'Too many requests from this IP, please try again later.'
  });

  // Keep auth strict for security
  const authLimiter = buildLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: toPositiveInt(process.env.RATE_LIMIT_AUTH_MAX, 30),
    message: 'Too many login/auth attempts. Please wait 15 minutes and retry.'
  });

  // Higher admin throughput to support frequent portal updates
  const adminLimiter = buildLimiter({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: toPositiveInt(process.env.RATE_LIMIT_ADMIN_MAX, 250),
    message: 'Rate limit reached, wait 15 min or retry.'
  });

  app.use('/api/auth', authLimiter);
  app.use('/api/admin', adminLimiter);
  app.use('/api', (req, res, next) => {
    if (req.originalUrl.startsWith('/api/auth') || req.originalUrl.startsWith('/api/admin')) {
      return next();
    }
    return publicApiLimiter(req, res, next);
  });

  // Stricter rate limiting for checkout and payment endpoints
  const checkoutLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 orders per minute
    message: 'Too many checkout attempts, please wait before trying again.'
  });
  const paymentLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // limit payment requests
    message: 'Too many payment requests, please wait.'
  });
  app.use('/api/orders', checkoutLimiter);
  app.use('/api/payments', paymentLimiter);
}

// Compression for performance
app.use(compression());

// Request timeout middleware (30 seconds for most requests, 60 for heavy operations)
app.use((req, res, next) => {
  req.setTimeout(30000); // 30 seconds
  
  // Longer timeout for heavy operations
  if (req.path.includes('/dashboard') || req.path.includes('/analytics')) {
    req.setTimeout(60000); // 60 seconds
  }
  
  res.setTimeout(30000);
  next();
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (isDev) {
  app.use(morgan('dev'));
}

// Serve static files from frontend public folder
const path = require('path');// Serve robots.txt for backend API
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.sendFile(path.join(__dirname, 'robots.txt'));
});// Serve static files from /public/product_image with CORS headers for images
app.use('/product_image', express.static(path.join(__dirname, '../public/product_image'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*'); // Or set to your Vercel domain for more security
  }
}));
// Serve other static files as usual
app.use(express.static(path.join(__dirname, '../public')));

// MongoDB Connection with optimizations for scalability
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 150,           // Increased pool for concurrent bursts
  minPoolSize: 20,            // Keep warm connections for steady traffic
  maxConnecting: 15,          // Allow more simultaneous connection establishment
  waitQueueTimeoutMS: 10000,  // Fail fast instead of hanging requests forever
  maxIdleTimeMS: 45000,       // Close idle connections after 45 seconds
  serverSelectionTimeoutMS: 5000, // Timeout for server selection
  socketTimeoutMS: 45000,     // Socket timeout
  retryWrites: true          // Automatic retry on write failure
})
  .then(() => console.log('✅ MongoDB Connected with optimized pool'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin/images', require('./routes/adminImageUpload'));
app.use('/api/products', require('./routes/products'));
app.use('/api/admin/products', require('./routes/adminProducts'));
app.use('/api/admin/users', require('./routes/users'));
app.use('/api/admin', require('./routes/adminPanel'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/free-samples', require('./routes/freeSamples'));
app.use('/api/bulk-orders', require('./routes/bulkOrders'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/public/settings', require('./routes/publicSettings'));

// Health check (includes DB status)
app.get('/api/health', async (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const state = states[mongoose.connection.readyState] || 'unknown';
  let dbPing = null;
  try {
    dbPing = await mongoose.connection.db.admin().ping();
  } catch (e) {
    dbPing = { ok: 0, error: e.message };
  }
  res.json({ status: 'ok', dbState: state, dbPing });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // Verify email configuration
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    const { verifyEmailConfig } = require('./utils/emailService');
    await verifyEmailConfig();
  } else {
    console.log('⚠️  Email service not configured. Password reset emails will not be sent.');
    console.log('📧 To enable emails, configure EMAIL_USER and EMAIL_PASSWORD in .env file.');
    console.log('📖 See docs/EMAIL_SETUP_GUIDE.md for setup instructions.');
  }
});

// Handle unhandled promise rejections and uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});
