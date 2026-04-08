const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Property = require('../models/Property');

// @desc    Get all saved properties for logged-in user
// @route   GET /api/saved
// @access  Private
const getSavedProperties = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('savedProperties');

  res.json({
    success: true,
    count: user.savedProperties.length,
    data: user.savedProperties,
  });
});

// @desc    Save a property to user's list
// @route   POST /api/saved/:id
// @access  Private
const saveProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  const user = await User.findById(req.user._id);

  if (user.savedProperties.includes(req.params.id)) {
    res.status(400);
    throw new Error('Property already saved');
  }

  user.savedProperties.push(req.params.id);
  await user.save();

  res.json({
    success: true,
    message: 'Property saved successfully',
    data: user.savedProperties,
  });
});

// @desc    Remove a property from user's saved list
// @route   DELETE /api/saved/:id
// @access  Private
const unsaveProperty = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  user.savedProperties = user.savedProperties.filter(
    (pid) => pid.toString() !== req.params.id
  );

  await user.save();

  res.json({
    success: true,
    message: 'Property removed from saved list',
    data: user.savedProperties,
  });
});

module.exports = { getSavedProperties, saveProperty, unsaveProperty };
