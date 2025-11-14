const mongoose = require("mongoose");

const facilitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    icon: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Facility", facilitySchema);
