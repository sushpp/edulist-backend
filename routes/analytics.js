const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Institute = require("../models/Institute");
const Review = require("../models/Review");

router.get("/admin-stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInstitutes = await Institute.countDocuments();
    const approvedInstitutes = await Institute.countDocuments({ isVerified: true });
    const pendingInstitutes = await Institute.countDocuments({ isVerified: false });
    const totalReviews = await Review.countDocuments();

    return res.json({
      success: true,
      totalUsers,
      totalInstitutes,
      approvedInstitutes,
      pendingInstitutes,
      totalReviews
    });
  } catch (err) {
    console.error("Analytics Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
