# Email Configuration Guide

## Overview
The application now supports sending password reset emails and other notifications. This guide will help you set up email functionality.

## Quick Setup for Gmail (Recommended for Development)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to **Security**
3. Enable **2-Step Verification** if not already enabled

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select app: **Mail**
3. Select device: **Other (Custom name)** → Type: "Makhaantraa Foods App"
4. Click **Generate**
5. Copy the 16-digit password (remove spaces)

### Step 3: Configure Environment Variables
Add these to your `server/.env` file:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password
EMAIL_FROM_NAME=Makhaantraa Foods
FRONTEND_URL=http://localhost:3000
```

Replace:
- `your-email@gmail.com` with your Gmail address
- `your-16-digit-app-password` with the App Password from Step 2

### Step 4: Test Email Configuration
Restart your server and try the forgot password feature!

---

## Production Setup with Custom SMTP

For production, you can use services like SendGrid, Mailgun, or AWS SES.

### Example: SendGrid
```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM_NAME=Makhaantraa Foods
FRONTEND_URL=https://your-production-domain.com
```

### Example: Mailgun
```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-mailgun-username
EMAIL_PASSWORD=your-mailgun-password
EMAIL_FROM_NAME=Makhaantraa Foods
FRONTEND_URL=https://your-production-domain.com
```

### Example: AWS SES
```env
EMAIL_SERVICE=smtp
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-ses-smtp-username
EMAIL_PASSWORD=your-ses-smtp-password
EMAIL_FROM_NAME=Makhaantraa Foods
FRONTEND_URL=https://your-production-domain.com
```

---

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `EMAIL_SERVICE` | Email service type (`gmail` or `smtp`) | Yes | - |
| `EMAIL_USER` | Email address to send from | Yes | - |
| `EMAIL_PASSWORD` | Email password or App Password | Yes | - |
| `EMAIL_FROM_NAME` | Display name for outgoing emails | No | "Makhaantraa Foods" |
| `SMTP_HOST` | SMTP server hostname | Yes (for smtp) | "smtp.gmail.com" |
| `SMTP_PORT` | SMTP server port | No | 587 |
| `SMTP_SECURE` | Use SSL/TLS (true for port 465) | No | false |
| `FRONTEND_URL` | Your frontend application URL | Yes | "http://localhost:3000" |

---

## Features Enabled

Once email is configured, the following features will work:

### ✅ Password Reset
- Users can request password reset from login page
- They receive an email with a secure reset link
- Link expires after 1 hour

### ✅ Welcome Emails (Optional)
- New users receive welcome emails on registration
- Can be enabled in the registration route

### ✅ Order Confirmations (Optional)
- Customers receive order confirmation emails
- Can be integrated with order creation

---

## Testing Email Configuration

### Method 1: Use the Forgot Password Feature
1. Go to `/forgot-password`
2. Enter a registered email address
3. Check your inbox for the reset email

### Method 2: Test via API
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Method 3: Verify Email Config in Server Logs
When the server starts, you should see:
```
✅ Email service is ready to send messages
```

If you see an error:
```
❌ Email service configuration error: [error details]
```

---

## Troubleshooting

### Issue: "Invalid login: 535-5.7.8 Username and Password not accepted"
**Solution:** 
- Make sure 2FA is enabled on your Google account
- Use an App Password, not your regular Gmail password
- Remove any spaces from the 16-digit App Password

### Issue: "self signed certificate in certificate chain"
**Solution:**
Add to your environment variables:
```env
NODE_TLS_REJECT_UNAUTHORIZED=0
```
⚠️ Only use this in development! For production, fix SSL certificates properly.

### Issue: Emails go to spam
**Solutions:**
- Use a professional email service (SendGrid, Mailgun, AWS SES)
- Set up SPF, DKIM, and DMARC records for your domain
- Use a verified sending domain
- Avoid spam trigger words in email content

### Issue: "Connection timeout"
**Solution:**
- Check if your firewall/antivirus is blocking port 587
- Try port 465 with `SMTP_SECURE=true`
- Verify SMTP host is correct

### Issue: Emails not sending but no error
**Solution:**
- Check server logs for details
- Verify EMAIL_USER matches the email you're sending from
- Make sure FRONTEND_URL is correct for your environment

---

## Testing Without Email (Development)

If you don't want to set up email immediately, the application will still work:

1. When a password reset is requested, the reset token will be returned in the API response
2. Console logs will show the reset link
3. You can manually construct the reset URL: `http://localhost:3000/reset-password/{token}`

Example response when email is not configured:
```json
{
  "message": "Password reset initiated...",
  "success": true,
  "resetToken": "abc123...",
  "warning": "Email service may not be configured..."
}
```

---

## Security Best Practices

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use App Passwords** - Don't use your main Gmail password
3. **Rotate credentials** - Change passwords/API keys periodically
4. **Use environment-specific configs** - Different credentials for dev/staging/production
5. **Monitor email usage** - Watch for unusual activity or rate limit errors
6. **Enable rate limiting** - Prevent abuse of email sending features

---

## Production Checklist

- [ ] Email service is configured with production credentials
- [ ] `FRONTEND_URL` points to production domain
- [ ] `EMAIL_FROM_NAME` is set appropriately
- [ ] SPF/DKIM records are configured for your domain
- [ ] Rate limiting is enabled for forgot-password endpoint
- [ ] Email templates are tested and look good
- [ ] Monitoring/alerts are set up for email delivery failures
- [ ] Backup email provider is configured (optional)

---

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Test email configuration using the verification method
3. Ensure all required environment variables are set
4. Review Gmail's App Password setup guide: https://support.google.com/accounts/answer/185833

## Email Service Providers Comparison

| Provider | Free Tier | Pros | Cons |
|----------|-----------|------|------|
| Gmail | 500/day | Easy setup, reliable | Not for production scale |
| SendGrid | 100/day | Great deliverability, analytics | Requires verification |
| Mailgun | 5,000/month | Good API, affordable | Complex setup |
| AWS SES | 62,000/month (free tier) | Very cheap, scalable | AWS account required |
| Postmark | 100/month | Excellent deliverability | More expensive |

---

**Last Updated:** February 2026
