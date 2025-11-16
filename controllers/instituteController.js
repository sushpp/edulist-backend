const Institute = require("../models/Institute");
const Review = require("../models/Review");
const Course = require("../models/Course");

// --------------------
// PUBLIC ROUTES
// --------------------
const getPublicInstitutes = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const search = req.query.search || "";
    const category = req.query.category || "";
    const city = req.query.city || "";

    const query = { isVerified: true };
    if (search) query.name = { $regex: search, $options: "i" };
    if (category) query.category = category;
    if (city) query["address.city"] = { $regex: city, $options: "i" };

    const total = await Institute.countDocuments(query);

    const institutes = await Institute.find(query)
      .populate("user", "name email")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({ success: true, institutes, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("getPublicInstitutes error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getFeaturedInstitutes = async (req, res) => {
  try {
    const featured = await Institute.find({ isVerified: true, isFeatured: true })
      .populate("user", "name email")
      .limit(10)
      .sort({ createdAt: -1 });

    res.json({ success: true, institutes: featured });
  } catch (err) {
    console.error("getFeaturedInstitutes error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getInstituteById = async (req, res) => {
  try {
    const inst = await Institute.findById(req.params.id).populate("user", "name email phone");
    if (!inst) return res.status(404).json({ success: false, message: "Institute not found" });
    res.json({ success: true, institute: inst });
  } catch (err) {
    console.error("getInstituteById error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------
// INSTITUTE OWNER ROUTES
// --------------------
const getProfile = async (req, res) => {
  try {
    const inst = await Institute.findOne({ user: req.user._id }).populate("user", "name email phone");
    if (!inst) return res.status(404).json({ success: false, message: "Institute profile not found" });
    res.json({ success: true, institute: inst });
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const inst = await Institute.findOne({ user: req.user._id });
    if (!inst) return res.status(404).json({ success: false, message: "Institute not found" });

    const updated = await Institute.findByIdAndUpdate(inst._id, req.body, { new: true, runValidators: true });
    res.json({ success: true, institute: updated });
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Dashboard stats
const getInstituteStats = async (req, res) => {
  try {
    const inst = await Institute.findById(req.params.id || req.user._id);
    if (!inst) return res.status(404).json({ success: false, message: "Institute not found" });

    const reviewsCount = await Review.countDocuments({ institute: inst._id });
    const coursesCount = await Course.countDocuments({ institute: inst._id });

    res.json({ success: true, data: { reviews: reviewsCount, courses: coursesCount } });
  } catch (err) {
    console.error("getInstituteStats error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------
// ADMIN ROUTES
// --------------------
const getPendingInstitutes = async (req, res) => {
  try {
    const pending = await Institute.find({ isVerified: false })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    res.json({ success: true, institutes: pending });
  } catch (err) {
    console.error("getPendingInstitutes error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateInstituteStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) return res.status(400).json({ success: false, message: "Invalid status" });

    const inst = await Institute.findById(req.params.id).populate("user", "name email");
    if (!inst) return res.status(404).json({ success: false, message: "Institute not found" });

    inst.status = status;
    inst.isVerified = status === "approved";
    await inst.save();

    res.json({ success: true, message: `Institute ${status}`, institute: inst });
  } catch (err) {
    console.error("updateInstituteStatus error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------
// EXPORT
// --------------------
module.exports = {
  getPublicInstitutes,
  getFeaturedInstitutes,
  getInstituteById,
  getProfile,
  updateProfile,
  getInstituteStats,
  getPendingInstitutes,
  updateInstituteStatus
};
