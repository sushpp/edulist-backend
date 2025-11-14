const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
    name: { type: String, required: true },
    description: String,
    duration: String,
    fees: Number,
    mode: { type: String, enum: ["online", "offline", "hybrid"], default: "offline" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
