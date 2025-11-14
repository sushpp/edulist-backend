const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    rating: { type: Number, required: true },
    reviewText: { type: String },

    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },

    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },

    isActive: { type: Boolean, default: true },
    adminApproval: { type: Boolean, default: false },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
