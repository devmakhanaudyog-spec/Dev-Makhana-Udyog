# Ã°Å¸Å½Â¯ OTP Email Verification & Google OAuth Setup Guide

## Overview
This guide explains how to set up and use the new OTP-based email verification and Google OAuth login features.

---

## Ã°Å¸â€œâ€¹ What's New

### 1. **Email Verification with OTP**
- Users must verify their email via OTP when signing up
- Prevents fake email registrations
- 6-digit OTP valid for 10 minutes
- Rate limiting: max 5 failed attempts
- Resend cooldown: 1 minute between requests

### 2. **Google Login**
- One-click signup/login with Google account
- Auto-creates user from Google profile
- Email auto-verified for Google users
- Seamless experience

---

## Ã°Å¸â€Â§ Backend Setup

### Step 1: Install Dependencies
```bash
cd ecommerce/server
npm install
```

**New packages installed:**
- `google-auth-library` - Verify Google OAuth tokens

### Step 2: Configure Environment Variables

Edit `server/.env` and add:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# OTP Configuration
OTP_EXPIRY_MINUTES=10
MAX_OTP_ATTEMPTS=5

# Email Configuration (Must have for OTP emails)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password
EMAIL_FROM_NAME=Dev Makhana Udyog
```

### Step 3: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project: **Dev Makhana Udyog**
3. Enable **Google+ API**
4. Create OAuth 2.0 credentials (Web Application)
5. Add Authorized redirect URIs:
   - `http://localhost:3000`
   - `http://localhost:3000/auth/google/callback`
   - `https://yourdomain.com` (production)
6. Copy **Client ID** and **Client Secret** to `.env`

### Step 4: Database Migration (Optional)

For existing users with data:
```bash
# Run this in MongoDB
db.users.updateMany(
  {},
  {
    $set: {
      emailVerified: true,
      authMethod: "email",
      googleId: null,
      verificationOtp: null,
      otpExpiresAt: null,
      otpAttempts: 0
    }
  }
)
```

---

## Ã°Å¸Å¡â‚¬ Frontend Setup

### Step 1: Install Dependencies
```bash
cd ecommerce
npm install
```

**New packages installed:**
- `@react-oauth/google` - Google login button component
- `react-otp-input` - OTP input field component

### Step 2: Configure Environment Variables

Create or edit `ecommerce/.env.local`:

```env
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
REACT_APP_API_URL=http://localhost:5000
```

> **Note:** Replace `your-google-client-id` with your actual Google Client ID

### Step 3: Verify Components are Integrated

Check that these files exist:
- Ã¢Å“â€¦ `src/components/OTPVerificationModal.jsx` - OTP input modal
- Ã¢Å“â€¦ `src/pages/Login.jsx` - Updated with Google login button
- Ã¢Å“â€¦ `.env.local` - Environment variables

---

## Ã°Å¸â€œÅ  How It Works

### Signup Flow (with Email Verification)

```
User visits /login
    Ã¢â€ â€œ
Clicks "Sign Up"
    Ã¢â€ â€œ
Fills form (Name, Email, Password, Phone)
    Ã¢â€ â€œ
POST /api/auth/register
    Ã¢â€ â€œ
Backend creates user (emailVerified: false)
Generates 6-digit OTP
Sends OTP email
    Ã¢â€ â€œ
Frontend shows OTP Modal
    Ã¢â€ â€œ
User enters OTP
    Ã¢â€ â€œ
POST /api/auth/verify-otp
    Ã¢â€ â€œ
If correct: Mark email as verified
Returns JWT token
Backend: emailVerified = true
    Ã¢â€ â€œ
User logged in Ã¢Å“â€œ
Redirect to /profile
```

### Google Login Flow

```
User clicks "Sign in with Google"
    Ã¢â€ â€œ
Google popup opens
    Ã¢â€ â€œ
User authenticates
    Ã¢â€ â€œ
Frontend receives Google token
    Ã¢â€ â€œ
POST /api/auth/google-login
    Ã¢â€ â€œ
Backend verifies token
    Ã¢â€ â€œ
User exists?
  YES Ã¢â€ â€™ Update Google info (if needed)
  NO  Ã¢â€ â€™ Create new user
    Ã¢â€ â€œ
Mark email as verified
Return JWT token
    Ã¢â€ â€œ
User logged in Ã¢Å“â€œ
Redirect to /profile
```

---

## Ã°Å¸Â§Âª Testing

### Test 1: Signup with OTP
```
1. Go to http://localhost:3000/login
2. Click "Sign Up"
3. Fill: Name, Email, Password, Phone
4. Click "Sign Up" button
5. See: "OTP sent to your email"
6. Check email for OTP code
7. Enter OTP in modal (6 digits)
8. Should be logged in automatically
9. Redirected to /profile
```

**Expected Results:**
- Ã¢Å“â€¦ Email confirmation modal appears
- Ã¢Å“â€¦ OTP sent to registered email
- Ã¢Å“â€¦ Can enter OTP
- Ã¢Å“â€¦ User verified after correct OTP
- Ã¢Å“â€¦ Logged in and redirected

### Test 2: Resend OTP
```
1. On OTP modal, wait for timer
2. After 1 minute, "Resend OTP" button activates
3. Click "Resend OTP"
4. New OTP sent to email
5. Timer resets to 10 minutes
```

**Expected Results:**
- Ã¢Å“â€¦ Can't resend within 1 minute
- Ã¢Å“â€¦ Can resend after 1 minute
- Ã¢Å“â€¦ New OTP received
- Ã¢Å“â€¦ Timer resets

### Test 3: OTP Validation
```
1. On OTP modal, enter wrong OTP
2. Try 5 times
3. On 5th attempt, see error: "Too many attempts"
4. Click "Resend OTP"
```

**Expected Results:**
- Ã¢Å“â€¦ Invalid OTP shows error
- Ã¢Å“â€¦ Max 5 attempts enforced
- Ã¢Å“â€¦ Must resend to get new OTP

### Test 4: Google Login (New User)
```
1. Go to http://localhost:3000/login
2. Click "Sign in with Google"
3. Select Google account
4. Authorize app
```

**Expected Results:**
- Ã¢Å“â€¦ New user created automatically
- Ã¢Å“â€¦ User logged in
- Ã¢Å“â€¦ Redirected to /profile
- Ã¢Å“â€¦ Name and email populated from Google

### Test 5: Google Login (Existing User)
```
1. Already signed up with email: test@gmail.com
2. Go to http://localhost:3000/login
3. Click "Sign in with Google"
4. Select same Google account
5. Authorize app
```

**Expected Results:**
- Ã¢Å“â€¦ Links Google account to existing user
- Ã¢Å“â€¦ User logged in
- Ã¢Å“â€¦ Email verified if not already
- Ã¢Å“â€¦ No duplicate user created

### Test 6: Email Verification (Traditional Login)
```
Current flow: Sign up Ã¢â€ â€™ OTP verification Ã¢â€ â€™ Login

Traditional flow still works:
1. Login with verified email and password
2. No OTP needed after initial verification
```

---

## Ã°Å¸â€œÂ§ Email Configuration

### Method 1: Gmail (Recommended for Development)

1. Enable 2-factor authentication on Gmail
2. Generate App Password:
   - Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select Mail & Windows Device
   - Copy 16-digit password
3. Add to `.env`:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
   ```

### Method 2: Custom SMTP (Production)

```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASSWORD=your-smtp-password
EMAIL_FROM_NAME=Dev Makhana Udyog
```

---

## Ã°Å¸â€â€™ Security Features

| Feature | Implementation |
|---------|-----------------|
| **Password Hashing** | bcrypt (12-round salt) |
| **OTP Security** | 6-digit random, 10-min expiry |
| **Rate Limiting** | Max 5 OTP attempts |
| **Email Verification** | Prevents fake emails |
| **JWT Tokens** | 30-day expiration |
| **Google Token Validation** | Server-side verification |
| **CORS Protection** | Configured in backend |

---

## Ã°Å¸Å½Â¨ UI Components

### OTP Verification Modal
- Clean, centered modal design
- 6 separate input fields (auto-focus)
- Real-time countdown timer
- Resend button (1-minute cooldown)
- Error messaging
- Mobile responsive

### Google Login Button
- One-click integration
- Branded Google button
- Error handling
- Dark mode support

---

## Ã°Å¸â€œÂ Database Schema Changes

### User Model Updates

Add these fields:
```javascript
{
  emailVerified: Boolean,           // Email confirmed?
  verificationOtp: String,          // 6-digit OTP
  otpExpiresAt: Date,              // When OTP expires
  otpAttempts: Number,             // Failed attempts count
  otpLastSentAt: Date,             // Last OTP send time
  googleId: String,                // Google account ID
  googleEmail: String,             // Email from Google
  googleProfilePicture: String,    // Google profile pic
  authMethod: Enum['email', 'google'] // Login method
}
```

---

## API Endpoints

### User Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/auth/register` | POST | Ã¢ÂÅ’ | Sign up (sends OTP) |
| `/api/auth/verify-otp` | POST | Ã¢ÂÅ’ | Verify OTP & complete signup |
| `/api/auth/resend-otp` | POST | Ã¢ÂÅ’ | Request new OTP |
| `/api/auth/login` | POST | Ã¢ÂÅ’ | Login with email/password |
| `/api/auth/google-login` | POST | Ã¢ÂÅ’ | Google OAuth login |
| `/api/auth/me` | GET | Ã¢Å“â€¦ | Get logged-in user |
| `/api/auth/profile` | GET/PUT | Ã¢Å“â€¦ | Get/update profile |

---

## Ã°Å¸Ââ€º Troubleshooting

### Issue: "OTP not received"
- Check spam folder
- Verify email credentials in `.env`
- Check server logs: `npm run dev`
- Ensure Gmail app password (if using Gmail)

### Issue: "Google login fails - Invalid token"
- Verify Google Client ID in `.env.local`
- Check Google Cloud Console for correct Client ID
- Ensure redirect URIs are configured

### Issue: "Too many login attempts"
- OTP rate limiting: Max 5 wrong attempts
- Wait for 1 minute before requesting new OTP
- Check if cooldown period is enforced

### Issue: User can't login after OTP verification
- Check database: Is `emailVerified: true`?
- Verify token stored in localStorage
- Check browser console for errors

---

## Ã°Å¸Å¡â‚¬ Deployment

### Environment Variables Checklist

**Server (.env):**
- [ ] MONGODB_URI
- [ ] JWT_SECRET (change in production!)
- [ ] GOOGLE_CLIENT_ID
- [ ] GOOGLE_CLIENT_SECRET
- [ ] EMAIL_USER & EMAIL_PASSWORD
- [ ] NODE_ENV=production

**Frontend (.env.production):**
- [ ] REACT_APP_GOOGLE_CLIENT_ID (same as server)
- [ ] REACT_APP_API_URL (your API domain)
- [ ] REACT_APP_STRIPE_PUBLISHABLE_KEY

### Production Checklist

- [ ] Update Google OAuth redirect URIs to production domain
- [ ] Use production email service
- [ ] Change JWT_SECRET to strong random string
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Update database indexes
- [ ] Test all auth flows on production

---

## Ã°Å¸â€œÅ¡ File Structure

```
Backend Changes:
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ server/models/User.js          Ã¢Å“â€¦ Updated (OTP fields)
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ server/routes/auth.js          Ã¢Å“â€¦ Updated (new endpoints)
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ server/middleware/auth.js      Ã¢Å“â€¦ Unchanged
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ server/utils/otpService.js     Ã¢Å“â€¦ Created
Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ server/utils/emailService.js   Ã¢Å“â€¦ Updated

Frontend Changes:
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ src/pages/Login.jsx            Ã¢Å“â€¦ Updated (Google, OTP)
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ src/components/OTPVerificationModal.jsx Ã¢Å“â€¦ Created
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ src/context/AuthContext.jsx    Ã¢Å“â€¦ Unchanged
Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ .env.local                     Ã¢Å“â€¦ Created
```

---

## Ã¢Å“â€¦ Implementation Checklist

- [x] User model updated with OTP fields
- [x] OTP service utility created
- [x] Email service updated with OTP template
- [x] Auth routes added (register, verify-otp, resend-otp, google-login)
- [x] Google OAuth middleware integrated
- [x] OTP Verification Modal component created
- [x] Login page updated with Google button
- [x] Environment variables configured
- [x] NPM packages installed
- [ ] Test signup with OTP flow
- [ ] Test Google login integration
- [ ] Deploy to production

---

## Ã°Å¸Å½â€° Next Steps

1. **Add your Google Client ID** to `.env.local`
2. **Test signup flow** locally
3. **Test Google login** with test account
4. **Deploy** when ready
5. **Monitor** email delivery and auth logs

---

## Ã°Å¸â€œÅ¾ Support

For issues or questions:
- Check troubleshooting section above
- Review error messages in browser console
- Check server logs: `npm run dev`
- Verify all environment variables are set

---

**Status: Ã¢Å“â€¦ Ready for Testing**
