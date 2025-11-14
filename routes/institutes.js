// routes/institutes.js
const express = require("express");
const { auth, adminAuth, instituteAuth } = require("../middleware/auth");
const Institute = require("../models/Institute");
const User = require("../models/User");

const router = express.Router();

/* ===============================
   🔹 PUBLIC ROUTES
================================*/

// Get all approved institutes (Home / Explore)
router.get("/public", async (req, res) => {
  try {
    const { search, category, city, facilities } = req.query;

    let query = { isVerified: true };

    if (search) query.name = { $regex: search, $options: "i" };
    if (category) query.category = category;
    if (city) query["address.city"] = { $regex: city, $options: "i" };
    if (facilities) query["facilities.name"] = { $in: facilities.split(",") };

    const institutes = await Institute.find(query)
      .populate("user", "name email")
      .lean();

    res.json({ success: true, count: institutes.length, institutes });
  } catch (error) {
    console.error("Error fetching public institutes:", error);
    res.status(500).json({ message: "Server error while fetching institutes." });
  }
});

// SAME as /public (for general use)
router.get("/", async (req, res) => {
  try {
    const { search, category, city, facilities } = req.query;

    let query = { isVerified: true };

    if (search) query.name = { $regex: search, $options: "i" };
    if (category) query.category = category;
    if (city) query["address.city"] = { $regex: city, $options: "i" };
    if (facilities) query["facilities.name"] = { $in: facilities.split(",") };

    const institutes = await Institute.find(query)
      .populate("user", "name email")
      .lean();

    res.json({ success: true, count: institutes.length, institutes });
  } catch (error) {
    console.error("Error fetching institutes:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// Public: Get single institute by ID
router.get("/:id", async (req, res) => {
  try {
    const institute = await Institute.findById(req.params.id).populate(
      "user",
      "name email phone"
    );

    if (!institute) {
      return res.status(404).json({
        success: false,
        message: "Institute not found",
      });
    }

    res.json({ success: true, institute });
  } catch (error) {
    console.error("Error fetching institute by ID:", error);
    res.status(500).json({ message: "Server error." });
  }
});

/* ===============================
   🔹 INSTITUTE AUTH ROUTES
================================*/

// Logged-in Institute Profile
router.get("/profile", auth, instituteAuth, async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user._id }).populate(
      "user",
      "name email phone"
    );

    if (!institute) {
      return res.status(404).json({
        success: false,
        message: "Institute profile not found",
      });
    }

    res.json({ success: true, institute });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// Update institute profile
router.put("/profile", auth, instituteAuth, async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user._id });

    if (!institute) {
      return res.status(404).json({
        success: false,
        message: "Institute profile not found",
      });
    }

    const updatedInstitute = await Institute.findByIdAndUpdate(
      institute._id,
      req.body,
      { new: true, runValidators: true }
    ).populate("user", "name email phone");

    res.json({
      success: true,
      message: "Profile updated successfully",
      institute: updatedInstitute,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error." });
  }
});

/* ===============================
   🔹 ADMIN ROUTES
================================*/

// Get all pending institutes (admin)
router.get("/admin/pending", auth, adminAuth, async (req, res) => {
  try {
    const institutes = await Institute.find({ isVerified: false }).populate(
      "user",
      "name email phone createdAt"
    );

    res.json({ success: true, institutes });
  } catch (error) {
    console.error("Error fetching pending institutes:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// Update institute status (Approve / Reject)
router.put("/admin/:id/status", auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Only "approved" or "rejected" allowed.',
      });
    }

    const updateData =
      status === "approved" ? { isVerified: true } : { isVerified: false };

    const institute = await Institute.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("user", "name email");

    res.json({
      success: true,
      message: `Institute ${status} successfully`,
      institute,
    });
  } catch (error) {
    console.error("Error updating institute status:", error);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
