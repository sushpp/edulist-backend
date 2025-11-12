const mongoose = require('mongoose');

const instituteSchema = new mongoose.Schema(
  {
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
      required: true,
      trim: true
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      pincode: { type: String, trim: true }
    },
    contact: {
      phone: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
      website: { type: String, trim: true }
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    facilities: [
      {
        name: { type: String, trim: true },
        description: { type: String, trim: true }
      }
    ],
    logo: {
      filename: String,
      originalName: String,
      path: String,
      url: String
    },
    images: [
      {
        filename: String,
        originalName: String,
        path: String,
        url: String,
        isPrimary: {
          type: Boolean,
          default: false
        }
      }
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    verified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model('Institute', instituteSchema);