const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price cannot be negative'],
    },
    priceLabel: {
      type: String, // e.g. "₹85 Lakhs", "₹1.2 Cr"
      default: '',
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
      trim: true,
    },
    city: {
      type: String,
      default: 'Hyderabad',
    },
    type: {
      type: String,
      enum: ['Apartment', 'Villa', 'Independent House', 'Plot', 'Commercial'],
      required: [true, 'Please specify property type'],
    },
    status: {
      type: String,
      enum: ['For Sale', 'For Rent', 'Sold'],
      default: 'For Sale',
    },
    bedrooms: {
      type: Number,
      required: [true, 'Please add number of bedrooms'],
      min: 0,
    },
    bathrooms: {
      type: Number,
      required: [true, 'Please add number of bathrooms'],
      min: 0,
    },
    area: {
      type: Number, // sq ft
      required: [true, 'Please add area in sq ft'],
      min: 0,
    },
    floor: {
      type: Number,
      default: 0,
    },
    totalFloors: {
      type: Number,
      default: 1,
    },
    parking: {
      type: Boolean,
      default: false,
    },
    furnished: {
      type: String,
      enum: ['Furnished', 'Semi-Furnished', 'Unfurnished'],
      default: 'Unfurnished',
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    listedBy: {
      type: String,
      default: 'PropConnect Agency',
    },
    contactPhone: {
      type: String,
      default: '+91 9876543210',
    },
    yearBuilt: {
      type: Number,
      default: 2020,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Text index for search
propertySchema.index({ title: 'text', location: 'text', description: 'text' });

module.exports = mongoose.model('Property', propertySchema);
