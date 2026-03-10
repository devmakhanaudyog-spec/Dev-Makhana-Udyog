# Payment Integration Setup Guide

## 🔐 Required API Keys

### 1. Razorpay (For Indian Payments)
1. Visit [Razorpay Dashboard](https://dashboard.razorpay.com/signup)
2. Create a free account
3. Go to **Settings > API Keys**
4. Generate Test/Live Keys
5. Copy:
   - Key ID (starts with `rzp_test_`)
   - Key Secret (hidden by default)

### 2. Stripe (For International Payments)
1. Visit [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Create a free account
3. Go to **Developers > API Keys**
4. Copy:
   - Publishable Key (starts with `pk_test_`)
   - Secret Key (starts with `sk_test_`)
5. For webhooks: **Developers > Webhooks > Add Endpoint**
   - URL: `https://yourdomain.com/api/payments/stripe/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the **Signing Secret** (starts with `whsec_`)

---

## 📝 Environment Variables Setup

### Backend (.env in `server/` folder)
```env
# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key_here

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxx
```

### Frontend (.env.local in root folder)
```env
# Razorpay (Only Publishable Key)
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx

# Stripe (Only Publishable Key)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🧪 Test Cards

### Razorpay Test Cards
| Card Number | CVV | Expiry | Result |
|-------------|-----|--------|--------|
| 4111 1111 1111 1111 | Any | Future | Success |
| 5555 5555 5555 4444 | Any | Future | Success |
| 4000 0000 0000 0002 | Any | Future | Declined |

### Stripe Test Cards
| Card Number | CVV | Expiry | Result |
|-------------|-----|--------|--------|
| 4242 4242 4242 4242 | Any | Future | Success |
| 4000 0025 0000 3155 | Any | Future | 3D Secure |
| 4000 0000 0000 9995 | Any | Future | Declined |

---

## 🚀 Running the Application

### 1. Install Dependencies
```bash
# Backend
cd server
npm install

# Frontend
cd ..
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables
- Update `server/.env` with your API keys
- Update `.env.local` with publishable keys

### 3. Start Backend Server
```bash
cd server
npm start
# Server runs on http://localhost:5000
```

### 4. Start Frontend
```bash
npm start
# App opens at http://localhost:3000
```

---

## 📦 Testing Payment Flow

### COD (Cash on Delivery)
1. Add products to cart
2. Go to checkout
3. Select "Cash on Delivery"
4. Click "Place Order"
5. Order status: "Pending"

### Razorpay
1. Add products to cart
2. Go to checkout
3. Select "Razorpay"
4. Click "Proceed to Payment"
5. Enter test card details
6. Complete payment
7. Order status: "Paid"

### Stripe
1. Add products to cart
2. Go to checkout
3. Select "Stripe"
4. Click "Proceed to Payment"
5. Enter test card details
6. Complete payment
7. Order status: "Paid"

---

## 🔍 Verifying Orders

### Frontend
- Go to **Profile > My Orders**
- See order history with payment status

### Backend
Check MongoDB:
```bash
# Connect to MongoDB
mongosh

# Use database
use ecommerce

# View orders
db.orders.find().pretty()
```

---

## 🐛 Troubleshooting

### Payment Button Not Working
- Check browser console for errors
- Verify API keys in `.env` files
- Ensure backend server is running
- Check CORS settings in `server.js`

### "Invalid API Key" Error
- Confirm you're using **test keys** (not live keys)
- Check for extra spaces in `.env` files
- Restart both frontend and backend servers

### Razorpay Not Loading
- Check internet connection (loads from CDN)
- Open DevTools > Network tab
- Look for `checkout.js` file loading

### Stripe Elements Not Showing
- Verify `@stripe/react-stripe-js` installed
- Check `REACT_APP_STRIPE_PUBLISHABLE_KEY` in `.env.local`
- Look for console errors

---

## 🔒 Security Notes

⚠️ **NEVER** commit `.env` files to Git!

Add to `.gitignore`:
```
.env
.env.local
.env.production
server/.env
```

⚠️ **Secret keys** (starting with `sk_` or `key_secret`) should ONLY be in backend `.env`

✅ **Publishable keys** (starting with `pk_` or `rzp_test_`) can be in frontend

---

## 📚 Documentation Links

- [Razorpay Docs](https://razorpay.com/docs/)
- [Stripe Docs](https://stripe.com/docs)
- [Payment Security Best Practices](https://stripe.com/docs/security/guide)

---

## ✅ Production Checklist

Before going live:
- [ ] Replace test keys with **live keys**
- [ ] Set `NODE_ENV=production` in backend
- [ ] Enable webhook endpoints on Razorpay/Stripe
- [ ] Set up proper error logging (Sentry, etc.)
- [ ] Add rate limiting on payment endpoints
- [ ] Configure HTTPS (SSL certificate)
- [ ] Test all payment flows thoroughly
- [ ] Set up customer email notifications
- [ ] Review security settings in Razorpay/Stripe dashboard

---

**Need Help?**
- Razorpay Support: support@razorpay.com
- Stripe Support: https://support.stripe.com
