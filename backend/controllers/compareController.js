const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Property = require('../models/Property');

// @desc    Add property to compare list
// @route   POST /api/compare/:id
// @access  Private
const addToCompare = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  const user = await User.findById(req.user._id);

  if (user.compareProperties.includes(req.params.id)) {
    res.status(400);
    throw new Error('Property already in compare list');
  }

  if (user.compareProperties.length >= 3) {
    res.status(400);
    throw new Error('You can compare at most 3 properties');
  }

  user.compareProperties.push(req.params.id);
  await user.save();

  // Populate so we can return the full documents to frontend
  const populatedUser = await User.findById(req.user._id).populate('compareProperties');

  res.json({
    success: true,
    message: 'Added to compare list',
    data: populatedUser.compareProperties,
  });
});

// @desc    Remove property from compare list
// @route   DELETE /api/compare/:id
// @access  Private
const removeFromCompare = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  user.compareProperties = user.compareProperties.filter(
    (pid) => pid.toString() !== req.params.id
  );

  await user.save();

  const populatedUser = await User.findById(req.user._id).populate('compareProperties');

  res.json({
    success: true,
    message: 'Removed from compare list',
    data: populatedUser.compareProperties,
  });
});

// @desc    Clear compare list completely
// @route   DELETE /api/compare/clear
// @access  Private
const clearCompare = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.compareProperties = [];
  await user.save();

  res.json({
    success: true,
    message: 'Compare list cleared',
    data: [],
  });
});

module.exports = { addToCompare, removeFromCompare, clearCompare };
