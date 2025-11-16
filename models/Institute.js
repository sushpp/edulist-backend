// models/Institute.js
const mongoose = require('mongoose');

const instituteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, enum: ['school','college','coaching','preschool','university'], default: 'school' },
  affiliation: { type: String, trim: true, default: '' },
  address: { street: String, city: String, state: String, pincode: String },
  contact: { phone: String, email: String, website: String },
  description: { type: String, default: '' },
  facilities: [{ name: String, description: String }],
  logo: { filename: String, originalName: String, path: String, url: String },
  images: [{ filename: String, originalName: String, path: String, url: String, isPrimary: { type: Boolean, default: false } }],
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  isVerified: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false }
}, { 
  timestamps: true // This automatically adds `createdAt` and `updatedAt` fields
});

// --- FIXES: Add indexes for performance ---

// 1. Index for finding pending institutes quickly.
instituteSchema.index({ isVerified: 1 });

// 2. Compound index for fetching featured institutes efficiently.
// This is much faster than two separate indexes for this specific query.
instituteSchema.index({ isFeatured: 1, isVerified: 1 });

// 3. Index for sorting institutes by creation date.
instituteSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Institute', instituteSchema);