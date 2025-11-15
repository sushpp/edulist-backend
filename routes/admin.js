const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Institute = require("../models/Institute");
const Review = require("../models/Review");
const Enquiry = require("../models/Enquiry");

router.get("/dashboard", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInstitutes = await Institute.countDocuments({ isVerified: true });
    const pendingInstitutes = await Institute.countDocuments({ isVerified: false });
    const totalReviews = await Review.countDocuments();
    const totalEnquiries = await Enquiry.countDocuments();

    return res.json({
      success: true,
      analytics: {
        totalUsers,
        totalInstitutes,
        pendingInstitutes,
        totalReviews,
        totalEnquiries,
      },
      recentActivities: {
        newUsers: [], // optional
        pendingInstitutes: [], // optional
        recentReviews: [], // optional
      },
    });
  } catch (err) {
    console.error("Dashboard Analytics Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
