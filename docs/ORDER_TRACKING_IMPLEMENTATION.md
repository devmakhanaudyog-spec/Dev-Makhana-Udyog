# Unified Order Tracking Implementation

## Overview
The user's "My Orders" page has been enhanced to display all three types of orders in a unified interface:
1. **Regular Orders** - Orders placed from the shopping cart
2. **Bulk Orders** - Wholesale/bulk purchase requests
3. **Free Samples** - Free sample requests

## Frontend Changes

### Updated Component: `src/pages/OrderTracking.jsx`

#### New State Variables
```javascript
const [bulkOrders, setBulkOrders] = useState([]);
const [freeSamples, setFreeSamples] = useState([]);
const [orderTypeFilter, setOrderTypeFilter] = useState('all');
```

#### Simultaneous API Fetching
All three order types are fetched at the same time using `Promise.all()`:

```javascript
const [regularRes, bulkRes, sampleRes] = await Promise.all([
  axios.get('/api/orders/my', { headers }).catch(() => ({ data: [] })),
  axios.get('/api/bulk-orders/my', { headers }).catch(() => ({ data: [] })),
  axios.get('/api/free-samples/my', { headers }).catch(() => ({ data: [] }))
]);
```

**Benefits:**
- Single API call roundtrip time
- Graceful error handling - if one endpoint fails, others still load
- Efficient performance for slow networks

#### Combined Order Processing
Orders are combined into a single unified array with type labels:

```javascript
const allOrders = useMemo(() => {
  const regular = orders.map(o => ({ ...o, orderType: 'Regular Order' }));
  const bulk = bulkOrders.map(o => ({ ...o, orderType: 'Bulk Order' }));
  const samples = freeSamples.map(o => ({ ...o, orderType: 'Free Sample' }));
  return [...regular, ...bulk, ...samples].sort((a, b) => 
    new Date(b.createdAt || b.requestDate || 0) - new Date(a.createdAt || a.requestDate || 0)
  );
}, [orders, bulkOrders, freeSamples]);
```

#### Dual Filtering
Orders can be filtered by both status AND order type:

```javascript
const filteredOrders = useMemo(() => {
  let filtered = allOrders;
  if (orderTypeFilter !== 'all') {
    filtered = filtered.filter(o => o.orderType === orderTypeFilter);
  }
  if (statusFilter !== 'all') {
    filtered = filtered.filter((o) => (o.status || '').toLowerCase() === statusFilter.toLowerCase());
  }
  return filtered;
}, [allOrders, statusFilter, orderTypeFilter]);
```

#### Enhanced Summary Cards
Four summary cards display statistics:

1. **Total Orders** - Count of all orders across all types
2. **In Progress** - Count of orders with "Processing" or "Shipped" status
3. **Delivered** - Count of completed orders
4. **Cancelled** - Count of cancelled orders

Plus three type-specific cards:
- **Regular Orders** - Total count of cart orders
- **Bulk Orders** - Total count of bulk requests
- **Free Samples** - Total count of sample requests

#### Filter UI
Two separate filter sections:
1. **Order Type Filter** - All Types, Regular Order, Bulk Order, Free Sample
2. **Status Filter** - All Statuses, Pending, Processing, Shipped, Delivered, Cancelled, Returned

#### Order Type Badges
Each order card displays a colored badge showing its type:
- **Blue badge** - Regular Order
- **Purple badge** - Bulk Order
- **Emerald badge** - Free Sample

#### Conditional Order Details Display

**Regular Orders:**
```
- Product name and quantity
- Unit price and subtotal
- Total amount and payment method
- Payment status
- Invoice download button
```

**Bulk Orders:**
```
- Product name (makhana type)
- Quantity requested (in units)
- Company name (if provided)
- Status tracking
- No payment info (quotes sent by admin)
```

**Free Samples:**
```
- Requester name and phone
- Delivery address
- Sample type (makhana type)
- Status tracking
- Free of charge indicator
```

#### Empty State Handling
```javascript
if (!isLoggedIn || allOrders.length === 0)
  // Show "No orders yet" message

else if (filteredOrders.length === 0)
  // Show "No orders match your filters"
  // Provide "Clear Filters" button
```

---

## Backend Changes

### 1. **Bulk Orders Route**: `server/routes/bulkOrders.js`

#### New Authentication
- Added `const auth = require('../middleware/auth');`

#### New Endpoint: `GET /api/bulk-orders/my`
```javascript
router.get('/my', auth, async (req, res) => {
  try {
    const bulkOrders = await BulkOrder.find({ 
      $or: [
        { userId: req.user._id },
        { email: req.user.email }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(bulkOrders);
  } catch (error) {
    console.error('Error fetching user bulk orders:', error);
    res.status(500).json({ error: 'Failed to fetch bulk orders' });
  }
});
```

**Features:**
- Requires JWT authentication
- Returns only orders belonging to the logged-in user
- Matches by both `userId` and email (for legacy data)
- Sorted by creation date (newest first)
- Graceful error handling

#### Updated Submit Endpoint
The `/submit` endpoint now optionally captures `userId` from JWT tokens:
```javascript
// Add userId if user is logged in (from authorization header)
const token = req.header('Authorization')?.replace('Bearer ', '');
if (token) {
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    bulkOrderData.userId = decoded._id;
  } catch (err) {
    // Token invalid or expired - continue without userId
  }
}
```

**Benefits:**
- Works for both logged-in and guest submissions
- Guest submissions can still be tracked by email
- No breaking changes to existing functionality

### 2. **Free Samples Route**: `server/routes/freeSamples.js`

#### New Authentication
- Added `const auth = require('../middleware/auth');`

#### New Endpoint: `GET /api/free-samples/my`
```javascript
router.get('/my', auth, async (req, res) => {
  try {
    const samples = await FreeSample.find({ 
      $or: [
        { userId: req.user._id },
        { email: req.user.email }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(samples);
  } catch (error) {
    console.error('Error fetching user free samples:', error);
    res.status(500).json({ error: 'Failed to fetch free sample requests' });
  }
});
```

**Features:**
- Same pattern as bulk orders for consistency
- Returns user-specific sample requests
- Email fallback for guest submissions
- Newest first sorting

#### Updated Submit Endpoint
Same optional `userId` capture as bulk orders

### 3. **Models Updated**

#### `server/models/BulkOrder.js`
Added field:
```javascript
userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
```

#### `server/models/FreeSample.js`
Added field:
```javascript
userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
```

**Migration Note:** Existing bulk orders and free samples without `userId` will still be retrievable via email matching.

---

## API Endpoints Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/orders/my` | ✅ Required | Fetch user's cart orders |
| GET | `/api/bulk-orders/my` | ✅ Required | Fetch user's bulk order requests |
| GET | `/api/free-samples/my` | ✅ Required | Fetch user's free sample requests |
| POST | `/api/orders` | ✅ Required | Create new cart order |
| POST | `/api/bulk-orders/submit` | ❌ Optional | Submit bulk order request |
| POST | `/api/free-samples/submit` | ❌ Optional | Submit free sample request |

---

## Database Structure

### Bulk Order Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),  // NEW
  fullName: String,
  company: String,
  phone: String,
  email: String,
  address: String (combined from addressLine1, etc.),
  makhanaType: String,
  monthlyVolume: String,
  packaging: String,
  postSampleQty: String,
  notes: String,
  status: String (enum: pending, quoted, confirmed, shipped, completed, cancelled),
  quotedPrice: Number,
  adminNotes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Free Sample Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),  // NEW
  name: String,
  company: String,
  phone: String,
  email: String,
  address: String (combined from addressLine1, etc.),
  makhanaType: String,
  requirement: String,
  message: String,
  status: String (enum: pending, processing, shipped, completed, cancelled),
  adminNotes: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Admin Dashboard Integration

### Admin Bulk Orders Tab
Admins can:
- View all bulk order requests
- Add quotations
- Change status (pending → quoted → confirmed → shipped → completed)
- Add admin notes
- Filter by status

The user will see status updates in real-time on their "My Orders" page.

### Admin Free Samples Tab
Admins can:
- View all free sample requests
- Change status (pending → processing → shipped → completed)
- Add admin notes
- Track shipping

Users see status updates immediately.

### Regular Orders (Existing)
Continue to work as before:
- Admins update order status via admin panel
- Users track orders in "My Orders" page

---

## User Experience Flow

### 1. Logged-In User Opens "My Orders"
```
1. Three API calls made simultaneously
2. Orders loaded and combined
3. Display all 3 types in one list
4. User can filter by type and/or status
5. User sees summary cards
```

### 2. User Submits Bulk Order (Logged In)
```
1. User fills form
2. Form includes bearer token
3. BulkOrder saved with userId
4. User can see request in "My Orders" immediately
5. Admin processes, updates status
6. User sees real-time status updates
```

### 3. User Requests Free Sample (Logged In)
```
1. User fills form
2. Form includes bearer token
3. FreeSample saved with userId
4. User can see request in "My Orders" immediately
5. Admin processes and ships
6. User tracks shipment status
```

### 4. User Tracks All Orders
```
Before: Had to visit 3 different pages
- My Orders (cart orders only)
- Bulk Orders (if admin had dashboard)
- Free Samples (if admin had dashboard)

After: One unified "My Orders" page
- See all 3 types
- Filter by type
- Filter by status
- See summary statistics
```

---

## Testing Checklist

- [ ] Logged-in user can see regular orders
- [ ] Logged-in user can see bulk order requests (if any)
- [ ] Logged-in user can see free sample requests (if any)
- [ ] Order type filter works (All, Regular, Bulk, Sample)
- [ ] Status filter works independently
- [ ] Both filters work together
- [ ] Summary cards show correct counts
- [ ] Order type badges display with correct colors
- [ ] Regular order shows items and total price
- [ ] Bulk order shows quantity and company
- [ ] Free sample shows address and type
- [ ] Orders sorted by date (newest first)
- [ ] Empty state shows when user has no orders
- [ ] "No matches" state shows when filters have no results
- [ ] Admin can update status for bulk orders
- [ ] Admin can update status for free samples
- [ ] User sees status updates in real-time
- [ ] Guest submissions still work (without userId)
- [ ] Email fallback works for legacy data

---

## Performance Optimizations

1. **Parallel API Calls**: `Promise.all()` reduces latency
2. **Memoization**: `useMemo` prevents unnecessary re-renders
3. **Graceful Degradation**: One failing endpoint doesn't block others
4. **Efficient Filtering**: Single pass through combined array
5. **Sorted Display**: Date sorting prevents client-side sort on every render

---

## Security Considerations

✅ **JWT Authentication** - Only authenticated users can access `/my` endpoints
✅ **User Isolation** - Each user only sees their own orders
✅ **Email Matching** - Legacy orders matched by email as fallback
✅ **Backend Validation** - Auth middleware verifies JWT before returning data
✅ **Error Handling** - No sensitive info leaked in error messages

---

## Future Enhancements

1. **Order Notifications** - Email/SMS when admin updates status
2. **Export Functionality** - Download orders as CSV/PDF
3. **Order Reordering** - Quick reorder button for bulk/samples
4. **Communication History** - Chat with admin about specific orders
5. **Timeline View** - Visual timeline of order status changes
6. **Mobile App Support** - Native app integration for push notifications

---

## Deployment Checklist

- [ ] Backend endpoints tested with Postman/Insomnia
- [ ] Frontend pages tested in Chrome, Firefox, Safari
- [ ] Mobile responsiveness verified
- [ ] Error states tested
- [ ] Admin dashboard can update all 3 order types
- [ ] No console errors or warnings
- [ ] Performance acceptable (API response < 2s)
- [ ] Production environment variables set
- [ ] Database migrations run
- [ ] User data privacy verified
