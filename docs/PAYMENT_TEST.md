# 🧪 Quick Payment Test Guide

## Test Login Credentials
- **Email**: test1@example.com
- **Password**: password123

## Test Payment Steps

### 1. Login
- Go to http://localhost:3000
- Click "Login" in navbar
- Use credentials above

### 2. Add Products to Cart
- Browse products
- Click "Add to Cart" on any product
- View cart (cart icon in navbar)

### 3. Proceed to Checkout
- Click "Proceed to Checkout"
- Fill shipping address:
  - Name: Test User
  - Phone: 9876543210
  - Address: 123 Test Street
  - City: Mumbai
  - State: Maharashtra
  - Zip: 400001

### 4. Choose Payment Method & Pay

#### Option A: Cash on Delivery (COD)
1. Select "Cash on Delivery"
2. Click "Place Order"
3. ✅ Order created with status "Pending"

#### Option B: Razorpay (Need API Key)
1. Select "Razorpay"
2. Click "Proceed to Payment"
3. **NOTE**: Requires `REACT_APP_RAZORPAY_KEY_ID` in .env.local
4. Use test card: 4111 1111 1111 1111
5. Any CVV, future expiry
6. ✅ Order created with status "Paid"

#### Option C: Stripe (Ready!)
1. Select "Stripe"
2. Click "Proceed to Payment"
3. Enter card details:
   - **Card Number**: 4242 4242 4242 4242
   - **Expiry**: 12/34 (any future date)
   - **CVC**: 123
   - **ZIP**: 12345
4. Click "Pay Now"
5. ✅ Order created with status "Paid"

### 5. View Order
- Redirected to order success page
- See order number and payment status
- Click "View My Orders" to see all orders

## Current Status
✅ **Backend**: Running on port 5000  
✅ **Frontend**: Running on port 3000  
✅ **Stripe**: Fully configured and ready  
⚠️ **Razorpay**: Needs API key in .env.local  

## Quick Test (30 seconds)
1. Login with test1@example.com / password123
2. Add any product to cart
3. Go to checkout
4. Fill address form
5. Select "Stripe"
6. Use card: 4242 4242 4242 4242
7. Complete payment
8. See success page! 🎉
