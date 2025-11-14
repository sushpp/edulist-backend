// models/Enquiry.js
const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    institute: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ['new','contacted','resolved'], default: 'new' },
    response: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Enquiry', enquirySchema);
