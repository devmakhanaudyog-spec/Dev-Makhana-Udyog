# 🚀 Deployment Fix - Render Environment Variables

## Issue
Deployment failed because `ADMIN_PASSWORD` environment variable was missing on Render.

**Error:**
```
Error: Missing required env vars in production: ADMIN_PASSWORD
```

---

## ✅ What Was Fixed

### 1. **Server Configuration** (`server/server.js`)
- Made `ADMIN_PASSWORD` and `ADMIN_EMAIL` optional in production
- Now only requires `JWT_SECRET` and `MONGO_URI` (critical variables)
- Logs warning if admin credentials not configured, but continues startup

### 2. **Google OAuth** (`server/routes/auth.js`)
- Made Google OAuth Client initialization optional
- Gracefully handles missing `GOOGLE_CLIENT_ID`
- Returns 503 error (Service Unavailable) if Google login not configured
- Logs warning message but doesn't crash server

### 3. **Rate Limiting** (Optional improvement)
- Server now starts even if optional features aren't configured
- Admins can still manage users via Google OAuth or database directly

---

## 📋 Required Environment Variables for Render

### **CRITICAL** (Must have):
```env
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=production
PORT=5000
```

### **Optional** (Good to have):
```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure-admin-password
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password
```

---

## 🔧 How to Set Environment Variables on Render

### Step 1: Go to Render Dashboard
1. Log in to https://dashboard.render.com
2. Select your service: **Makhaantraa Foods Backend**
3. Click **Settings**

### Step 2: Environment Variables
1. Go to **Environment** tab
2. Add variables one by one or paste all at once

**Minimum to add:**
```
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
NODE_ENV=production
PORT=5000
```

**Optional (for full features):**
```
ADMIN_EMAIL=admin@makhaantraa.com
ADMIN_PASSWORD=<secure-password>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-secret>
EMAIL_USER=<gmail-for-otp@gmail.com>
EMAIL_PASSWORD=<16-digit-app-password>
```

### Step 3: Save and Redeploy
1. Click **Save** (or auto-saves)
2. Render will automatically redeploy
3. Check deployment logs: Should say "🎉 Build successful"

---

## 📊 Startup Behavior

### With All Variables Configured ✅
```
✅ Server running on port 5000
✅ Database connected
✅ Email service ready
✅ Google OAuth configured
✅ Admin login available
```

### With Only Critical Variables ⚠️
```
✅ Server running on port 5000
✅ Database connected
⚠️  Email service not configured (OTP emails won't work)
⚠️  Google OAuth not configured (Google login disabled)
⚠️  Admin login not configured (use Google OAuth instead)
```

### Missing Critical Variables ❌
```
❌ Server crashes with error
❌ MONGO_URI or JWT_SECRET missing
❌ Must set these before deployment works
```

---

## 🧪 Test Deployment

After setting variables and deploying:

### Test 1: Server Health
```bash
curl https://your-render-domain/api/health
```

**Expected:** 200 OK

### Test 2: Check if Features Work
```bash
# Test signup with OTP
curl -X POST https://your-render-domain/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"test123","phone":"9876543210"}'
```

**Expected:** 201 with `requiresOTP: true` and email sent

### Test 3: Login
```bash
curl -X POST https://your-render-domain/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

**Expected:** 200 with JWT token (if admin configured)

---

## 🔐 Security Tips

**For Production:**
1. ✅ Use strong `JWT_SECRET` (32+ characters)
2. ✅ Use strong `ADMIN_PASSWORD` (12+ characters)
3. ✅ Never commit `.env` file to git
4. ✅ Use Render's encrypted environment variables
5. ✅ Rotate secrets periodically
6. ✅ Use Gmail app password, not regular password

---

## ❌ What If Still Failing?

### Check 1: Verify Variables Are Set
Go to Render > Settings > Environment
- Confirm all required variables show as blurred dots (✓ set)
- Click on variable to see it was actually saved

### Check 2: Check Deployment Logs
1. Go to Render > Service > Logs
2. Look for warning/error messages
3. Search for "Error:" in logs

### Check 3: Common Issues

**Issue:** `Cannot find module 'google-auth-library'`
- **Solution:** Run `npm install` in server folder
- Backend dependencies might not be installed

**Issue:** `ECONNREFUSED` for MongoDB
- **Solution:** Check `MONGO_URI` is correct
- Verify IP whitelist on MongoDB Atlas

**Issue:** Email not sending
- **Solution:** Check Gmail app password (16 digits)
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` match

---

## 📝 Quick Checklist Before Deployment

- [ ] All files committed to git
- [ ] `server/.env` NOT committed (it's in .gitignore)
- [ ] Render environment variables set:
  - [ ] `MONGO_URI`
  - [ ] `JWT_SECRET`
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=5000`
- [ ] Optional:
  - [ ] `ADMIN_EMAIL` & `ADMIN_PASSWORD`
  - [ ] `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`
  - [ ] `EMAIL_USER` & `EMAIL_PASSWORD`
- [ ] Re-deployed service after adding variables
- [ ] Checked deployment logs for errors
- [ ] Tested /api/health endpoint

---

## 🚀 Next Steps

1. **Set these on Render:**
   ```
   MONGO_URI=
   JWT_SECRET=
   NODE_ENV=production
   PORT=5000
   ```

2. **Wait for auto-redeploy** (2-3 minutes)

3. **Check logs** - Should say ✅ Build successful

4. **Test endpoint:**
   ```bash
   curl https://your-domain/api/health
   ```

---

## 📞 Troubleshooting

Still having issues? Check:

1. ✅ All 4 critical variables set
2. ✅ Variables saved (reload page to confirm)
3. ✅ Service re-deployed after adding variables
4. ✅ Check deployment logs for actual error messages
5. ✅ No typos in variable names or values

---

**Status: ✅ FIXED & READY TO DEPLOY**

Your server will now start successfully even if optional features (admin login, Google OAuth, email) aren't fully configured.
