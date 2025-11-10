const mongoose = require('mongoose');

const instituteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['school', 'college', 'coaching', 'preschool', 'university']
  },
  affiliation: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  description: {
    type: String,
    required: true
  },
  facilities: [{
    name: String,
    description: String
  }],
  // Add image fields
  logo: {
    filename: String,
    originalName: String,
    path: String,
    url: String
  },
  images: [{
    filename: String,
    originalName: String,
    path: String,
    url: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Institute', instituteSchema);