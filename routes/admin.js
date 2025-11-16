const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Institute = require("../models/Institute");
const Review = require("../models/Review");
const Enquiry = require("../models/Enquiry");

const { auth, isAdmin } = require("../middleware/auth");

// Admin dashboard analytics route
router.get("/dashboard", auth, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInstitutes = await Institute.countDocuments({ isVerified: true });
    const pendingInstitutes = await Institute.countDocuments({ isVerified: false });
    const totalReviews = await Review.countDocuments();
    const totalEnquiries = await Enquiry.countDocuments();

    // Optional recent activity - populate if needed
    const newUsers = await User.find().sort({ createdAt: -1 }).limit(5).select("name email");
    const recentReviews = await Review.find().sort({ createdAt: -1 }).limit(5).populate("user", "name");

    return res.json({
      success: true,
      data: {
        analytics: {
          totalUsers,
          totalInstitutes,
          pendingInstitutes,
          totalReviews,
          totalEnquiries,
        },
        recentActivities: {
          newUsers,
          recentReviews,
        },
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
