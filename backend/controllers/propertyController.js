const asyncHandler = require('express-async-handler');
const Property = require('../models/Property');

// @desc    Get all properties with optional filters
// @route   GET /api/properties
// @access  Public
const getProperties = asyncHandler(async (req, res) => {
  const {
    location,
    type,
    status,
    minPrice,
    maxPrice,
    bedrooms,
    furnished,
    search,
    page = 1,
    limit = 12,
  } = req.query;

  const query = {};

  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  if (type) {
    query.type = type;
  }

  if (status) {
    query.status = status;
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (bedrooms) {
    query.bedrooms = Number(bedrooms);
  }

  if (furnished) {
    query.furnished = furnished;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { type: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
      { amenities: { $regex: search, $options: 'i' } },
      { listedBy: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Property.countDocuments(query);
  const properties = await Property.find(query)
    .sort({ isFeatured: -1, createdAt: -1, _id: 1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    count: properties.length,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    currentPage: Number(page),
    data: properties,
  });
});

// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
const getPropertyById = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  res.json({ success: true, data: property });
});

// @desc    Get multiple properties by IDs (for comparison)
// @route   POST /api/properties/compare
// @access  Public
const compareProperties = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length < 2) {
    res.status(400);
    throw new Error('Please provide at least 2 property IDs to compare');
  }

  if (ids.length > 3) {
    res.status(400);
    throw new Error('Cannot compare more than 3 properties at once');
  }

  const properties = await Property.find({ _id: { $in: ids } });

  res.json({
    success: true,
    count: properties.length,
    data: properties,
  });
});

module.exports = { getProperties, getPropertyById, compareProperties };
