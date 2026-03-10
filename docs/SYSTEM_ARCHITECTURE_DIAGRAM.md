# System Architecture & Data Flow Visualization

## Complete System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React.js)                           │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │
│  │  Products Page   │  │  Contact Page    │  │  Makhana Sample  │    │
│  │ (7 Products)     │  │  (Contact Form)  │  │  Form Page       │    │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘    │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │
│  │  Bulk Order Form │  │  Checkout Page   │  │  Admin Dashboard │    │
│  │  Page            │  │  (Cart → Order)  │  │  (View/Manage)   │    │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘    │
│                                                                         │
│              All Components use Axios for HTTP requests                │
│                                                                         │
└─────────────────────────────┬──────────────────────────────────────────┘
                              │
                        HTTP POST/GET
                        CORS Enabled
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
    /api/contact      /api/free-samples      /api/bulk-orders
    /api/orders       /api/admin/...
                      /api/products


┌────────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                         │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │
│  │ Auth Routes      │  │ Contact Routes   │  │ Free Sample Routes│   │
│  │ /api/auth        │  │ /api/contact     │  │ /api/free-samples│   │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘    │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │
│  │ Bulk Orders Routes│  │ Orders Routes    │  │ Admin Routes     │    │
│  │ /api/bulk-orders │  │ /api/orders      │  │ /api/admin       │    │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘    │
│                                                                         │
│  All routes include:                                                   │
│  ✓ Input Validation    ✓ Error Handling    ✓ Auth Middleware         │
│  ✓ Data Sanitization   ✓ Rate Limiting     ✓ CORS Support            │
│                                                                         │
└─────────────────────────────┬──────────────────────────────────────────┘
                              │
                    MongoDB Native Driver
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
    validate           create/update             find/query
    sanitize          in database                 from database


┌────────────────────────────────────────────────────────────────────────┐
│                      MongoDB Collections                               │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │
│  │  contacts        │  │  freesamples     │  │  bulkorders      │    │
│  │                  │  │                  │  │                  │    │
│  │  - name          │  │  - name          │  │  - fullName      │    │
│  │  - email         │  │  - email         │  │  - company       │    │
│  │  - subject       │  │  - makhanaType   │  │  - phone         │    │
│  │  - message       │  │  - requirement   │  │  - makhanaType   │    │
│  │  - status        │  │  - status        │  │  - monthlyVolume │    │
│  │  - timestamps    │  │  - timestamps    │  │  - quotedPrice   │    │
│  │                  │  │                  │  │  - status        │    │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘    │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │
│  │  orders          │  │  products        │  │  users           │    │
│  │                  │  │                  │  │                  │    │
│  │  - orderNumber   │  │  - name          │  │  - email         │    │
│  │  - items[]       │  │  - price         │  │  - password      │    │
│  │  - shippingAddr  │  │  - productId     │  │  - profile       │    │
│  │  - payment       │  │  - grade         │  │  - orders[]      │    │
│  │  - totalPrice    │  │  - popRate       │  │  - reviews[]     │    │
│  │  - status        │  │  - moq           │  │  - createdAt     │    │
│  │  - tracking      │  │  - stock         │  │                  │    │
│  │  - timestamps    │  │  - images        │  │                  │    │
│  │                  │  │                  │  │                  │    │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘    │
│                                                                         │
│  ✓ All collections have timestamps (createdAt, updatedAt)             │
│  ✓ All collections indexed for efficient queries                      │
│  ✓ Foreign key relationships established                              │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Contact Form Submission

```
USER submits contact form
         │
         ▼
┌─────────────────────────────┐
│ Frontend (Contact.jsx)      │
├─────────────────────────────┤
│ • Validate required fields  │
│ • Sanitize input            │
│ • Prepare JSON data         │
│ • Send POST request         │
└────────────┬────────────────┘
             │
             │ axios.post('/api/contact/submit', formData)
             │
             ▼
┌─────────────────────────────┐
│ Backend Route Handler       │
├─────────────────────────────┤
│ POST /api/contact/submit    │
│                             │
│ • Receive request           │
│ • Validate fields           │
│ • Check required data       │
│ • Sanitize input            │
└────────────┬────────────────┘
             │
             │ Valid? → Create new document
             │
             ▼
┌─────────────────────────────┐
│ MongoDB Contact Model       │
├─────────────────────────────┤
│ contactSchema.create({      │
│   name,                     │
│   email,                    │
│   phone,                    │
│   subject,                  │
│   message,                  │
│   status: 'new',           │
│   createdAt: now()          │
│ })                          │
└────────────┬────────────────┘
             │
             │ Success → Send response
             │
             ▼
┌─────────────────────────────┐
│ Frontend Response Handler   │
├─────────────────────────────┤
│ • Display success message   │
│ • Clear form               │
│ • Store in DB              │
│ • Redirect to home         │
└─────────────────────────────┘


ADMIN ACTION: View Message
             │
             ▼
┌─────────────────────────────┐
│ Admin Dashboard             │
├─────────────────────────────┤
│ • Click "Contact Messages"  │
│ • Trigger GET request       │
└────────────┬────────────────┘
             │
             │ axios.get('/api/admin/messages', headers: {auth})
             │
             ▼
┌─────────────────────────────┐
│ Backend Admin Route         │
├─────────────────────────────┤
│ GET /api/admin/messages     │
│                             │
│ • Check auth token          │
│ • Verify admin role         │
│ • Query MongoDB             │
│ • Return all messages       │
│ • Include pagination        │
└────────────┬────────────────┘
             │
             │ Contact.find().sort().paginate()
             │
             ▼
┌─────────────────────────────┐
│ MongoDB Response            │
├─────────────────────────────┤
│ {                           │
│   messages: [{              │
│     _id,                    │
│     name,                   │
│     email,                  │
│     message,                │
│     status: 'new'           │
│   }],                       │
│   total,                    │
│   pages,                    │
│   currentPage               │
│ }                           │
└────────────┬────────────────┘
             │
             │ Display in table/list view
             │
             ▼
┌─────────────────────────────┐
│ Admin Dashboard UI          │
├─────────────────────────────┤
│ Displays all messages with: │
│ • Sender info               │
│ • Message preview           │
│ • Status badge              │
│ • Action buttons            │
│   - View full message       │
│   - Mark as read            │
│   - Reply                   │
│   - Delete                  │
└─────────────────────────────┘
```

---

## Data Flow: Free Sample Request

```
┌──────────────────────────────────┐
│ USER: Makhana Sample Page        │
│ (src/pages/Makhana.jsx)          │
├──────────────────────────────────┤
│ Form Fields:                     │
│ • name, company, phone, email    │
│ • addressLine1, addressLine2     │
│ • landmark, city, district       │
│ • state, pincode                 │
│ • makhanaType, requirement       │
│ • message                        │
│                                  │
│ → Submit Form                    │
└─────────────┬────────────────────┘
              │
              │ POST /api/free-samples/submit
              │
              ▼
┌──────────────────────────────────┐
│ BACKEND Route Handler            │
├──────────────────────────────────┤
│ freeSamples.js                   │
│                                  │
│ 1. Validate all required fields  │
│ 2. Trim and lowercase email      │
│ 3. Create FreeSample document    │
│ 4. Save to MongoDB               │
│ 5. Return success response       │
└─────────────┬────────────────────┘
              │
              │ Data saved
              │
              ▼
┌──────────────────────────────────┐
│ MongoDB freeSamples Collection   │
├──────────────────────────────────┤
│ {                                │
│   _id: ObjectId(),               │
│   name: string,                  │
│   company: string,               │
│   phone: string,                 │
│   email: string,                 │
│   address: { complete address }, │
│   makhanaType: string,           │
│   requirement: string,           │
│   message: string,               │
│   status: 'pending',             │
│   adminNotes: undefined,         │
│   createdAt: timestamp,          │
│   updatedAt: timestamp           │
│ }                                │
└──────────────┬───────────────────┘
               │
               │ Response to frontend
               │
               ▼
┌──────────────────────────────────┐
│ FRONTEND: Display Success        │
├──────────────────────────────────┤
│ • Show confirmation message      │
│ • Clear form fields              │
│ • Redirect or show thank you     │
└──────────────────────────────────┘


ADMIN WORKFLOW:
              │
              ▼
┌──────────────────────────────────┐
│ Admin Dashboard                  │
│ "Free Samples" Tab               │
├──────────────────────────────────┤
│                                  │
│ GET /api/admin/free-samples      │
│ → Shows all pending requests     │
│                                  │
│ Click on request → Shows:        │
│ • Sender details                 │
│ • Full address                   │
│ • Makhana type requested         │
│ • Specific requirements          │
│                                  │
│ Admin can:                       │
│ PUT /api/admin/free-samples/:id  │
│ • Update status → 'processing'   │
│ • Add admin notes                │
│ • Track shipment                 │
│ • Change to 'shipped'            │
│ • Mark as 'completed'            │
│                                  │
│ Status Flow:                     │
│ pending → processing             │
│   ↓        ↓                     │
│ shipped → completed              │
└──────────────────────────────────┘
```

---

## Data Flow: Bulk Order Request

```
┌────────────────────────────────────┐
│ USER: Order Bulk Page              │
│ (src/pages/OrderBulk.jsx)          │
├────────────────────────────────────┤
│ Form Fields:                       │
│ • fullName, company                │
│ • phone, email                     │
│ • Complete address (7 fields)      │
│ • makhanaType                      │
│ • monthlyVolume (e.g., "2000 kg")  │
│ • packaging (e.g., "25kg units")   │
│ • postSampleQty                    │
│ • notes                            │
│                                    │
│ → Submit Form                      │
└────────────┬─────────────────────┘
             │
             │ POST /api/bulk-orders/submit
             │
             ▼
┌────────────────────────────────────┐
│ BACKEND Route Handler              │
├────────────────────────────────────┤
│ bulkOrders.js                      │
│                                    │
│ 1. Validate all required fields    │
│ 2. Normalize email                 │
│ 3. Create BulkOrder document       │
│ 4. Save to MongoDB                 │
│ 5. Return success                  │
└────────────┬─────────────────────┘
             │
             │ Data saved
             │
             ▼
┌────────────────────────────────────┐
│ MongoDB bulkorders Collection      │
├────────────────────────────────────┤
│ {                                  │
│   _id: ObjectId(),                 │
│   fullName: string,                │
│   company: string,                 │
│   phone: string,                   │
│   email: string,                   │
│   address: { complete },           │
│   makhanaType: '6-suta',           │
│   monthlyVolume: '2000 kg',        │
│   packaging: '25kg nitrogen',      │
│   postSampleQty: '500 kg',         │
│   notes: string,                   │
│   status: 'pending',               │
│   quotedPrice: null,               │
│   adminNotes: null,                │
│   createdAt: timestamp,            │
│   updatedAt: timestamp             │
│ }                                  │
└────────────┬────────────────────┘
             │
             │ Response to frontend
             │
             ▼
┌────────────────────────────────────┐
│ FRONTEND: Success Response         │
├────────────────────────────────────┤
│ • Show "Request Received"          │
│ • Clear form                       │
│ • Show thank you message           │
└────────────────────────────────────┘


ADMIN WORKFLOW:
             │
             ▼
┌────────────────────────────────────┐
│ Admin Dashboard                    │
│ "Bulk Orders" Tab                  │
├────────────────────────────────────┤
│                                    │
│ GET /api/admin/bulk-orders         │
│ → List all bulk orders by status:  │
│   • pending (0 items)              │
│   • quoted (0 items)               │
│   • confirmed (0 items)            │
│   • shipped (0 items)              │
│                                    │
│ Admin clicks on order:             │
│ GET /api/admin/bulk-orders/:id     │
│ → Shows:                           │
│   • Company details                │
│   • Full address                   │
│   • Makhana type & volume          │
│   • Packaging requirements         │
│   • Sample quantity needed         │
│   • Timeline estimate              │
│                                    │
│ Admin actions:                     │
│                                    │
│ 1️⃣ Generate Quote:                 │
│    PUT /api/admin/bulk-orders/:id  │
│    {                               │
│      quotedPrice: 185000,          │
│      adminNotes: "Can deliver...",  │
│      status: 'quoted'              │
│    }                               │
│    → Email quote to customer       │
│                                    │
│ 2️⃣ Confirm Order:                  │
│    PUT /api/admin/bulk-orders/:id  │
│    { status: 'confirmed' }         │
│    → Update inventory              │
│                                    │
│ 3️⃣ Ship Order:                     │
│    PUT /api/admin/bulk-orders/:id  │
│    { status: 'shipped' }           │
│    → Add tracking number           │
│                                    │
│ 4️⃣ Complete Order:                 │
│    PUT /api/admin/bulk-orders/:id  │
│    { status: 'completed' }         │
│    → Confirm delivery              │
│                                    │
│ Status Flow:                       │
│ pending → quoted → confirmed       │
│   ↓       ↓        ↓               │
│ shipped → completed                │
│                                    │
└────────────────────────────────────┘
```

---

## Regular Order Flow (Checkout)

```
┌──────────────────────────┐
│ CUSTOMER: Shopping Cart  │
├──────────────────────────┤
│ Items:                   │
│ • 7-Suta (5kg) × 2      │
│ • 6-Suta (1kg) × 1      │
│ • Flavored (5kg) × 1    │
│                          │
│ → Click "Checkout"       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Checkout Page                │
│ (src/pages/Checkout.jsx)     │
├──────────────────────────────┤
│ 1. Login/Register            │
│ 2. Shipping Address:         │
│    • Full address            │
│ 3. Payment Method:           │
│    • COD                     │
│    • Razorpay               │
│    • Stripe                 │
│ 4. Order Summary:            │
│    • Items × Qty             │
│    • Subtotal               │
│    • Shipping              │
│    • Tax                   │
│    • Total                 │
│ 5. Apply Coupon (optional)   │
│                              │
│ → Click "Place Order"        │
└────────┬─────────────────────┘
         │
         │ POST /api/orders/checkout
         │ With: user, items, address, payment
         │
         ▼
┌──────────────────────────────┐
│ BACKEND Order Route          │
├──────────────────────────────┤
│ POST /api/orders/checkout    │
│                              │
│ 1. Authenticate user         │
│ 2. Validate items & prices   │
│ 3. Validate shipping address │
│ 4. Calculate totals          │
│ 5. Check inventory           │
│ 6. Create order in DB        │
│ 7. Process payment           │
│ 8. Update order status       │
│ 9. Update product stock      │
│ 10. Return confirmation      │
└────────┬─────────────────────┘
         │
         │ If COD:
         │  └→ Save order with status 'Pending'
         │
         │ If Razorpay:
         │  └→ Create Razorpay order
         │    └→ Frontend handles payment
         │    └→ Verify payment signature
         │
         │ If Stripe:
         │  └→ Create Payment Intent
         │    └→ Frontend handles payment
         │    └→ Webhook confirms payment
         │
         ▼
┌──────────────────────────────┐
│ MongoDB orders Collection    │
├──────────────────────────────┤
│ {                            │
│   _id: ObjectId(),           │
│   user: ObjectId('userId'),  │
│   orderNumber: 'ORD...',     │
│   items: [                   │
│     {                        │
│       product: ObjectId(),   │
│       name: '7-Suta',       │
│       price: 899,            │
│       quantity: 2,           │
│       image: URL             │
│     }                        │
│   ],                         │
│   shippingAddress: {         │
│     name, email, phone,      │
│     street, city, state,     │
│     zipCode, country         │
│   },                         │
│   paymentMethod: 'Razorpay', │
│   paymentStatus: 'Paid',     │
│   paymentId: '...',          │
│   itemsPrice: 2500,          │
│   shippingPrice: 100,        │
│   taxPrice: 50,              │
│   totalPrice: 2650,          │
│   status: 'Processing',      │
│   statusHistory: [           │
│     {                        │
│       status: 'Pending',     │
│       timestamp: now,        │
│       note: 'Order placed'   │
│     },                       │
│     {                        │
│       status: 'Processing',  │
│       timestamp: now,        │
│       note: 'Packed'         │
│     }                        │
│   ],                         │
│   trackingNumber: 'ABC123',  │
│   createdAt: timestamp,      │
│   updatedAt: timestamp       │
│ }                            │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ CUSTOMER: Order Confirmation │
├──────────────────────────────┤
│ • Show order number          │
│ • Confirmation email sent    │
│ • Items & totals             │
│ • Shipping address           │
│ • Estimated delivery         │
│ • Track order button         │
└──────────────────────────────┘


ADMIN WORKFLOW:
         │
         ▼
┌──────────────────────────────┐
│ Admin Dashboard              │
│ "Orders" Tab                 │
├──────────────────────────────┤
│ GET /api/admin/orders        │
│                              │
│ Shows all orders with:       │
│ • Order number               │
│ • Customer name              │
│ • Total amount               │
│ • Current status             │
│ • Date placed                │
│                              │
│ Admin can:                   │
│ 1. Click order to view       │
│ 2. Update status             │
│    • Processing → Shipped    │
│    • Shipped → Delivered     │
│    • Cancel if needed        │
│ 3. Add tracking number       │
│ 4. View customer address     │
│ 5. Print shipping label      │
│                              │
│ PUT /api/admin/orders/:id    │
│ {                            │
│   status: 'Shipped',         │
│   trackingNumber: 'ABC123'   │
│ }                            │
│                              │
└──────────────────────────────┘
```

---

## Database Structure & Relationships

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ _id (Primary)   │◄─────┐
│ email           │      │
│ password        │      │ references
│ profile         │      │
│ createdAt       │      │
└─────────────────┘      │
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    references       references    references
         │               │               │
         ▼               ▼               ▼
┌─────────────────┐  ┌────────────┐  ┌───────────┐
│    orders       │  │  reviews   │  │  wishlist │
├─────────────────┤  ├────────────┤  ├───────────┤
│ _id             │  │ _id        │  │ _id       │
│ user (FK)       │  │ user (FK)  │  │ user (FK) │
│ items[]         │  │ product(FK)│  │ product[] │
│ status          │  │ rating     │  │ dateAdded │
│ createdAt       │  │ comment    │  └───────────┘
└─────────────────┘  └────────────┘


Customer Submissions (No User FK):

┌─────────────────┐  ┌──────────────┐  ┌──────────────┐
│   contacts      │  │ freesamples  │  │  bulkorders  │
├─────────────────┤  ├──────────────┤  ├──────────────┤
│ _id             │  │ _id          │  │ _id          │
│ name            │  │ name         │  │ fullName     │
│ email           │  │ email        │  │ company      │
│ phone           │  │ phone        │  │ email        │
│ subject         │  │ address      │  │ address      │
│ message         │  │ makhanaType  │  │ makhanaType  │
│ status          │  │ requirement  │  │ monthlyVol   │
│ adminNotes      │  │ status       │  │ status       │
│ createdAt       │  │ adminNotes   │  │ quotedPrice  │
└─────────────────┘  │ createdAt    │  │ adminNotes   │
                     └──────────────┘  │ createdAt    │
                                       └──────────────┘
```

---

## 7 Makhana Products in System

All 7 products are stored and referenced:

```
┌──────────────────────┐
│     products         │
├──────────────────────┤
│ 1. 7-Suta            │
│    • Grade: Super... │
│    • Price: ₹899     │
│    • Stock: N units  │
│    • Images: []      │
│                      │
│ 2. 6-Suta            │
│    • Grade: Premium  │
│    • Price: ₹749     │
│    • Stock: N units  │
│    • Images: []      │
│                      │
│ 3. 5-Suta            │
│    • Grade: Standard │
│    • Price: ₹599     │
│    • Stock: N units  │
│    • Images: []      │
│                      │
│ 4. 4-Suta            │
│    • Grade: Value    │
│    • Price: ₹449     │
│    • Stock: N units  │
│    • Images: []      │
│                      │
│ 5. Raw Makhana       │
│    • Grade: Mixed    │
│    • Price: ₹349     │
│    • Stock: N units  │
│    • Images: []      │
│                      │
│ 6. Roasted Makhana   │
│    • Grade: RTE      │
│    • Price: ₹299     │
│    • Stock: N units  │
│    • Images: []      │
│                      │
│ 7. Flavored Makhana  │
│    • Grade: Seasoned │
│    • Price: ₹399     │
│    • Stock: N units  │
│    • Images: []      │
│                      │
└──────────────────────┘

Each product can be:
• Displayed on Products page
• Added to shopping cart
• Purchased as regular order
• Referenced in reviews
• Managed in admin panel
```

---

## API Request/Response Flow

```
┌─────────────────────────────────────────────────────┐
│ Frontend sends HTTP Request                         │
├─────────────────────────────────────────────────────┤
│ Method: POST                                        │
│ URL: http://localhost:5000/api/contact/submit      │
│ Headers: {                                          │
│   "Content-Type": "application/json",              │
│   "Authorization": "Bearer token" (if admin)       │
│ }                                                   │
│ Body: {                                             │
│   "name": "John",                                   │
│   "email": "john@example.com",                      │
│   "phone": "9876543210",                            │
│   "subject": "Inquiry",                             │
│   "message": "Your message"                         │
│ }                                                   │
└────────────┬────────────────────────────────────────┘
             │
             │ ← Network Transmission →
             │ (CORS validated)
             │
             ▼
┌─────────────────────────────────────────────────────┐
│ Backend Middleware (in order)                       │
├─────────────────────────────────────────────────────┤
│ 1. CORS Check          → Allow origin             │
│ 2. Rate Limit Check    → Check IP requests        │
│ 3. Express.json()      → Parse JSON body          │
│ 4. Route Matching      → Match /api/contact       │
│ 5. Request Handler     → Execute route function   │
│                                                    │
│ Route Handler:                                     │
│ • Validate fields      → Check required fields    │
│ • Sanitize input       → Clean dangerous chars    │
│ • Create document      → Build data object        │
│ • Save to MongoDB      → Insert in database       │
│ • Return response      → Send result to client    │
└────────────┬────────────────────────────────────────┘
             │
             │ ← Network Transmission →
             │ (JSON response)
             │
             ▼
┌─────────────────────────────────────────────────────┐
│ Frontend receives HTTP Response                     │
├─────────────────────────────────────────────────────┤
│ Status: 201 Created                                │
│ Headers: {                                          │
│   "Content-Type": "application/json",              │
│   "X-Powered-By": "Express"                        │
│ }                                                   │
│ Body: {                                             │
│   "message": "Successfully submitted!",            │
│   "contact": {                                     │
│     "_id": "mongo_id",                             │
│     "name": "John",                                │
│     "email": "john@example.com",                   │
│     "status": "new",                               │
│     "createdAt": "2024-01-01T10:00:00Z",          │
│     "updatedAt": "2024-01-01T10:00:00Z"           │
│   }                                                │
│ }                                                   │
└────────────┬────────────────────────────────────────┘
             │
             │ Response Handler
             │
             ▼
┌─────────────────────────────────────────────────────┐
│ Frontend JavaScript                                 │
├─────────────────────────────────────────────────────┤
│ • Check status code (201 = success)                │
│ • Extract contact data from response               │
│ • Update React state                               │
│ • Re-render component                              │
│ • Show success message to user                     │
│ • Clear form fields                                │
│ • Redirect to home (optional)                      │
└─────────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
┌─────────────────────────────────────────────┐
│ Error Occurs at Any Stage                   │
├─────────────────────────────────────────────┤
│ Examples:                                   │
│ • Missing required field                    │
│ • Invalid email format                      │
│ • Database connection error                 │
│ • Authentication token expired              │
│ • Unauthorized access (not admin)           │
│ • Server internal error                     │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│ Backend Error Handler                       │
├─────────────────────────────────────────────┤
│ try {                                       │
│   // Process request                        │
│ } catch (error) {                           │
│   // Determine error type                   │
│   // Set appropriate HTTP status code       │
│   // Send error message to client           │
│ }                                           │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│ HTTP Response to Frontend                   │
├─────────────────────────────────────────────┤
│ Status: 400, 401, 403, 404, or 500          │
│ Body: {                                     │
│   "error": "Missing required field: name"   │
│ }                                           │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│ Frontend Error Handler                      │
├─────────────────────────────────────────────┤
│ if (error.response) {                       │
│   // Backend sent error response            │
│   message = error.response.data.error       │
│ } else if (error.request) {                 │
│   // Request made but no response           │
│   message = "Network error"                 │
│ } else {                                    │
│   // Error in request setup                 │
│   message = "Error: " + error.message       │
│ }                                           │
│                                             │
│ Update UI to show error                     │
│ Display message to user                     │
│ Allow user to retry                         │
└─────────────────────────────────────────────┘
```

---

This comprehensive visualization helps understand how all components work together in your e-commerce system!

