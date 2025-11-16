const Institute = require("../models/Institute");
const User = require("../models/User");
const Review = require("../models/Review");
const Course = require("../models/Course");

// ======================================================
// PUBLIC — Get All Institutes
const getPublicInstitutes = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const search = req.query.search || "";
    const category = req.query.category || "";
    const city = req.query.city || "";
    const rating = Number(req.query.rating) || 0;

    const query = { isVerified: true };
    if (search) query.name = { $regex: search, $options: "i" };
    if (category) query.category = category;
    if (city) query["address.city"] = { $regex: city, $options: "i" };
    if (rating > 0) query.rating = { $gte: rating };

    const total = await Institute.countDocuments(query);

    const institutes = await Institute.find(query)
      .populate("user", "name email")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      institutes,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("❌ getPublicInstitutes error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================================================
// PUBLIC — Featured Institutes
const getFeaturedInstitutes = async (req, res) => {
  try {
    const featured = await Institute.find({ isVerified: true, isFeatured: true })
      .populate("user", "name email")
      .limit(10)
      .sort({ createdAt: -1 })
      .lean(); // ensure it's a plain array

    res.json({ success: true, institutes: featured });
  } catch (err) {
    console.error("❌ getFeaturedInstitutes error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================================================
// PUBLIC — Get Institute By ID
const getInstituteById = async (req, res) => {
  try {
    const inst = await Institute.findById(req.params.id).populate("user", "name email phone");
    if (!inst) return res.status(404).json({ success: false, message: "Institute not found" });
    res.json({ success: true, institute: inst });
  } catch (err) {
    console.error("❌ getInstituteById error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================================================
// INSTITUTE OWNER — Get Profile
const getProfile = async (req, res) => {
  try {
    const inst = await Institute.findOne({ user: req.user._id }).populate("user", "name email phone");
    if (!inst) return res.status(404).json({ success: false, message: "Institute profile not found" });
    res.json({ success: true, institute: inst });
  } catch (err) {
    console.error("❌ getProfile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================================================
// INSTITUTE OWNER — Update Profile
const updateProfile = async (req, res) => {
  try {
    const inst = await Institute.findOne({ user: req.user._id });
    if (!inst) return res.status(404).json({ success: false, message: "Institute not found" });

    const updated = await Institute.findByIdAndUpdate(inst._id, req.body, { new: true, runValidators: true });
    res.json({ success: true, institute: updated });
  } catch (err) {
    console.error("❌ updateProfile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================================================
// ADMIN — Get Pending Institutes
const getPendingInstitutes = async (req, res) => {
  try {
    const pending = await Institute.find({ isVerified: false })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    res.json({ success: true, institutes: pending });
  } catch (err) {
    console.error("❌ getPendingInstitutes error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================================================
// ADMIN — Approve / Reject Institute
const updateInstituteStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) return res.status(400).json({ success: false, message: "Invalid status" });

    const inst = await Institute.findById(req.params.id).populate("user", "email name");
    if (!inst) return res.status(404).json({ success: false, message: "Institute not found" });

    inst.isVerified = status === "approved";
    inst.status = status;
    await inst.save();

    res.json({ success: true, message: `Institute ${status}`, institute: inst });
  } catch (err) {
    console.error("❌ updateInstituteStatus error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================================================
// INSTITUTE — Dashboard Stats (FIXED)
const getInstituteStats = async (req, res) => {
  try {
    // Total counts for dashboard
    const [totalUsers, totalInstitutes, totalCourses, totalReviews] = await Promise.all([
      User.countDocuments(),
      Institute.countDocuments(),
      Course.countDocuments(),
      Review.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalInstitutes,
        totalCourses,
        totalReviews,
      },
    });
  } catch (err) {
    console.error("❌ getInstituteStats error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================================================
// EXPORT ALL CONTROLLERS
module.exports = {
  getPublicInstitutes,
  getFeaturedInstitutes,
  getInstituteById,
  getProfile,
  updateProfile,
  getPendingInstitutes,
  updateInstituteStatus,
  getInstituteStats,
};
