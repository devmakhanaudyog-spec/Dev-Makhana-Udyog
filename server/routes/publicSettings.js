const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// Public settings endpoint for customer-facing pages
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    const {
      whatsappNumber,
      maintenanceMode,
      maintenanceMessage,
      companyPhone,
      companyEmail,
      socialLinks,
      shippingCost,
      taxPercentage,
      specialDiscountPercentage,
      currencyCode,
      heroImage
    } = settings;
    res.json({
      whatsappNumber,
      maintenanceMode,
      maintenanceMessage,
      companyPhone,
      companyEmail,
      socialLinks,
      shippingCost,
      taxPercentage,
      specialDiscountPercentage,
      currencyCode,
      heroImage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
