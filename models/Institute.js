const mongoose = require('mongoose');

const instituteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an institute name'],
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
  },
  affiliation: {
    type: String,
  },
  address: {
    type: String,
    required: [true, 'Please add an address'],
  },
  city: {
    type: String,
    required: [true, 'Please add a city'],
  },
  state: {
    type: String,
    required: [true, 'Please add a state'],
  },
  contactInfo: {
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
    },
  },
  website: {
    type: String,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  facilities: [{
    type: String,
  }],
  courses: [{
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    fees: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
    },
  }],
  media: {
    logo: {
      type: String,
      required: [true, 'Please add a logo'],
    },
    images: [{
      type: String,
    }],
  },
  verified: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Institute', instituteSchema);