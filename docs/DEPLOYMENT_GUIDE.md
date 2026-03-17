# Ã°Å¸Å¡â‚¬ Deployment Guide - Dev Makhana Udyog E-Commerce

## Ã¢Å“â€¦ Pre-Deployment Checklist

Your code is **production-ready** with:
- Ã¢Å“â€¦ Deployment configs added (vercel.json, render.yaml)
- Ã¢Å“â€¦ Environment variables properly configured
- Ã¢Å“â€¦ Security measures in place (.gitignore)
- Ã¢Å“â€¦ Error handling implemented
- Ã¢Å“â€¦ Rate limiting enabled
- Ã¢Å“â€¦ MongoDB Atlas ready
- Ã¢Å“â€¦ Payment gateways configured

---

## Ã°Å¸Å½Â¯ Deployment Architecture

```
Frontend (Vercel)  Ã¢â€ â€™  Backend (Render)  Ã¢â€ â€™  MongoDB Atlas
     React              Node.js/Express      Database
```

---

## Ã°Å¸â€œÂ¦ PART 1: Deploy Backend to Render

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### Step 2: Create New Web Service
1. Click **"New +"** Ã¢â€ â€™ **"Web Service"**
2. Connect your GitHub repository: `dev-makhana-udyog`
3. Configure the service:

```
Name: dev-makhana-udyog-api
Region: Oregon (US West) or closest to your users
Branch: main
Root Directory: ecommerce/server
Environment: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free (or Starter $7/month for better performance)
```

### Step 3: Add Environment Variables

Click **"Environment"** tab and add these variables:

```bash
# Required Variables
NODE_ENV=production
PORT=10000
CLIENT_URL=https://your-app.vercel.app

# MongoDB (IMPORTANT: Use your actual credentials)
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.mongodb.net/ecommerce?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=30d

# Stripe
STRIPE_SECRET_KEY=sk_live_your_live_key_or_sk_test_for_testing
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key_or_pk_test_for_testing
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Razorpay (Optional)
RAZORPAY_KEY_ID=rzp_live_your_key_or_rzp_test_for_testing
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Cloudinary (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Step 4: Deploy
1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Start your server
   - Assign a URL like: `https://dev-makhana-udyog-api.onrender.com`

### Step 5: Verify Backend Deployment
Test your API:
```bash
# Check if server is running
curl https://your-render-url.onrender.com/api/products

# Should return JSON with products
```

---

## Ã°Å¸Å’Â PART 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with your GitHub account
3. Authorize Vercel to access repositories

### Step 2: Import Project
1. Click **"Add New..."** Ã¢â€ â€™ **"Project"**
2. Import `dev-makhana-udyog` repository
3. Configure project:

```
Framework Preset: Create React App
Root Directory: ecommerce
Build Command: npm run build
Output Directory: build
Install Command: npm install --legacy-peer-deps
```

### Step 3: Configure Environment Variables

Click **"Environment Variables"** and add:

```bash
# API URL (Use your Render backend URL)
REACT_APP_API_URL=https://your-render-url.onrender.com

# Site Config
REACT_APP_SITE_NAME=Dev Makhana Udyog
REACT_APP_ENV=production

# Stripe (Publishable key only - safe for frontend)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_or_pk_test_for_testing

# Razorpay (Key ID only - safe for frontend)
REACT_APP_RAZORPAY_KEY_ID=rzp_live_your_key_or_rzp_test_for_testing

# Cloudinary
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### Step 4: Deploy
1. Click **"Deploy"**
2. Vercel will:
   - Build your React app
   - Deploy to CDN
   - Assign URL: `https://your-app.vercel.app`
3. Wait 2-5 minutes for deployment

### Step 5: Update Backend CORS
Go back to Render Ã¢â€ â€™ Environment Variables Ã¢â€ â€™ Update:
```
CLIENT_URL=https://your-app.vercel.app
```
Then click **"Manual Deploy"** Ã¢â€ â€™ **"Deploy latest commit"**

---

## Ã°Å¸â€â€ž Update Backend with Frontend URL

After Vercel gives you a URL, update Render:

1. Go to Render dashboard
2. Select your web service
3. Environment Ã¢â€ â€™ Edit `CLIENT_URL`
4. Change to: `https://your-actual-vercel-url.vercel.app`
5. Save changes (auto-redeploys)

---

## Ã°Å¸â€Â IMPORTANT: Production Security Steps

### 1. Use Live Payment Keys (When Ready for Production)
```bash
# Replace test keys with live keys:
STRIPE_SECRET_KEY=sk_live_xxxxx  # Not sk_test_
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx  # Not pk_test_
RAZORPAY_KEY_ID=rzp_live_xxxxx  # Not rzp_test_
```

### 2. Set Up Stripe Webhooks
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://your-render-url.onrender.com/api/payments/stripe/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy signing secret Ã¢â€ â€™ Update `STRIPE_WEBHOOK_SECRET` in Render

### 3. Secure MongoDB
1. Go to MongoDB Atlas Ã¢â€ â€™ Network Access
2. Add Render's IP address (or use `0.0.0.0/0` for any IP - less secure)
3. Database Access Ã¢â€ â€™ Ensure strong password

### 4. Generate Strong JWT Secret
```bash
# Generate a secure random string:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Use this as your JWT_SECRET

---

## Ã°Å¸â€œÅ  Post-Deployment Checklist

### Backend (Render)
- [ ] Server starts without errors (check Logs tab)
- [ ] MongoDB connection successful
- [ ] `/api/products` endpoint returns data
- [ ] Environment variables all set
- [ ] CORS allows your Vercel domain

### Frontend (Vercel)
- [ ] Website loads successfully
- [ ] No console errors (F12 Ã¢â€ â€™ Console)
- [ ] Products display correctly
- [ ] Can add items to cart
- [ ] Login/signup works
- [ ] Payment gateway loads

### Integration Test
- [ ] Create account on live site
- [ ] Add products to cart
- [ ] Go to checkout
- [ ] Test payment with test card:
  - **Stripe:** 4242 4242 4242 4242
  - **CVV:** 123
  - **Expiry:** Any future date
- [ ] Verify order appears in MongoDB
- [ ] Check order confirmation email (if configured)

---

## Ã°Å¸Ââ€º Common Issues & Solutions

### Issue 1: Backend "Application Failed to Respond"
**Solution:**
- Check Render logs for errors
- Verify `PORT` is set to `10000` (or matches Render's port)
- Ensure `npm start` command is correct
- Check MongoDB connection string

### Issue 2: Frontend Can't Connect to Backend
**Solution:**
- Verify `REACT_APP_API_URL` in Vercel matches Render URL
- Check CORS settings in backend
- Ensure `CLIENT_URL` in Render matches Vercel URL
- Redeploy both frontend and backend

### Issue 3: Payment Not Working
**Solution:**
- Check Stripe/Razorpay keys are correct
- Verify keys are for correct environment (test vs live)
- Check browser console for errors
- Ensure webhook secret is configured

### Issue 4: Images Not Loading
**Solution:**
- Check Cloudinary credentials
- Verify image URLs in database
- Check browser network tab for 404s

### Issue 5: MongoDB Connection Fails
**Solution:**
- Check MongoDB Atlas network access (allow Render IP)
- Verify connection string format
- Ensure password has no special characters (or encode them)
- Check MongoDB user permissions

---

## Ã°Å¸â€â€ž How to Update After Deployment

### Update Backend:
1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update: description"
   git push origin main
   ```
3. Render auto-deploys (or click "Manual Deploy")

### Update Frontend:
1. Make changes locally
2. Commit and push to GitHub
3. Vercel auto-deploys (takes 2-3 minutes)

---

## Ã°Å¸â€œË† Monitoring & Maintenance

### Render Dashboard
- **Logs:** View real-time server logs
- **Metrics:** CPU, memory usage
- **Events:** Deployment history

### Vercel Dashboard
- **Deployments:** Build logs, preview URLs
- **Analytics:** Page views, performance
- **Functions:** API usage

### MongoDB Atlas
- **Metrics:** Database performance
- **Alerts:** Set up email alerts
- **Backup:** Enable automatic backups

---

## Ã°Å¸â€™Â° Cost Breakdown

### Free Tier (Perfect for Testing)
- **Render Free:** Ã¢Å“â€¦ Backend hosting (spins down after inactivity)
- **Vercel Free:** Ã¢Å“â€¦ Frontend hosting (100GB bandwidth/month)
- **MongoDB Atlas Free:** Ã¢Å“â€¦ 512MB storage
- **Total:** $0/month

### Production Tier (Recommended)
- **Render Starter:** $7/month (always on, better performance)
- **Vercel Pro:** $20/month (more bandwidth, better support)
- **MongoDB Atlas Shared:** $9/month (2GB storage)
- **Total:** ~$36/month

---

## Ã°Å¸Å½Â¯ Quick Deploy Summary

```bash
# 1. Backend (Render)
- New Web Service Ã¢â€ â€™ Connect GitHub
- Root: ecommerce/server
- Add all environment variables
- Deploy

# 2. Frontend (Vercel)
- Import Project Ã¢â€ â€™ Connect GitHub
- Root: ecommerce
- Add environment variables (including Render URL)
- Deploy

# 3. Update Backend
- Update CLIENT_URL in Render with Vercel URL
- Redeploy

# 4. Test Everything!
```

---

## Ã°Å¸â€ Ëœ Need Help?

### Resources:
- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Atlas:** https://docs.atlas.mongodb.com
- **Stripe Testing:** https://stripe.com/docs/testing

### Support:
- Check deployment logs first
- Review environment variables
- Test API endpoints individually
- Use browser DevTools (F12)

---

## Ã¢Å“â€¦ Success Indicators

Your deployment is successful when:
- Ã¢Å“â€¦ Vercel shows "Building" Ã¢â€ â€™ "Ready"
- Ã¢Å“â€¦ Render shows "Live" status
- Ã¢Å“â€¦ Website loads without errors
- Ã¢Å“â€¦ Can create account and login
- Ã¢Å“â€¦ Products display correctly
- Ã¢Å“â€¦ Payment test succeeds
- Ã¢Å“â€¦ Orders saved in database

---

**Ã°Å¸Å½â€° Your e-commerce platform is now live and ready for customers!**

**Live URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-render-url.onrender.com`
- Admin Panel: `https://your-app.vercel.app/admin-login`

**Default Admin Login:**
- Email: admin@example.com
- Password: admin123
- Ã¢Å¡Â Ã¯Â¸Â **Change this immediately after first login!**
