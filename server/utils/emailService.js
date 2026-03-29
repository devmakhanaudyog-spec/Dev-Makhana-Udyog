const nodemailer = require('nodemailer');

const getFromAddress = () => {
  const fromName = process.env.EMAIL_FROM_NAME || 'Dev Makhana Udyog';
  const fromEmail = process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER;
  return `"${fromName}" <${fromEmail}>`;
};

// Create reusable transporter
const createTransporter = () => {
  const transportDefaults = {
    connectionTimeout: parseInt(process.env.SMTP_CONNECTION_TIMEOUT || '10000', 10),
    greetingTimeout: parseInt(process.env.SMTP_GREETING_TIMEOUT || '10000', 10),
    socketTimeout: parseInt(process.env.SMTP_SOCKET_TIMEOUT || '15000', 10)
  };

  // For development/testing with Gmail or other SMTP
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      ...transportDefaults,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
      }
    });
  }

  // For production with custom SMTP
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    ...transportDefaults,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      servername: process.env.SMTP_HOST || 'smtp.gmail.com'
    }
  });
};

// Send password reset email
const sendPasswordResetEmail = async (to, resetToken, userName = 'User') => {
  try {
    const transporter = createTransporter();
    
    // Get frontend URL from environment or use default
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: getFromAddress(),
      to: to,
      subject: 'Password Reset Request - Dev Makhana Udyog',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .button { display: inline-block; padding: 14px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .button:hover { background: #059669; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #6b7280; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .token-box { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; font-family: monospace; word-break: break-all; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">ðŸ” Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${userName}</strong>,</p>
              
              <p>We received a request to reset your password for your Dev Makhana Udyog account. If you didn't make this request, you can safely ignore this email.</p>
              
              <p>To reset your password, click the button below:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <div class="token-box">
                ${resetUrl}
              </div>
              
              <div class="warning">
                <strong>âš ï¸ Security Notice:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>This link will expire in <strong>1 hour</strong></li>
                  <li>Only use this link if you requested a password reset</li>
                  <li>Never share this link with anyone</li>
                </ul>
              </div>
              
              <p>If you didn't request a password reset, please ignore this email or contact our support team if you have concerns about your account security.</p>
              
              <p>Best regards,<br><strong>Dev Makhana Udyog Team</strong></p>
            </div>
            <div class="footer">
              <p>This email was sent to ${to}</p>
              <p>Â© ${new Date().getFullYear()} Dev Makhana Udyog. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hello ${userName},

We received a request to reset your password for your Dev Makhana Udyog account.

To reset your password, visit this link:
${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email.

Best regards,
Dev Makhana Udyog Team
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('âœ… Email service is ready to send messages');
    return true;
  } catch (error) {
    console.error('âŒ Email service configuration error:', error.message);
    return false;
  }
};

// Send welcome email (optional feature)
const sendWelcomeEmail = async (to, userName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: getFromAddress(),
      to: to,
      subject: 'Welcome to Dev Makhana Udyog! ðŸŽ‰',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Welcome to Dev Makhana Udyog! ðŸŽ‰</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${userName}</strong>,</p>
              <p>Thank you for joining Dev Makhana Udyog! We're excited to have you as part of our community.</p>
              <p>Explore our premium quality makhana products and enjoy a healthy snacking experience.</p>
              <p>If you have any questions, feel free to reach out to our support team.</p>
              <p>Happy shopping!<br><strong>Dev Makhana Udyog Team</strong></p>
            </div>
            <div class="footer">
              <p>Â© ${new Date().getFullYear()} Dev Makhana Udyog. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', to);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome emails - they're not critical
    return { success: false, error: error.message };
  }
};

// Send OTP email for email verification
const sendOTPEmail = async (to, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: getFromAddress(),
      to: to,
      subject: 'Verify Your Email - Dev Makhana Udyog OTP',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #6b7280; }
            .otp-box { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 30px; text-align: center; border-radius: 8px; margin: 20px 0; border: 2px solid #10b981; }
            .otp-code { font-family: 'Courier New', monospace; font-size: 48px; font-weight: bold; color: #059669; letter-spacing: 10px; margin: 10px 0; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .timer { color: #dc2626; font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">âœ‰ï¸ Email Verification</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              
              <p>Thank you for signing up with Dev Makhana Udyog! To complete your registration, please verify your email address using the OTP (One-Time Password) below:</p>
              
              <div class="otp-box">
                <p style="margin: 0; color: #666;">Your verification code is:</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0; color: #666; font-size: 14px;">Valid for <span class="timer">10 minutes</span></p>
              </div>
              
              <div class="warning">
                <strong>âš ï¸ Important:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Never share this OTP with anyone</li>
                  <li>This code will expire in 10 minutes</li>
                  <li>You can request a new OTP if needed</li>
                  <li>If you didn't request this, please ignore this email</li>
                </ul>
              </div>
              
              <p style="color: #666; font-size: 14px;">Enter this code in the verification form on our website to complete your registration.</p>
              
              <p>If you have any trouble, please contact our support team.</p>
              
              <p>Best regards,<br><strong>Dev Makhana Udyog Team</strong></p>
            </div>
            <div class="footer">
              <p>This email was sent to ${to}</p>
              <p>Â© ${new Date().getFullYear()} Dev Makhana Udyog. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Verify Your Email - Dev Makhana Udyog

Hello,

Thank you for signing up! Your OTP is:

${otp}

This code is valid for 10 minutes only.

Never share this OTP with anyone. If you didn't request this, please ignore this email.

Best regards,
Dev Makhana Udyog Team
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

// Send contact form email to support
const sendContactEmail = async (contact) => {
  try {
    const transporter = createTransporter();
    const receiver = process.env.CONTACT_RECEIVER || process.env.EMAIL_USER || 'devmakhanaudyog@gmail.com';

    const mailOptions = {
      from: getFromAddress(),
      to: receiver,
      replyTo: contact.email,
      subject: `Contact Form: ${contact.subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; }
            .label { font-weight: bold; }
            .box { background: #f9fafb; padding: 12px; border-radius: 6px; margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">New Contact Message</h2>
            </div>
            <div class="content">
              <p><span class="label">Name:</span> ${contact.name}</p>
              <p><span class="label">Email:</span> ${contact.email}</p>
              <p><span class="label">Phone:</span> ${contact.phone}</p>
              <p><span class="label">Subject:</span> ${contact.subject}</p>
              <div class="box">${contact.message}</div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
New Contact Message

Name: ${contact.name}
Email: ${contact.email}
Phone: ${contact.phone}
Subject: ${contact.subject}

${contact.message}
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Contact email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending contact email:', error);
    throw error;
  }
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (to, orderDetails) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: getFromAddress(),
      to: to,
      subject: `Order Confirmation - #${orderDetails.orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #6b7280; }
            .order-box { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Order Confirmed! ðŸŽ‰</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${orderDetails.customerName}</strong>,</p>
              <p>Thank you for your order! We've received your order and it's being processed.</p>
              <div class="order-box">
                <h3>Order Details:</h3>
                <p><strong>Order ID:</strong> #${orderDetails.orderId}</p>
                <p><strong>Total Amount:</strong> â‚¹${orderDetails.totalAmount}</p>
                <p><strong>Status:</strong> ${orderDetails.status}</p>
              </div>
              <p>We'll send you another email when your order ships.</p>
              <p>Thank you for choosing Dev Makhana Udyog!</p>
              <p>Best regards,<br><strong>Dev Makhana Udyog Team</strong></p>
            </div>
            <div class="footer">
              <p>Â© ${new Date().getFullYear()} Dev Makhana Udyog. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent to:', to);
    return { success: true };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendOTPEmail,
  sendContactEmail,
  sendOrderConfirmationEmail,
  verifyEmailConfig
};
