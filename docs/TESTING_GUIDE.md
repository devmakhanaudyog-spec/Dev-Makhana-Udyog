# Complete Testing & Verification Guide

## 1. User Registration & Database Storage

### Test Signup Creates Database Record

#### Frontend Steps:
1. Go to `http://localhost:3000/login`
2. Click "Create Account"
3. Fill in:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - Phone: `9876543210`
4. Click "Sign Up"

#### Backend Verification:
```bash
# Connect to MongoDB
mongo localhost:27017/ecommerce

# Query user collection
db.users.findOne({ email: "test@example.com" })

# Expected output:
{
  "_id": ObjectId("..."),
  "name": "Test User",
  "email": "test@example.com",
  "password": "hashed_password_with_bcrypt",
  "phone": "9876543210",
  "role": "user",
  "address": [],
  "wishlist": [],
  "cart": [],
  "orders": [],
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("..."),
  "__v": 0
}
```

✅ **Expected Result:** User document exists in MongoDB

---

## 2. Login Verification

### Test Login Retrieves from Database

#### Frontend Steps:
1. Go to `http://localhost:3000/login`
2. Enter:
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Login"

#### Backend Verification:
```bash
# Check server logs for login attempt
# Should see: "User logged in successfully" or similar

# Verify token is generated
# Token should be in localStorage:
localStorage.getItem('token')
# Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Verify user data loaded:
localStorage.getItem('authUser')
# Returns: {"_id":"...","name":"Test User","email":"test@example.com","role":"user",...}
```

### API Call Verification
```javascript
// In browser console:
fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(data => console.log('Current user:', data))

// Expected output:
{
  "_id": "...",
  "name": "Test User",
  "email": "test@example.com",
  "phone": "9876543210",
  "role": "user",
  "address": [],
  "createdAt": "...",
  "updatedAt": "..."
}
```

✅ **Expected Result:** Token is valid and user data is retrieved

---

## 3. Add to Cart & Cart Normalization

### Test Cart Operations

#### Frontend Steps:
1. Go to `http://localhost:3000/products`
2. Click "Add to Cart" on any product
3. Update quantity (if applicable)
4. View cart

#### Browser Console Verification:
```javascript
// Check localStorage for cart
const cart = JSON.parse(localStorage.getItem('cart') || '[]');
console.log('Cart:', cart);

// Expected cart structure:
[
  {
    "_id": "product_id_or_sku",
    "name": "Product Name",
    "price": 100,
    "qty": 2,
    "mainImage": "image_url",
    // ... other product fields
  }
]

// Verify all items have _id field (normalized)
cart.forEach(item => {
  if (!item._id) console.error('MISSING _id in cart item:', item);
  else console.log('✅ Item has _id:', item._id);
});
```

✅ **Expected Result:** All cart items have `_id` field for proper order creation

---

## 4. Checkout Authentication Check

### Test Unauthorized User Redirect

#### Scenario 1: Logged Out User
1. Clear localStorage: `localStorage.clear()`
2. Navigate directly to `http://localhost:3000/checkout`
3. **Expected:** Redirected to `/login?next=/checkout`
4. Toast message: "Please login to checkout"

#### Scenario 2: Logged In User
1. Log in with test account
2. Go to `/checkout`
3. **Expected:** Checkout form displays
4. Can proceed with order

#### API Verification:
```javascript
// Without token (should fail):
fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: [{product: '...', qty: 1}],
    shippingAddress: {...},
    paymentMethod: 'COD'
  })
})
// Returns 401 Unauthorized

// With token (should work):
fetch('/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({
    items: [{product: '...', qty: 1}],
    shippingAddress: {...},
    paymentMethod: 'COD'
  })
})
// Returns 201 Created with order
```

✅ **Expected Result:** Unauthenticated users cannot place orders

---

## 5. Complete Checkout Flow

### Test COD Payment

#### Frontend Steps:
1. Log in with test account
2. Add item to cart
3. Go to checkout
4. Fill shipping address:
   - Name: Test User
   - Email: test@example.com
   - Phone: 9876543210
   - Street: 123 Main St
   - City: Mumbai
   - State: Maharashtra
   - Zip Code: 400001
5. Select "Cash on Delivery" payment
6. Click "Place Order"

#### Database Verification:
```bash
# Check MongoDB for new order
db.orders.findOne({ user: ObjectId("user_id") })

# Expected output:
{
  "_id": ObjectId("..."),
  "orderNumber": "ORD1234567890...",
  "user": ObjectId("user_id"),
  "items": [
    {
      "product": ObjectId("product_id"),
      "name": "Product Name",
      "price": 100,
      "quantity": 1,
      "image": "image_url"
    }
  ],
  "shippingAddress": {
    "name": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001"
  },
  "paymentMethod": "COD",
  "paymentStatus": "Pending",
  "itemsPrice": 100,
  "shippingPrice": 50,
  "taxPrice": 27,
  "totalPrice": 177,
  "status": "Pending",
  "statusHistory": [
    {
      "status": "Pending",
      "timestamp": ISODate("...")
    }
  ],
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

#### Frontend Verification:
1. Should see "Order placed successfully!" toast
2. Redirected to `/order-success` page
3. Order details displayed

✅ **Expected Result:** Order created in database and user sees confirmation

---

## 6. Order Tracking

### Test Order Tracking API

```javascript
// Get order number from successful checkout
const orderNumber = "ORD1234567890...";

// Without authentication:
fetch(`/api/orders/track?orderNumber=${orderNumber}&email=test@example.com`)
.then(r => r.json())
.then(data => console.log('Order status:', data))

// Expected response:
{
  "orderNumber": "ORD...",
  "status": "Pending",
  "paymentStatus": "Pending",
  "items": [
    {
      "name": "Product Name",
      "quantity": 1,
      "price": 100
    }
  ],
  "statusHistory": [...]
}
```

✅ **Expected Result:** Order can be tracked with email verification

---

## 7. Database Indexes Verification

### Verify Indexes Are Created

```bash
# Connect to MongoDB
mongo localhost:27017/ecommerce

# Check User indexes
db.users.getIndexes()
# Should show:
# - _id_
# - email_1
# - createdAt_-1
# - role_1
# - email_1_role_1

# Check Order indexes
db.orders.getIndexes()
# Should show:
# - _id_
# - user_1_createdAt_-1
# - status_1_createdAt_-1
# - paymentStatus_1
# - orderNumber_1

# Check Product indexes
db.products.getIndexes()
# Should show:
# - _id_
# - name_text_description_text_tags_text
# - category_1_price_1
# - productId_1
# - featured_1_active_1
# - price_1
# - stock_1
```

✅ **Expected Result:** All recommended indexes are present

---

## 8. Performance Testing (1000+ Users)

### Load Test Script

```javascript
// save as load-test.js
const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testConcurrentCheckouts(numUsers = 100) {
  const promises = [];
  const startTime = Date.now();

  for (let i = 0; i < numUsers; i++) {
    promises.push(
      (async () => {
        try {
          const loginRes = await axios.post(`${API_BASE}/api/auth/login`, {
            email: `user${i}@test.com`,
            password: 'password123'
          });

          const token = loginRes.data.token;

          const orderRes = await axios.post(
            `${API_BASE}/api/orders`,
            {
              items: [{
                product: '65a1b2c3d4e5f6g7h8i9j0k1',
                qty: 1
              }],
              shippingAddress: {
                name: `User ${i}`,
                email: `user${i}@test.com`,
                phone: `98765432${String(i).padStart(2, '0')}`,
                street: '123 Main St',
                city: 'Mumbai',
                state: 'Maharashtra',
                zipCode: '400001'
              },
              paymentMethod: 'COD',
              paymentStatus: 'Pending'
            },
            { headers: { 'Authorization': `Bearer ${token}` } }
          );

          return { success: true, time: Date.now() - startTime };
        } catch (error) {
          return { success: false, error: error.message };
        }
      })()
    );
  }

  const results = await Promise.all(promises);
  const successful = results.filter(r => r.success).length;
  const totalTime = Date.now() - startTime;

  console.log(`
    Concurrent Users: ${numUsers}
    Successful Orders: ${successful}/${numUsers}
    Success Rate: ${(successful/numUsers*100).toFixed(2)}%
    Total Time: ${totalTime}ms
    Avg Time: ${(totalTime/numUsers).toFixed(2)}ms
  `);

  return { successful, totalTime, successRate: successful/numUsers };
}

// Run test
testConcurrentCheckouts(100).then(console.log);
```

#### Run Load Test:
```bash
node load-test.js

# Expected output for 100 concurrent orders:
# Success Rate: > 95%
# Avg Time: < 500ms
# No 429 (rate limit) errors for first 10 orders per user per minute
```

✅ **Expected Result:** System handles 100+ concurrent users smoothly

---

## 9. Rate Limiting Verification

### Test Rate Limits

```bash
# Test global rate limit (should fail after 100 requests in 15 min)
for i in {1..101}; do
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5000/api/products
done

# Last requests should return 429 (Too Many Requests)

# Test checkout rate limit (10 orders per minute)
for i in {1..11}; do
  curl -X POST http://localhost:5000/api/orders \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{...}'
done

# 11th request should return 429
```

✅ **Expected Result:** Rate limits are enforced

---

## 10. Complete End-to-End Verification Checklist

- [ ] **Signup creates database record**
  - User exists in MongoDB after signup
  - Password is hashed with bcrypt
  - All fields (name, email, phone) saved correctly

- [ ] **Login works from database**
  - User can log in with correct email/password
  - User cannot log in with wrong password
  - JWT token generated and stored
  - lastLogin timestamp updated

- [ ] **Cart normalization working**
  - All cart items have consistent `_id` field
  - Add/update/remove cart operations preserve `_id`
  - Cart persists in localStorage

- [ ] **Checkout authentication check**
  - Unauthenticated users redirected to login
  - Authenticated users can access checkout
  - Proper error messages shown

- [ ] **Order creation working**
  - Order created in database
  - Correct calculation of itemsPrice, shippingPrice, taxPrice, totalPrice
  - Order associated with correct user
  - Cart cleared after successful order

- [ ] **Order tracking working**
  - Orders can be tracked with orderNumber
  - Email/phone verification works
  - Status history displayed correctly

- [ ] **Database indexes working**
  - All recommended indexes created
  - Queries use indexes (check MongoDB explain plan)
  - Query response times < 300ms

- [ ] **Rate limiting working**
  - Global rate limit enforced (100 req/15 min)
  - Checkout rate limit enforced (10 req/min)
  - Payment rate limit enforced (20 req/min)
  - Proper 429 responses with error message

- [ ] **Performance optimized for 1000+ users**
  - Connection pooling configured
  - Lean queries reducing memory
  - All models have proper indexes
  - Response times consistent under load

- [ ] **Security measures in place**
  - Password hashing with bcrypt
  - JWT token validation on protected routes
  - CORS properly configured
  - Helmet headers set
  - Rate limiting prevents abuse

---

## Troubleshooting

### Issue: "Cart item missing _id"
**Solution:** Clear localStorage and re-add items
```javascript
localStorage.removeItem('cart');
location.reload();
```

### Issue: "401 Unauthorized on checkout"
**Solution:** Log out and log back in
```javascript
localStorage.removeItem('token');
localStorage.removeItem('authUser');
location.href = '/login';
```

### Issue: "Order creation fails with 400"
**Solution:** Check cart items have required fields
```javascript
console.log(JSON.parse(localStorage.getItem('cart')));
// Should have: _id, name, price, qty, images
```

### Issue: "Database connection timeout"
**Solution:** Check MongoDB is running
```bash
# For Windows
# Start MongoDB service or
mongod --dbpath "C:\Program Files\MongoDB\Server\5.0\data"
```

### Issue: "Rate limit exceeded (429)"
**Solution:** Wait for rate limit window to reset
```javascript
// Check rate limit headers
fetch('http://localhost:5000/api/products')
  .then(r => {
    console.log('X-RateLimit-Remaining:', r.headers.get('X-RateLimit-Remaining'));
    console.log('X-RateLimit-Reset:', r.headers.get('X-RateLimit-Reset'));
    return r.json();
  });
```

---

## Success Metrics

Your ecommerce platform is fully functional when:

✅ Users can sign up and data is saved to database
✅ Users can log in using database credentials  
✅ Cart items maintain consistent IDs across all operations
✅ Checkout requires authentication
✅ Orders are created and saved to database
✅ Orders can be tracked and verified
✅ System handles 1000+ concurrent users smoothly
✅ Rate limits protect against abuse
✅ All database queries use indexes for performance
✅ Response times are consistent and fast (< 500ms)

---

## Next Steps

1. Run through all verification steps in order
2. Note any failures or issues
3. Use troubleshooting section to fix issues
4. Once all tests pass, system is ready for production
5. Set up monitoring and logging
6. Configure backups and disaster recovery
7. Plan for scaling beyond 1000 users

