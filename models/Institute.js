// models/Institute.js
const mongoose = require('mongoose');

const instituteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: ['school','college','coaching','preschool','university'], default: 'school' },
    affiliation: { type: String, trim: true, default: '' },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true }
    },
    contact: {
      phone: { type: String, trim: true },
      email: { type: String, trim: true },
      website: { type: String, trim: true }
    },
    description: { type: String, trim: true, default: '' },
    facilities: [{ name: String, description: String }],
    logo: { filename: String, originalName: String, path: String, url: String },
    images: [{ filename: String, originalName: String, path: String, url: String, isPrimary: { type: Boolean, default: false } }],
    status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
    isVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Institute', instituteSchema);
