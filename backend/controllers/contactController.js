const asyncHandler = require('express-async-handler');
const Contact = require('../models/Contact');

// @desc    Submit a contact enquiry
// @route   POST /api/contact
// @access  Public
const submitContact = asyncHandler(async (req, res) => {
  const { name, email, phone, message, propertyId, propertyTitle } = req.body;

  if (!name || !email || !message) {
    res.status(400);
    throw new Error('Please provide name, email, and message');
  }

  const contact = await Contact.create({
    name,
    email,
    phone: phone || '',
    message,
    propertyId: propertyId || null,
    propertyTitle: propertyTitle || '',
  });

  res.status(201).json({
    success: true,
    message: 'Your enquiry has been submitted. We will get back to you shortly.',
    data: contact,
  });
});

// @desc    Get all contact submissions (admin)
// @route   GET /api/contact
// @access  Private (can be restricted to admin in the future)
const getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({})
    .populate('propertyId', 'title location')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: contacts.length,
    data: contacts,
  });
});

module.exports = { submitContact, getContacts };
