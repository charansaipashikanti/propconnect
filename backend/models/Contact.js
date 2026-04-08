const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add your name'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please add your email'],
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    phone: {
      type: String,
      maxlength: [15, 'Phone cannot exceed 15 characters'],
      default: '',
    },
    message: {
      type: String,
      required: [true, 'Please add a message'],
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      default: null,
    },
    propertyTitle: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied'],
      default: 'new',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contact', contactSchema);
