const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { sendContactEmail } = require('../utils/emailService');

// Submit contact form
router.post('/submit', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate input
    if (!name || !email || !subject || !message || !phone) {
      return res.status(400).json({ error: 'Name, email, phone, subject, and message are required' });
    }

    // Create contact message
    const contact = await Contact.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      subject: subject.trim(),
      message: message.trim(),
      status: 'new'
    });

    try {
      await sendContactEmail(contact);
    } catch (emailError) {
      console.error('Contact email send failed:', emailError);
      return res.status(500).json({ error: 'Message saved but email delivery failed. Please try again later.' });
    }

    res.status(201).json({
      message: 'Your message has been received. We will respond soon!',
      contact
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get contact messages (for logged in users to see their own)
router.get('/:email', async (req, res) => {
  try {
    const messages = await Contact.find({ email: req.params.email.toLowerCase() }).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
