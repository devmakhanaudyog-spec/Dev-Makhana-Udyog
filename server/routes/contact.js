const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// Submit contact form - saves message to database for admin portal
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

    res.status(201).json({
      message: 'Your message has been received. Our team will review it shortly!',
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
