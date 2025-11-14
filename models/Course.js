const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institute',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: String,
      required: true
    },
    fees: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    // Store uploaded image metadata
    image: {
      filename: { type: String },
      originalName: { type: String },
      path: { type: String },
      url: { type: String }
    },
    facilities: [
      {
        type: String,
        trim: true
      }
    ],
    eligibility: {
      type: String,
      trim: true
    },
    syllabus: [
      {
        type: String,
        trim: true
      }
    ]
  },
  {
    timestamps: true // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('Course', courseSchema);
