const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    totalVisitors: { type: Number, default: 0 },
    dailyViews: [
      {
        date: String,
        count: Number,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Analytics", analyticsSchema);
