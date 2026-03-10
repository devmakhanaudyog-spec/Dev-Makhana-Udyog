# Password Reset Email - Quick Setup

## ✅ What's Been Implemented

1. **Email Service** - Complete nodemailer integration at `server/utils/emailService.js`
2. **Password Reset Emails** - Professional HTML email templates with 1-hour expiry
3. **Forgot Password Flow** - Updated to send actual emails
4. **Development Mode** - Works with or without email configuration
5. **Admin Password Change** - In Settings tab with secure validation

## 🚀 Quick Start - Gmail Setup (5 minutes)

### Step 1: Get Gmail App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select **Mail** → **Other** → Name it "Makhaantraa App"
3. Click **Generate** and copy the 16-digit code

### Step 2: Configure Server Environment
Edit `ecommerce/server/.env` and add:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM_NAME=Makhaantraa Foods
FRONTEND_URL=http://localhost:3000
```

Replace with your actual Gmail and the 16-digit App Password (spaces optional).

### Step 3: Restart Server
```bash
cd ecommerce
npm run dev
```

You should see: `✅ Email service is ready to send messages`

### Step 4: Test It!
1. Go to http://localhost:3000/forgot-password
2. Enter a registered email address
3. Check your inbox for the reset email

## 📧 Email Features

### Password Reset Email Includes:
- ✉️ Professional HTML design with your branding
- 🔒 Secure reset link valid for 1 hour
- ⚠️ Security warnings and best practices
- 📱 Mobile-responsive design
- 🌐 Works on all email clients

### Additional Features Available:
- Welcome emails for new users
- Order confirmation emails
- Custom notification system

## 🔧 Configuration Options

### For Development (Gmail):
```env
EMAIL_SERVICE=gmail
EMAIL_USER=yourname@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password
```

### For Production (Custom SMTP):
```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-api-key
```

## 🧪 Testing Without Email

If you don't want to configure email right now:

1. The app still works! The reset token is returned in the API response
2. You'll see a warning message with the token
3. Use the token to manually construct the reset URL
4. Perfect for development/testing

## 📖 Full Documentation

See `docs/EMAIL_SETUP_GUIDE.md` for:
- Detailed setup instructions
- Production email providers comparison
- Troubleshooting guide
- Security best practices
- Email service recommendations

## ⚠️ Important Notes

1. **Gmail App Password Required** - Regular Gmail password won't work
2. **2FA Must Be Enabled** - Gmail requires 2-factor authentication for App Passwords
3. **No Spaces in .env** - Remove spaces from the 16-digit password or keep them (both work)
4. **Check Spam Folder** - First few emails might land in spam
5. **Development Only** - Gmail has daily limits (500 emails/day)

## 🎯 Production Recommendations

For production use, consider these professional email services:

| Service | Free Tier | Best For |
|---------|-----------|----------|
| **SendGrid** | 100/day | Getting started |
| **AWS SES** | 62,000/month | High volume |
| **Mailgun** | 5,000/month | Developers |
| **Postmark** | 100/month | Deliverability |

## 🔍 Troubleshooting

### "Invalid login" Error
- Make sure 2FA is enabled on your Google account
- Use App Password, not your Gmail password
- Try removing spaces from the password

### Emails Not Sending
- Check server logs for errors
- Verify all environment variables are set
- Restart the server after changing .env

### Emails in Spam
- This is normal for Gmail in development
- For production, use a professional email service
- Set up SPF/DKIM records for your domain

## ✅ Success Indicators

When everything is working:
- ✅ Server logs show: "Email service is ready to send messages"
- ✅ Forgot password returns success without showing token
- ✅ Emails arrive in inbox within seconds
- ✅ Reset links work correctly

## 🆘 Need Help?

1. Check `docs/EMAIL_SETUP_GUIDE.md` for detailed troubleshooting
2. Verify your Gmail App Password is correct
3. Make sure FRONTEND_URL matches your local development URL
4. Check server console logs for specific errors

---

**Ready to test?** Visit http://localhost:3000/forgot-password and try it out! 🚀
