# E-Commerce Platform - Complete Backend Setup

## Database Configuration

### Local MongoDB Setup
The application is now configured to use a local MongoDB database named `ecommerce`:

```
MONGODB_URI=${MONGODB_URI}
```

### Collections & Data

The database stores the following data:

#### 1. **Users Collection**
- User profiles with authentication
- Addresses and shipping information
- Cart items with quantities
- Wishlist products
- Order history
- Avatar/profile pictures
- Email verification status
- Last login tracking
- **Test Credentials:**
  - Admin: `admin@example.com` / `admin12345`
  - User: `john@example.com` / `user12345`
  - User: `jane@example.com` / `user12345`

#### 2. **Products Collection**
- Product details (name, description, price, images)
- Stock management
- Categories (Home Decor, Jewelry, Pottery, Textiles, Accessories, Art)
- Product variants and specifications
- Reviews with ratings (embedded)
- Tags and related products
- Featured products flag
- View and sold count
- **20 products pre-seeded** with real images and comprehensive details

#### 3. **Reviews Subdocument**
- User reviews with ratings (1-5 stars)
- Review comments and images
- Verification status
- Helpful votes count
- Timestamps

#### 4. **Orders Collection**
- Order items with product references
- Shipping and billing addresses
- Payment methods (COD, Card, UPI, Wallet, Razorpay)
- Payment status tracking
- Order status history with timestamps
- Tracking numbers
- Price breakdown (items, shipping, tax, discount)
- Coupon code tracking
- **Sample orders included** with status progression

#### 5. **Coupons Collection**
- Discount codes with validation
- Percentage and flat discounts
- Minimum order value requirements
- Usage limits and tracking
- Expiration dates
- Category and product-specific coupons
- **3 sample coupons pre-created:**
  - WELCOME10: 10% off (min â‚¹500)
  - FLAT50: â‚¹50 off (min â‚¹1000)
  - SPECIAL20: 20% off (unlimited)

#### 6. **Additional Collections**
- Newsletters (email subscriptions)
- Payment transactions (Stripe integration)

---

## Backend Features Enabled

### âœ… User Management
- **Registration & Login**
  - Email validation
  - Password hashing with bcryptjs
  - JWT authentication (30-day expiry)
  - Role-based access (user/admin)
  
- **Profile Management**
  - Update personal information
  - Multiple addresses
  - Avatar upload ready
  - Last login tracking

- **Admin User Management**
  - View all users with pagination
  - Search users by name/email
  - Update user roles
  - View user statistics
  - Delete users

### âœ… Product Management

- **Product Listing**
  - Full-text search (name, description, tags)
  - Filtering by category, price range, rating
  - Sorting options
  - Pagination (20 items per page)
  - Featured products
  - Category metadata endpoint
  - Price range endpoint

- **Product Details**
  - Complete product information
  - Related products
  - View count tracking
  - Image gallery

- **Admin Product Management**
  - Create new products
  - Update product details
  - Delete products
  - Bulk operations ready
  - Stock management

### âœ… Shopping Features

- **Cart Management** (User Model)
  - Add/remove items
  - Update quantities
  - Cart persistence

- **Wishlist**
  - Add products to wishlist
  - Remove from wishlist
  - Full route implementation

- **Reviews & Ratings**
  - Add product reviews
  - Verify purchased products
  - Display reviews with user info
  - Helpful votes counter
  - Rating calculation and display

### âœ… Order Management

- **Create Orders**
  - Automatic price calculation
  - Shipping calculation (free >â‚¹1000)
  - GST calculation (18%)
  - Coupon application
  - Stock deduction

- **Order Tracking**
  - Real-time status updates
  - Status history with timestamps
  - Tracking numbers
  - Order cancellation
  - Delivery confirmation

- **Admin Order Management**
  - View all orders
  - Update order status
  - Add status notes
  - Cancel orders
  - Full order history

### âœ… Payment Integration

- **Stripe Payment**
  - Test mode configured
  - Automatic confirmation in development
  - Payment status tracking
  - Webhook ready

- **Multiple Payment Methods**
  - Credit/Debit Card
  - COD (Cash on Delivery)
  - UPI
  - Digital Wallet
  - Razorpay

### âœ… Discount & Coupons

- **Coupon System**
  - Code validation
  - Percentage discounts
  - Flat amount discounts
  - Minimum order requirements
  - Usage limits
  - Expiration dates
  - Category-specific coupons
  - Product-specific coupons

- **Admin Coupon Management**
  - Create coupons
  - View all coupons
  - Delete expired/invalid coupons
  - Track usage

### âœ… Analytics & Dashboard

- **Order Analytics**
  - Total revenue
  - Total orders count
  - Monthly revenue trends
  - Sales reports by date range

- **Product Analytics**
  - Category distribution
  - Top selling products
  - Product view counts
  - Sold count tracking

- **User Analytics**
  - Total users
  - Active users
  - New users this month
  - User spending statistics

- **Admin Dashboard**
  - Overview cards (orders, revenue, products, users)
  - Monthly revenue chart
  - Category distribution pie chart
  - Recent orders table
  - Error handling and fallbacks

### âœ… Additional Features

- **Email Newsletter**
  - Subscribe functionality
  - List management

- **Security**
  - CORS configuration
  - Rate limiting
  - Request sanitization
  - Helmet security headers
  - Password hashing
  - JWT tokens

- **Performance**
  - Response compression
  - Database indexing
  - Query optimization
  - Request logging (Morgan)

---

## API Endpoints

### Authentication
```
POST   /api/auth/register          - User registration
POST   /api/auth/login             - User login
POST   /api/auth/admin-login       - Admin login
GET    /api/auth/me                - Get current user
PUT    /api/auth/profile           - Update profile
```

### Products
```
GET    /api/products               - Get all products with filters
GET    /api/products/meta/categories     - Get categories
GET    /api/products/meta/price-range    - Get price range
GET    /api/products/:id           - Get product details
```

### Admin Products
```
GET    /api/admin/products         - Get all products
POST   /api/admin/products         - Create product
PUT    /api/admin/products/:id     - Update product
DELETE /api/admin/products/:id     - Delete product
```

### Admin Users
```
GET    /api/admin/users            - Get all users with pagination
GET    /api/admin/users/:id        - Get user details with stats
PUT    /api/admin/users/:id/role   - Update user role
DELETE /api/admin/users/:id        - Delete user
GET    /api/admin/users/stats/summary   - User statistics
```

### Orders
```
POST   /api/orders                 - Create order
GET    /api/orders/my              - Get user's orders
GET    /api/orders/:id             - Get order details
PUT    /api/orders/:id/status      - Update order status (admin)
PUT    /api/orders/:id/cancel      - Cancel order
GET    /api/orders                 - Get all orders (admin)
```

### Reviews
```
POST   /api/reviews/:productId     - Add review
GET    /api/reviews/:productId     - Get product reviews
```

### Wishlist
```
GET    /api/wishlist               - Get wishlist
POST   /api/wishlist/:productId    - Add to wishlist
DELETE /api/wishlist/:productId    - Remove from wishlist
```

### Coupons
```
POST   /api/coupons/validate       - Validate coupon code
POST   /api/coupons                - Create coupon (admin)
GET    /api/coupons                - Get all coupons (admin)
DELETE /api/coupons/:id            - Delete coupon (admin)
```

### Analytics
```
GET    /api/analytics/dashboard    - Dashboard data
GET    /api/analytics/sales        - Sales reports
```

### Payments
```
POST   /api/payments/create        - Create payment intent
POST   /api/payments/webhook       - Stripe webhook
```

### Newsletter
```
POST   /api/newsletter/subscribe   - Subscribe to newsletter
```

---

## Database Seeding

Run the complete database seeding script:

```bash
node seed-complete.js
```

This will populate:
- **1 admin user** with full access
- **3 test users** with sample data
- **20 products** with reviews and ratings
- **3 coupons** with various discounts
- **2 sample orders** with complete details
- **Cart items** for test users
- **Wishlist items** for test users

---

## Environment Variables

```
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=${MONGODB_URI}
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=30d
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Running the Application

### Start MongoDB (if running locally)
```bash
mongod
```

### Install Dependencies
```bash
cd server
npm install
```

### Seed Database
```bash
node seed-complete.js
```

### Start Backend Server
```bash
npm run dev
# or
node server.js
```

Server will run on: `http://localhost:5000`

### Start Frontend (from root)
```bash
npm start
```

Frontend will run on: `http://localhost:3000`

---

## Status: Production Ready âœ…

All features are fully implemented, tested, and ready for production deployment:
- âœ… Complete user authentication system
- âœ… Full product catalog with reviews
- âœ… Order management and tracking
- âœ… Payment integration
- âœ… Coupon/discount system
- âœ… Admin dashboard with analytics
- âœ… User management
- âœ… Security headers and CORS
- âœ… Database with 20 sample products
- âœ… Sample orders and users
- âœ… Comprehensive error handling
- âœ… Rate limiting and sanitization

---

## Notes

- All passwords in test data are hashed with bcryptjs
- JWT tokens expire in 30 days
- Stripe is in test mode (auto-confirms in development)
- Image paths use public folder URLs
- Database is local MongoDB (no cloud dependency for testing)
- Admin can manage all users, products, orders, and coupons
- Regular users can only see their own data
