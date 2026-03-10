# Backend Verification Guide

## ✅ Comprehensive Backend Setup Verification

### Database Models Overview

All models are properly configured to store data in MongoDB:

#### 1. **Product Model** (`server/models/Product.js`)
- **Purpose**: Store all 7 Makhana products
- **Key Fields**:
  - `productId`: Unique identifier (e.g., "7-suta", "6-suta")
  - `name`: Product name
  - `price`, `originalPrice`, `discount`: Pricing information
  - `grade`, `popRate`, `moisture`, `moq`, `packaging`, `use`: Makhana-specific specs
  - `images`, `mainImage`: Product images
  - `active`: Boolean flag for product status
  - `stock`: Inventory tracking
  - `reviews`: Embedded review documents
- **Indexed Fields**: name, description, tags (for search), productId (unique)
- **Status**: ✅ Ready for 7 products

#### 2. **Order Model** (`server/models/Order.js`)
- **Purpose**: Store regular customer orders
- **Key Fields**:
  - `orderNumber`: Auto-generated unique order ID
  - `user`: Reference to User who placed order
  - `items`: Array of ordered products with quantity
  - `shippingAddress`: Full delivery address
  - `paymentMethod`: COD, Card, UPI, Razorpay, or Stripe
  - `paymentStatus`: Pending, Paid, Failed, Refunded
  - `paymentId`: Payment gateway reference
  - `totalPrice`, `shippingPrice`, `taxPrice`, `discountAmount`: Pricing breakdown
  - `status`: Order processing status (Pending, Processing, Shipped, Delivered, Cancelled, Returned)
  - `statusHistory`: Historical record of status changes
  - `trackingNumber`: Shipping tracking number
- **Pre-save Hook**: Automatically generates unique orderNumber
- **Status**: ✅ Ready to accept regular orders

#### 3. **BulkOrder Model** (`server/models/BulkOrder.js`)
- **Purpose**: Store bulk order inquiries
- **Key Fields**:
  - `fullName`, `company`, `phone`, `email`: Contact information
  - `addressLine1`, `addressLine2`, `landmark`, `city`, `district`, `state`, `pincode`: Full address
  - `makhanaType`: Type of makhana requested
  - `monthlyVolume`: Requested volume/quantity
  - `packaging`: Preferred packaging option
  - `postSampleQty`: Post-sample quantity preference
  - `notes`: Additional notes from customer
  - `status`: Workflow status (pending → quoted → confirmed → shipped → completed)
  - `quotedPrice`: Admin sets this after quoting
  - `adminNotes`: Admin can add internal notes
- **Timestamps**: Auto-tracked createdAt and updatedAt
- **Status**: ✅ Ready to accept bulk orders

#### 4. **FreeSample Model** (`server/models/FreeSample.js`)
- **Purpose**: Store free sample requests
- **Key Fields**:
  - `name`, `company`, `phone`, `email`: Contact information
  - `addressLine1`, `addressLine2`, `landmark`, `city`, `district`, `state`, `pincode`: Full address
  - `makhanaType`: Type of makhana sample requested
  - `requirement`: Specific requirements/preferences
  - `message`: Additional message from requester
  - `status`: Processing status (pending → processing → shipped → completed)
  - `adminNotes`: Internal notes from admin
- **Timestamps**: Auto-tracked createdAt and updatedAt
- **Status**: ✅ Ready to accept sample requests

#### 5. **Contact Model** (`server/models/Contact.js`)
- **Purpose**: Store contact form submissions
- **Key Fields**:
  - `name`, `email`, `phone`, `subject`, `message`: Standard contact info
  - `status`: Message status (new → read → responded)
  - `adminNotes`: Internal notes from admin
  - `respondedAt`: Timestamp when admin responded
- **Timestamps**: Auto-tracked createdAt and updatedAt
- **Status**: ✅ Ready to accept contact submissions

---

### API Routes & Endpoints

#### **1. Contact Routes** (`server/routes/contact.js`)

**POST `/api/contact/submit`**
```javascript
// Request body:
{
  name: string (required),
  email: string (required, email),
  phone: string (optional),
  subject: string (required),
  message: string (required)
}

// Success response (201):
{
  message: "Your message has been received. We will respond soon!",
  contact: { ...full contact document }
}
```

**GET `/api/contact/:email`**
- Retrieves all contact messages for a specific email address

---

#### **2. Bulk Orders Routes** (`server/routes/bulkOrders.js`)

**POST `/api/bulk-orders/submit`**
```javascript
// Request body:
{
  fullName: string (required),
  company: string (optional),
  phone: string (required),
  email: string (required),
  addressLine1: string (required),
  addressLine2: string (optional),
  landmark: string (optional),
  city: string (required),
  district: string (required),
  state: string (required),
  pincode: string (required),
  makhanaType: string (required),
  monthlyVolume: string (required),
  packaging: string (required),
  postSampleQty: string (required),
  notes: string (optional)
}

// Success response (201):
{
  message: "Bulk order request submitted successfully!",
  bulkOrder: { ...full bulk order document }
}
```

**GET `/api/bulk-orders/:id`**
- Retrieves details of a specific bulk order

---

#### **3. Free Samples Routes** (`server/routes/freeSamples.js`)

**POST `/api/free-samples/submit`**
```javascript
// Request body:
{
  name: string (required),
  company: string (optional),
  phone: string (required),
  email: string (required),
  addressLine1: string (required),
  addressLine2: string (optional),
  landmark: string (optional),
  city: string (required),
  district: string (required),
  state: string (required),
  pincode: string (required),
  makhanaType: string (required),
  requirement: string (optional),
  message: string (optional)
}

// Success response (201):
{
  message: "Sample request submitted successfully!",
  sample: { ...full sample request document }
}
```

**GET `/api/free-samples/:id`**
- Retrieves details of a specific sample request

---

#### **4. Orders Routes** (`server/routes/orders.js`)

**POST `/api/orders/checkout`**
- Creates a new order (available to authenticated users)
- Stores all items and shipping details

**GET `/api/orders/my-orders`**
- Retrieves all orders for authenticated user

**GET `/api/orders/:id`**
- Retrieves specific order details

---

#### **5. Admin Routes** (`server/routes/adminPanel.js`)

**Dashboard Overview**
- **GET `/api/admin/dashboard/overview`**
  - Returns: Total orders, revenue, users, reviews count
  - Also includes counts for bulk orders, samples, and contacts

**Contact Messages Management**
- **GET `/api/admin/messages`** - List all contact messages (paginated, 10 per page)
- **GET `/api/admin/messages/:id`** - Get specific message (auto-marks as read)
- **PUT `/api/admin/messages/:id`** - Update message status and notes
- **DELETE `/api/admin/messages/:id`** - Delete message

**Free Samples Management**
- **GET `/api/admin/free-samples`** - List all sample requests (paginated)
- **GET `/api/admin/free-samples/:id`** - Get specific sample request
- **PUT `/api/admin/free-samples/:id`** - Update sample status and notes
- **DELETE `/api/admin/free-samples/:id`** - Delete sample request

**Bulk Orders Management**
- **GET `/api/admin/bulk-orders`** - List all bulk orders (paginated)
- **GET `/api/admin/bulk-orders/:id`** - Get specific bulk order
- **PUT `/api/admin/bulk-orders/:id`** - Update bulk order status, quote price, and notes
- **DELETE `/api/admin/bulk-orders/:id`** - Delete bulk order

**Orders Management**
- **GET `/api/admin/orders`** - List all customer orders (paginated)
- **GET `/api/admin/orders/:id`** - Get specific order details
- **PUT `/api/admin/orders/:id`** - Update order status

**Products Management** (`server/routes/adminProducts.js`)
- **GET `/api/admin/products`** - List all products
- **POST `/api/admin/products`** - Create new product
- **PUT `/api/admin/products/:id`** - Update product
- **DELETE `/api/admin/products/:id`** - Delete product

**Newsletter Subscribers**
- **GET `/api/admin/newsletter-subscribers`** - List all subscribers

**Reviews Management**
- **GET `/api/admin/reviews`** - List all product reviews
- **PUT `/api/admin/reviews/:id`** - Update review status
- **DELETE `/api/admin/reviews/:id`** - Delete review

**Coupons Management**
- **GET `/api/admin/coupons`** - List all coupons
- **POST `/api/admin/coupons`** - Create new coupon
- **PUT `/api/admin/coupons/:id`** - Update coupon
- **DELETE `/api/admin/coupons/:id`** - Delete coupon

**Settings**
- **GET `/api/admin/settings`** - Get system settings
- **PUT `/api/admin/settings`** - Update system settings

---

### Frontend Form Submissions

All frontend forms are properly configured to submit to the correct backend endpoints:

#### **1. Contact Form** (`src/pages/Contact.jsx`)
- **Endpoint**: `POST /api/contact/submit`
- **Fields**: name, email, phone, subject, message
- **Validation**: name, email, subject, message are required
- **Success**: Displays confirmation message and clears form

#### **2. Bulk Order Form** (`src/pages/OrderBulk.jsx`)
- **Endpoint**: `POST /api/bulk-orders/submit`
- **Fields**: All address details, makhana type, volume, packaging, notes
- **Validation**: Required fields enforced in form
- **Success**: Displays confirmation message and resets form

#### **3. Free Sample Form** (`src/pages/Makhana.jsx`)
- **Endpoint**: `POST /api/free-samples/submit`
- **Fields**: Name, email, phone, address, makhana type, requirement, message
- **Validation**: Required fields enforced
- **Success**: Displays confirmation message and clears form

#### **4. Regular Order/Checkout** (`src/pages/Checkout.jsx`)
- **Endpoint**: `POST /api/orders/checkout`
- **Requires**: User authentication
- **Includes**: Cart items, shipping address, payment info
- **Payment Methods**: COD, Razorpay, Stripe

---

### Data Flow Summary

```
Frontend Form
    ↓
Axios POST request
    ↓
Backend Route Handler
    ↓
Validation
    ↓
MongoDB Model Create/Update
    ↓
Response to Frontend
    ↓
Admin Can View in Dashboard
```

---

### Admin Portal Data Retrieval

The admin panel (`src/pages/AdminDashboard.jsx`) fetches data from these endpoints:

1. **Dashboard Overview**: `/api/admin/dashboard/overview`
2. **Contact Messages**: `/api/admin/messages`
3. **Bulk Orders**: `/api/admin/bulk-orders`
4. **Free Samples**: `/api/admin/free-samples`
5. **Regular Orders**: `/api/admin/orders`
6. **Products**: `/api/admin/products`
7. **Reviews**: `/api/admin/reviews`
8. **Newsletter Subscribers**: `/api/admin/newsletter-subscribers`
9. **Coupons**: `/api/admin/coupons`
10. **Settings**: `/api/admin/settings`

All endpoints require:
- Authentication token in Authorization header
- Admin role verification
- Proper error handling and validation

---

### Database Structure (MongoDB)

**Collections Created:**
1. `products` - 7 Makhana products
2. `orders` - Customer orders
3. `bulkorders` - Bulk order inquiries
4. `freesamples` - Sample requests
5. `contacts` - Contact form submissions
6. `users` - User accounts
7. `reviews` - Product reviews
8. `coupons` - Discount coupons
9. `newsletters` - Newsletter subscriptions
10. `settings` - System settings

---

### Security Features

✅ **Protected Routes**: Admin endpoints use `protect` and `adminOnly` middleware
✅ **Input Validation**: All routes validate required fields
✅ **Data Sanitization**: Inputs are trimmed and normalized
✅ **Error Handling**: Try-catch blocks with proper error messages
✅ **Authentication**: JWT token-based user authentication
✅ **Authorization**: Role-based access control (admin only)

---

### How to Test

#### **1. Test Contact Form Submission**
```bash
curl -X POST http://localhost:5000/api/contact/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "subject": "Product Inquiry",
    "message": "I would like to know more about your makhana"
  }'
```

#### **2. Test Bulk Order Submission**
```bash
curl -X POST http://localhost:5000/api/bulk-orders/submit \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Company Name",
    "company": "ABC Traders",
    "phone": "9876543210",
    "email": "company@example.com",
    "addressLine1": "123 Business Street",
    "city": "Mumbai",
    "district": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "makhanaType": "7-suta",
    "monthlyVolume": "1000 kg",
    "packaging": "25kg nitrogen-flushed",
    "postSampleQty": "500 kg"
  }'
```

#### **3. Test Free Sample Submission**
```bash
curl -X POST http://localhost:5000/api/free-samples/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "company": "XYZ Company",
    "phone": "9876543210",
    "email": "john@example.com",
    "addressLine1": "123 Test Street",
    "city": "Delhi",
    "district": "Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "makhanaType": "7-suta",
    "requirement": "Premium quality",
    "message": "Please send a sample"
  }'
```

#### **4. View Admin Data**
```bash
# Get contact messages (requires auth token)
curl -X GET http://localhost:5000/api/admin/messages \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get bulk orders
curl -X GET http://localhost:5000/api/admin/bulk-orders \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get free samples
curl -X GET http://localhost:5000/api/admin/free-samples \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Verification Checklist

- ✅ All 7 products defined in `src/data/makhana.js`
- ✅ Product model supports all 7 makhana SKUs
- ✅ Contact form submits to `/api/contact/submit` → stored in MongoDB
- ✅ Bulk order form submits to `/api/bulk-orders/submit` → stored in MongoDB
- ✅ Free sample form submits to `/api/free-samples/submit` → stored in MongoDB
- ✅ Regular orders stored in Order model with full details
- ✅ Admin routes fetch data from MongoDB with proper pagination
- ✅ Admin can update statuses and add notes
- ✅ All routes include proper error handling
- ✅ All submissions include timestamps
- ✅ Database indexes set up for efficient queries

---

### Backend Ready Status: ✅ PRODUCTION READY

The backend is fully configured to:
1. Accept all form submissions from frontend
2. Store all data in MongoDB with proper schemas
3. Allow admin to manage all inquiries
4. Process regular orders with multiple payment options
5. Track bulk orders and free sample requests through workflow
6. Maintain audit trails with timestamps

