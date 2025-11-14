// models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    institute: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, default: '' },
    duration: { type: String, default: '' },
    fees: { type: Number, default: 0 },
    imageUrl: { type: String, default: '' },
    facilities: [{ type: String }],
    syllabus: [{ type: String }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
