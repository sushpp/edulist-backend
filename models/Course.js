const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institute',
      required: true
    },

    // MAIN TITLE FIELD (You selected Option A)
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

    // IMAGE OBJECT (full metadata)
    image: {
      filename: { type: String },
      originalName: { type: String },
      path: { type: String }
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
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
