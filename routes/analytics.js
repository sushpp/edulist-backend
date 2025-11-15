const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Institute = require("../models/Institute");
const Review = require("../models/Review");
const { auth, adminAuth } = require("../middleware/auth");

// Admin panel analytics route
router.get("/admin-stats", auth, adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      totalInstitutes,
      approvedInstitutes,
      pendingInstitutes,
      totalReviews
    ] = await Promise.all([
      User.countDocuments({ role: "user" }) || 0,
      Institute.countDocuments() || 0,
      Institute.countDocuments({ isVerified: true }) || 0,
      Institute.countDocuments({ isVerified: false }) || 0,
      Review.countDocuments() || 0
    ]);

    return res.json({
      totalUsers,
      totalInstitutes,
      approvedInstitutes,
      pendingInstitutes,
      totalReviews
    });
  } catch (err) {
    console.error("⚠️ Analytics Error:", err.message);
    return res.status(500).json({
      message: "Failed to fetch analytics",
      error: err.message
    });
  }
});

module.exports = router;
