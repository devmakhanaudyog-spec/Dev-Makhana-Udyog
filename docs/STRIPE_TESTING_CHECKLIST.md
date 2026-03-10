# 🧪 Stripe Real-Time Payment Testing Checklist

## Pre-Testing Setup

### ✅ Environment Variables Check

- [ ] **Backend (.env)**: `STRIPE_SECRET_KEY` is set
- [ ] **Frontend (.env.local)**: `REACT_APP_STRIPE_PUBLISHABLE_KEY` is set
- [ ] Keys start with `sk_test_` and `pk_test_` (test mode)

### ✅ Dependencies Check

```bash
# Backend dependencies
cd server
npm list stripe razorpay
# Should show: stripe@20.0.0 or higher

# Frontend dependencies
cd ..
npm list @stripe/stripe-js @stripe/react-stripe-js
# Should show both packages installed
```

---

## 🚀 Testing Process

### Test 1: Backend API Connectivity

```bash
# Start backend server
cd server
npm start

# Should see:
# ✅ MongoDB Connected
# ✅ Server running on port 5000
```

**✅ Pass Criteria:** Server starts without errors

---

### Test 2: Frontend Build

```bash
# Start frontend (from root)
npm start

# Should see:
# Compiled successfully!
# Local: http://localhost:3000
```

**✅ Pass Criteria:** Frontend loads without errors

---

### Test 3: User Authentication

1. [ ] Navigate to http://localhost:3000/login
2. [ ] Create new account or login
3. [ ] Verify you're redirected to home page
4. [ ] Check if user name appears in navbar

**✅ Pass Criteria:** User can login successfully

---

### Test 4: Cart Functionality

1. [ ] Go to Products page
2. [ ] Add 2-3 products to cart
3. [ ] Click cart icon in navbar
4. [ ] Verify cart page shows all items
5. [ ] Verify total price is calculated correctly

**✅ Pass Criteria:** Cart shows correct items and pricing

---

### Test 5: Checkout Page Loading

1. [ ] From cart page, click "Proceed to Checkout" or "Checkout"
2. [ ] You should land on `/checkout` or `/enhanced-checkout`
3. [ ] Verify form loads with:
   - [ ] Name field (pre-filled if logged in)
   - [ ] Email field (pre-filled if logged in)
   - [ ] Phone field
   - [ ] Address fields
   - [ ] Payment method selection

**✅ Pass Criteria:** Checkout page loads completely

---

### Test 6: Stripe Payment Method Selection

1. [ ] On checkout page, find payment method options
2. [ ] Select "Stripe" or "Card" payment method
3. [ ] Verify Stripe option is selectable

**✅ Pass Criteria:** Can select Stripe payment

---

### Test 7: Stripe Elements Loading

1. [ ] Fill all required fields (name, email, phone, address)
2. [ ] Click "Place Order" or "Continue to Payment"
3. [ ] Verify Stripe payment modal/form appears
4. [ ] Check for:
   - [ ] Card number input field
   - [ ] Expiry date input field
   - [ ] CVV input field
   - [ ] Card logos (Visa, Mastercard, Amex)

**✅ Pass Criteria:** Stripe Elements UI loads properly

---

### Test 8: Real-Time Card Validation

#### Test 8a: Invalid Card Number
1. [ ] Type: `1234 5678 9012 3456` (invalid)
2. [ ] Observe: Field should show error or red highlight

#### Test 8b: Valid Card Number
1. [ ] Clear previous input
2. [ ] Type: `4242 4242 4242 4242` (valid Visa)
3. [ ] Observe: Field should accept input, may show green/blue

#### Test 8c: Auto-Formatting
1. [ ] As you type card number, verify:
   - [ ] Spaces added automatically (4242 4242 4242 4242)
   - [ ] Card brand icon appears (Visa logo)

#### Test 8d: Expiry Validation
1. [ ] Enter past date: `01/20`
2. [ ] Observe: Should show error
3. [ ] Enter future date: `12/34`
4. [ ] Observe: Should accept

#### Test 8e: CVV Validation
1. [ ] Enter 2 digits: `12`
2. [ ] Observe: May show incomplete
3. [ ] Enter 3 digits: `123`
4. [ ] Observe: Should accept

**✅ Pass Criteria:** All validations work in real-time as you type

---

### Test 9: Payment Processing - Success Flow

#### Payment Details to Use:
```
Card Number: 4242 4242 4242 4242
Expiry: 12/34
CVV: 123
Name: Test User
```

#### Steps:
1. [ ] Enter card details above
2. [ ] Click "Pay" or "Submit Payment" button
3. [ ] Observe:
   - [ ] Button shows loading spinner
   - [ ] Button text changes to "Processing..."
   - [ ] Button is disabled during processing
4. [ ] Wait 1-3 seconds
5. [ ] Verify:
   - [ ] Success message appears (toast/alert)
   - [ ] Redirected to order success page
   - [ ] Order confirmation shown

#### Verify Order Created:
- [ ] Check database or admin panel for new order
- [ ] Order status should be "Processing" or "Confirmed"
- [ ] Payment status should be "Paid"
- [ ] Stripe payment ID should be saved

**✅ Pass Criteria:** Payment succeeds in 1-3 seconds, order created

---

### Test 10: Payment Processing - Decline Flow

#### Payment Details to Use:
```
Card Number: 4000 0000 0000 9995 (Always declined)
Expiry: 12/34
CVV: 123
```

#### Steps:
1. [ ] Add items to cart again
2. [ ] Go through checkout
3. [ ] Enter decline card details
4. [ ] Click "Pay"
5. [ ] Observe:
   - [ ] Error message appears
   - [ ] User stays on checkout page
   - [ ] No order created
   - [ ] User can retry with different card

**✅ Pass Criteria:** Decline handled gracefully, user can retry

---

### Test 11: Payment Processing - 3D Secure Flow

#### Payment Details to Use:
```
Card Number: 4000 0025 0000 3155 (Requires authentication)
Expiry: 12/34
CVV: 123
```

#### Steps:
1. [ ] Enter 3D Secure card details
2. [ ] Click "Pay"
3. [ ] Observe:
   - [ ] Stripe 3D Secure modal appears
   - [ ] Shows authentication challenge
4. [ ] Complete authentication
5. [ ] Verify:
   - [ ] Payment succeeds after auth
   - [ ] Order created

**✅ Pass Criteria:** 3D Secure authentication works

---

### Test 12: Network Debugging

#### Browser DevTools Check:

1. [ ] Open DevTools (F12)
2. [ ] Go to Network tab
3. [ ] Perform test payment
4. [ ] Verify these API calls:

**API Calls to Check:**

| Request | Endpoint | Status | Response |
|---------|----------|--------|----------|
| 1 | POST `/api/payments/stripe/create-intent` | 200 | Has clientSecret |
| 2 | POST to `api.stripe.com` | 200 | Payment confirmation |
| 3 | POST `/api/orders` | 201 | Order created |

5. [ ] Check Console tab for errors
   - [ ] No red errors
   - [ ] Stripe.js loaded successfully

**✅ Pass Criteria:** All API calls return success

---

### Test 13: Cart Clearing

1. [ ] Complete successful payment
2. [ ] Go back to cart page
3. [ ] Verify:
   - [ ] Cart is empty
   - [ ] "Cart is empty" message shown
   - [ ] Cart count in navbar shows 0

**✅ Pass Criteria:** Cart clears after successful order

---

### Test 14: Order Confirmation Page

1. [ ] After successful payment
2. [ ] Verify order success page shows:
   - [ ] Order number
   - [ ] Order items list
   - [ ] Total amount paid
   - [ ] Delivery address
   - [ ] Payment method (Stripe)
   - [ ] Estimated delivery date
   - [ ] "Track Order" button (optional)

**✅ Pass Criteria:** All order details displayed correctly

---

### Test 15: Multiple Payments

1. [ ] Complete first payment (success)
2. [ ] Add new items to cart
3. [ ] Complete second payment
4. [ ] Verify both orders exist
5. [ ] Check user profile/orders page
6. [ ] Verify order history shows both orders

**✅ Pass Criteria:** Multiple payments work independently

---

## 🔍 Advanced Testing

### Test 16: Rate Limiting

1. [ ] Try to create 25+ payment intents rapidly
2. [ ] Observe: Should get "Too many requests" error after 20 attempts
3. [ ] Wait 1 minute
4. [ ] Try again: Should work

**✅ Pass Criteria:** Rate limiting prevents abuse

---

### Test 17: Session Expiry

1. [ ] Login to account
2. [ ] Wait for JWT to expire (or manually delete token)
3. [ ] Try to checkout
4. [ ] Verify: Redirected to login page

**✅ Pass Criteria:** Expired sessions handled properly

---

### Test 18: Different Card Types

Test with these cards:

| Card | Brand | Number |
|------|-------|--------|
| [ ] | Visa | 4242 4242 4242 4242 |
| [ ] | Visa (debit) | 4000 0566 5566 5556 |
| [ ] | Mastercard | 5555 5555 5555 4444 |
| [ ] | Amex | 3782 822463 10005 |

All should process successfully.

**✅ Pass Criteria:** All major card brands work

---

### Test 19: Amount Calculation

Verify payment amounts match:

1. [ ] Cart total: ₹500
2. [ ] Shipping: ₹50 (if under ₹1000)
3. [ ] Tax (18%): ₹99
4. [ ] Discount: -₹50 (if coupon applied)
5. [ ] Final total should match exactly in:
   - [ ] Cart page
   - [ ] Checkout page
   - [ ] Stripe payment modal
   - [ ] Order confirmation

**✅ Pass Criteria:** Amounts consistent across all pages

---

### Test 20: Mobile Responsiveness

1. [ ] Open DevTools → Toggle device toolbar (Ctrl+Shift+M)
2. [ ] Select mobile device (iPhone 12, Galaxy S21, etc.)
3. [ ] Go through entire checkout flow
4. [ ] Verify:
   - [ ] Forms are usable
   - [ ] Stripe Elements responsive
   - [ ] Buttons clickable
   - [ ] Payment modal fits screen

**✅ Pass Criteria:** Works on mobile devices

---

## 📊 Results Summary

### Total Tests: 20
### Passed: ___ / 20
### Failed: ___ / 20

---

## ❌ Troubleshooting Guide

### Issue: "Stripe not configured" error

**Solution:**
```bash
# Check backend .env
cat server/.env | grep STRIPE_SECRET_KEY
# Should show: STRIPE_SECRET_KEY=sk_test_xxx

# If missing, add:
echo "STRIPE_SECRET_KEY=sk_test_51SY..." >> server/.env

# Restart backend
cd server && npm start
```

---

### Issue: Card input field not showing

**Solution:**
```bash
# Check frontend .env.local
cat .env.local | grep STRIPE_PUBLISHABLE_KEY
# Should show: REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# If missing, add:
echo "REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51SY..." >> .env.local

# Restart frontend
npm start
```

---

### Issue: Payment hangs/never completes

**Solutions:**
1. Check network tab for failed API calls
2. Verify backend is running (`http://localhost:5000`)
3. Check CORS settings allow frontend origin
4. Verify MongoDB is connected
5. Check server logs for errors

---

### Issue: "Invalid API key" error

**Solutions:**
1. Verify key format:
   - Backend: `sk_test_xxx` (starts with sk_)
   - Frontend: `pk_test_xxx` (starts with pk_)
2. Ensure no extra spaces in .env files
3. Keys must be from same Stripe account
4. Restart both servers after .env changes

---

### Issue: Order created but payment failed

**Solution:**
- Check payment verification logic
- Ensure order creation happens AFTER successful payment
- Verify `paymentStatus` field is set correctly

---

## 🎯 Production Checklist

Before going live:

- [ ] Replace test keys with live keys (sk_live_xxx, pk_live_xxx)
- [ ] Set up Stripe webhooks
- [ ] Enable production CORS origins
- [ ] Test with real bank cards (small amounts)
- [ ] Monitor first few transactions closely
- [ ] Set up payment failure alerts
- [ ] Configure refund process
- [ ] Add customer support contact

---

## 📈 Success Metrics

A successful integration should have:

- ✅ **Payment Success Rate**: > 95%
- ✅ **Average Processing Time**: 1-3 seconds
- ✅ **Error Rate**: < 5%
- ✅ **3D Secure Success**: > 90%
- ✅ **User Retry After Failure**: > 70%

---

## 📝 Notes

Record any issues or observations during testing:

```
Date: ________________
Tester: ______________

Issue 1: ___________________________________________
Status: Resolved / Pending
Solution: __________________________________________

Issue 2: ___________________________________________
Status: Resolved / Pending
Solution: __________________________________________
```

---

## ✅ Final Sign-Off

- [ ] All tests passed
- [ ] No critical errors found
- [ ] Payment flow works end-to-end
- [ ] Real-time validation confirmed
- [ ] Error handling verified
- [ ] Ready for user testing

**Tested by:** ________________
**Date:** ________________
**Signature:** ________________

---

**🎉 If all tests pass, your Stripe integration is production-ready!**
