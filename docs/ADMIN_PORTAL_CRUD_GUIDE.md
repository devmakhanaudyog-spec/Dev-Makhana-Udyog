# Admin Portal - Sales & Orders Module Documentation

## Overview

The Admin Portal's **Sales & Orders** section provides complete management of three order types with full CRUD (Create, Read, Update, Delete) operations:

1. **Regular Orders** - Orders placed through the shopping cart
2. **Bulk Orders** - Wholesale/bulk purchase requests
3. **Free Samples** - Free sample requests from customers

Status updates made in the admin portal are automatically reflected in the user's "My Orders" page in real-time.

---

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 with Hooks, React Router
- **State Management**: useState, useCallback for optimization
- **HTTP Client**: Axios with JWT Bearer tokens
- **UI Components**: Tailwind CSS, Lucide React icons
- **Notifications**: React Hot Toast

### API Layer
```
Admin Dashboard (AdminDashboardNew.jsx)
    ↓
Tab Components (OrdersTab, BulkOrdersTab, FreeSamplesTab)
    ↓
API Routes (/api/admin/...)
    ↓
Middleware (auth, adminOnly)
    ↓
Database Models (Order, BulkOrder, FreeSample)
```

---

## 1. REGULAR ORDERS TAB

### Features

#### View Orders
- Display all cart orders in a searchable, filterable table
- Filter by status: Pending, Processing, Shipped, Delivered, Cancelled, Returned
- View complete order details in modal popup
- See customer info, order items, total amount, payment details

#### Update Status
- Inline status dropdown in table
- Immediate API call on selection
- Visual feedback with status badges (colors indicate status)
- Options: Pending → Processing → Shipped → Delivered / Cancelled / Returned

#### Add Tracking ID
- Edit modal with dedicated field for tracking ID
- Send to customer for real-time shipment tracking
- Optional field (can be left blank initially)

#### View Full Details
- Modal popup showing:
  - Order number (auto-generated or custom)
  - Customer name and email
  - All items with quantities and prices
  - Shipping address
  - Total amount and payment method
  - Tracking ID (if provided)
  - Order date

#### Delete Orders
- Permanent deletion with confirmation dialog
- Soft delete recommended for production (not implemented currently)
- Removes order from system completely

### API Endpoints

```javascript
// Get all orders (paginated)
GET /api/admin/orders
Auth: JWT Bearer token
Admin: Required
Response: {
  orders: Array<Order>,
  total: Number,
  pages: Number,
  currentPage: Number
}

// Get single order
GET /api/admin/orders/:id
Auth: JWT Bearer token
Admin: Required
Response: Order object

// Update order status & tracking
PUT /api/admin/orders/:id
Auth: JWT Bearer token
Admin: Required
Body: {
  status: String,      // pending, processing, shipped, delivered, cancelled, returned
  trackingId?: String  // optional tracking number
}
Response: Updated Order object

// Delete order
DELETE /api/admin/orders/:id
Auth: JWT Bearer token
Admin: Required
Response: { message: "Order deleted successfully" }
```

### Order Statuses & Flow

```
pending (initial)
    ↓
processing (admin packs order)
    ↓
shipped (dispatched with tracking ID)
    ↓
delivered (final success) or cancelled (admin cancels)
    
Alternative paths:
- pending → cancelled (if cancelled before processing)
- shipped → returned (if customer returns after delivery)
```

### Frontend Component: OrdersTab.jsx

**Key Functions:**
- `handleStatusUpdate()` - Updates status with API call
- `handleTrackingUpdate()` - Adds tracking ID
- `handleDeleteOrder()` - Deletes order with confirmation
- `filteredOrders` - Filters by selected status

**State:**
```javascript
const [selectedOrder, setSelectedOrder] = useState(null);      // Details modal
const [editingOrder, setEditingOrder] = useState(null);        // Edit modal
const [statusFilter, setStatusFilter] = useState('all');       // Filter
const [isLoading, setIsLoading] = useState(false);             // API loading
```

**Modals:**
1. **View Details** - Read-only modal showing all order info
2. **Edit Order** - Status dropdown + tracking ID field

---

## 2. BULK ORDERS TAB

### Features

#### View Bulk Requests
- Display all bulk order requests in table format
- Filter by status: Pending, Quoted, Confirmed, Shipped, Completed, Cancelled
- See company name, contact email, product type, requested quantity

#### Update Status
- Status workflow: Pending → Quoted → Confirmed → Shipped → Completed
- Inline dropdown selector
- Color-coded status badges
- Can also cancel requests

#### Send Quotation
- Modal to enter quoted price
- Add admin notes (internal communication)
- Save both price and notes together
- Email notifications can be added later

#### View Full Details
- Modal showing:
  - Company and contact person info
  - Email, phone, complete address
  - Product type and monthly volume needed
  - Packaging preferences
  - Special requirements/notes
  - Quoted price (if provided)
  - Admin notes (internal)
  - Request date

#### Delete Requests
- Remove bulk order requests from system
- With confirmation dialog

### API Endpoints

```javascript
// Get all bulk orders
GET /api/admin/bulk-orders
Auth: JWT Bearer token
Admin: Required
Response: {
  bulkOrders: Array<BulkOrder>,
  total: Number,
  pages: Number,
  currentPage: Number
}

// Get single bulk order
GET /api/admin/bulk-orders/:id
Auth: JWT Bearer token
Admin: Required
Response: BulkOrder object

// Update bulk order (status, price, notes)
PUT /api/admin/bulk-orders/:id
Auth: JWT Bearer token
Admin: Required
Body: {
  status: String,           // pending, quoted, confirmed, shipped, completed, cancelled
  quotedPrice?: Number,     // ₹ price in rupees
  adminNotes?: String       // internal notes
}
Response: Updated BulkOrder object

// Delete bulk order
DELETE /api/admin/bulk-orders/:id
Auth: JWT Bearer token
Admin: Required
Response: { message: "Bulk order request deleted" }
```

### Bulk Order Statuses & Flow

```
pending (initial request)
    ↓
quoted (admin sends quote)
    ↓
confirmed (customer confirms)
    ↓
shipped (order dispatched)
    ↓
completed (final delivery)

Alternative:
- Any status → cancelled (if deal falls through)
```

### Frontend Component: BulkOrdersTab.jsx

**Key Functions:**
- `handleStatusUpdate()` - Updates status
- `handleQuoteUpdate()` - Updates price + notes
- `handleDeleteOrder()` - Deletes bulk request

**State:**
```javascript
const [selectedOrder, setSelectedOrder] = useState(null);
const [editingOrder, setEditingOrder] = useState(null);
const [statusFilter, setStatusFilter] = useState('all');
const [isLoading, setIsLoading] = useState(false);
```

**Modals:**
1. **View Details** - Complete request information
2. **Edit Order** - Status, price, notes fields

---

## 3. FREE SAMPLES TAB

### Features

#### View Sample Requests
- Display all free sample requests in table
- Filter by status: Pending, Processing, Shipped, Completed, Cancelled
- See requestor name, email, product type, request date

#### Update Status
- Status workflow: Pending → Processing → Shipped → Completed
- Inline dropdown selector
- Can cancel requests

#### Add Tracking & Notes
- Modal to update status and add admin notes
- Notes can include tracking number, shipping details, etc.
- Saved together in one update

#### View Full Details
- Modal showing:
  - Requestor name, email, phone
  - Company (if applicable)
  - Complete shipping address
  - Product type requested
  - Special requirements/message
  - Request date
  - Current status
  - Admin notes

#### Delete Requests
- Remove sample requests from system
- With confirmation dialog

### API Endpoints

```javascript
// Get all free sample requests
GET /api/admin/free-samples
Auth: JWT Bearer token
Admin: Required
Response: {
  samples: Array<FreeSample>,
  total: Number,
  pages: Number,
  currentPage: Number
}

// Get single sample request
GET /api/admin/free-samples/:id
Auth: JWT Bearer token
Admin: Required
Response: FreeSample object

// Update sample request (status, notes)
PUT /api/admin/free-samples/:id
Auth: JWT Bearer token
Admin: Required
Body: {
  status: String,         // pending, processing, shipped, completed, cancelled
  adminNotes?: String     // tracking number, internal notes, etc
}
Response: Updated FreeSample object

// Delete sample request
DELETE /api/admin/free-samples/:id
Auth: JWT Bearer token
Admin: Required
Response: { message: "Sample request deleted" }
```

### Sample Request Statuses & Flow

```
pending (initial request)
    ↓
processing (preparing sample)
    ↓
shipped (dispatched)
    ↓
completed (delivered)

Alternative:
- Any status → cancelled (if cannot fulfill)
```

### Frontend Component: FreeSamplesTab.jsx

**Key Functions:**
- `handleStatusUpdate()` - Updates status
- `handleNotesUpdate()` - Updates admin notes
- `handleDeleteSample()` - Deletes request

**State:**
```javascript
const [selectedSample, setSelectedSample] = useState(null);
const [editingSample, setEditingSample] = useState(null);
const [statusFilter, setStatusFilter] = useState('all');
const [isLoading, setIsLoading] = useState(false);
```

**Modals:**
1. **View Details** - Complete request information
2. **Edit Sample** - Status and notes fields

---

## User-Facing Impact

### Regular Orders
When admin updates order status → User sees in "My Orders" page:
- Status badge updates in real-time
- Tracking ID becomes visible after "shipped" status
- Order moves to appropriate filtered section

### Bulk Orders
When admin updates bulk request → User sees:
- Status changes in "My Orders" page
- Quoted price becomes visible after "quoted" status
- Timeline of negotiation moves visible

### Free Samples
When admin updates sample request → User sees:
- Status changes from "pending" to "processing" to "shipped" to "completed"
- Admin notes (tracking) visible in order details
- Estimated delivery information

---

## Production-Ready Features

### Error Handling
- Try-catch blocks around all API calls
- User-friendly error toasts
- Error logging in console
- Graceful degradation

### Loading States
- `isLoading` flag prevents duplicate submissions
- Disabled buttons during API calls
- "Saving..." text feedback

### Data Validation
- Status must be from allowed enum
- Email validation on free sample requests
- Quantity validation on bulk orders

### Security
- JWT Bearer token authentication required
- Admin-only middleware verification
- No sensitive data in error messages
- CORS properly configured

### Performance
- useCallback hooks prevent unnecessary re-renders
- Efficient filtering (single pass)
- Pagination support in API (can be added to frontend)
- Lazy loading modals (only rendered when needed)

### UX/UI
- Color-coded status badges
- Consistent modal design
- Responsive table layout
- Mobile-friendly dialogs
- Clear action buttons with icons
- Confirmation dialogs for destructive actions
- Toast notifications for feedback

---

## Common Workflows

### Workflow 1: New Order Arrives
```
1. Order appears in "Orders" tab as "pending"
2. Admin reviews order details
3. Admin changes to "processing"
4. Warehouse packs order
5. Admin changes to "shipped" and adds tracking ID
6. User sees tracking ID in their My Orders page
7. Eventually changes to "delivered"
```

### Workflow 2: Bulk Order Lead
```
1. Bulk request appears as "pending"
2. Admin reviews company details
3. Admin sends quote via email (external)
4. Admin changes to "quoted" and enters ₹ price
5. Customer reviews quote
6. Customer confirms
7. Admin changes to "confirmed"
8. Warehouse prepares shipment
9. Admin changes to "shipped"
10. Finally changes to "completed"
```

### Workflow 3: Free Sample Request
```
1. Sample request appears as "pending"
2. Admin reviews requirements
3. Admin changes to "processing" (preparing sample)
4. Admin changes to "shipped" with tracking in notes
5. Customer receives sample
6. Admin changes to "completed"
```

---

## Testing Checklist

**Orders Tab:**
- [ ] View list of orders
- [ ] Filter orders by status
- [ ] Click view button → see full details modal
- [ ] Click edit → change status and see update reflected
- [ ] Add tracking ID and verify it shows in modal
- [ ] Delete order with confirmation
- [ ] Error handling when API fails

**Bulk Orders Tab:**
- [ ] View list of bulk orders
- [ ] Filter by status (pending, quoted, confirmed, shipped, completed, cancelled)
- [ ] View complete bulk request details
- [ ] Edit bulk order → change status
- [ ] Send quote with price and notes
- [ ] Delete bulk order with confirmation
- [ ] Verify quoted price displays in details

**Free Samples Tab:**
- [ ] View list of free sample requests
- [ ] Filter by status
- [ ] View complete sample request details
- [ ] Update status from pending → processing → shipped → completed
- [ ] Add tracking number in admin notes
- [ ] Delete sample request with confirmation

**User Perspective:**
- [ ] Update order status in admin → appears in user's "My Orders" immediately
- [ ] Update bulk order status in admin → appears in user's "My Orders"
- [ ] Update sample status in admin → appears in user's "My Orders"
- [ ] User can see order type badge (Regular/Bulk/Sample)
- [ ] User can see all order details matching admin information

---

## Backend Endpoints Summary

**Base URL:** `http://localhost:5000/api`

| Method | Endpoint | Auth | Role | Purpose |
|--------|----------|------|------|---------|
| GET | /admin/orders | ✅ | Admin | List all orders |
| GET | /admin/orders/:id | ✅ | Admin | Get single order |
| PUT | /admin/orders/:id | ✅ | Admin | Update status/tracking |
| DELETE | /admin/orders/:id | ✅ | Admin | Delete order |
| GET | /admin/bulk-orders | ✅ | Admin | List all bulk orders |
| GET | /admin/bulk-orders/:id | ✅ | Admin | Get single bulk order |
| PUT | /admin/bulk-orders/:id | ✅ | Admin | Update status/price/notes |
| DELETE | /admin/bulk-orders/:id | ✅ | Admin | Delete bulk order |
| GET | /admin/free-samples | ✅ | Admin | List all samples |
| GET | /admin/free-samples/:id | ✅ | Admin | Get single sample |
| PUT | /admin/free-samples/:id | ✅ | Admin | Update status/notes |
| DELETE | /admin/free-samples/:id | ✅ | Admin | Delete sample |

**Authentication:** All endpoints require `Authorization: Bearer <JWT_TOKEN>`

---

## Environment Variables

**Required for admin portal:**
```
REACT_APP_API_URL=http://localhost:5000
JWT_SECRET=your-secret-key (backend)
NODE_ENV=production (for error handling)
```

---

## Troubleshooting

### Issue: Status doesn't update
**Solution:**
1. Check JWT token validity
2. Verify admin role in database
3. Check browser console for errors
4. Verify API endpoint is responding

### Issue: Modal doesn't close
**Solution:**
1. Check for JavaScript errors in console
2. Verify close button click handler
3. Look for stuck loading state

### Issue: Changes don't appear in user's orders
**Solution:**
1. User must refresh their "My Orders" page
2. Check Order API is working (`/api/orders/my`)
3. Verify status matches what user page expects

### Issue: Delete fails
**Solution:**
1. Verify order ID is valid
2. Check for foreign key constraints
3. Ensure order exists before deleting

---

## Future Enhancements

1. **Bulk Email** - Send status updates to multiple customers
2. **CSV Export** - Export orders to spreadsheet
3. **Bulk Actions** - Update multiple orders at once
4. **Notifications** - Email/SMS customer on status change
5. **Notes History** - Track all changes to an order
6. **Order Assignment** - Assign orders to team members
7. **Shipping Integration** - Real tracking from ShipRocket/Delhivery
8. **Invoice Generation** - Auto-generate PDF invoices
9. **Return Management** - Track returned items and refunds
10. **Analytics** - Reports on order completion rates

---

## Deployment Checklist

- [ ] All API endpoints tested with Postman
- [ ] JWT authentication working
- [ ] Error handling tested (network failures, etc)
- [ ] Loading states display correctly
- [ ] Modals work on mobile
- [ ] Status updates reflected in user's My Orders
- [ ] Delete confirmation prevents accidental deletion
- [ ] No console errors or warnings
- [ ] Admin access properly restricted
- [ ] Database backups configured
- [ ] Error logging configured
- [ ] Performance acceptable (< 2s API response)

---

## Support & Maintenance

### Regular Maintenance
- Monitor admin portal usage logs
- Check for failed API calls
- Verify status transitions are logical
- Archive old orders periodically

### Monitoring
- Track orders by status (pending → delivered %)
- Monitor bulk order success rate
- Track sample request conversion
- Alert on high error rates

### Documentation
- Keep API docs up-to-date
- Document custom status workflows
- Train new admins on workflows
- Create video tutorials for team

