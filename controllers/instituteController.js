// controllers/instituteController.js

const Institute = require("../models/Institute");
const User = require("../models/User");
const Course = require("../models/Course");
const Review = require("../models/Review");

// ======================================================
// ✅ PUBLIC — Get All Institutes (Homepage / Listing Page)
// ======================================================
exports.getAllInstitutes = async (req, res) => {
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

    return res.json({
      success: true,
      institutes,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("❌ Error fetching institutes:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================================================
// ✅ INSTITUTE OWNER — Create Institute
// ======================================================
exports.createInstitute = async (req, res) => {
  try {
    const existing = await Institute.findOne({ user: req.user._id });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Institute already exists" });

    const payload = {
      ...req.body,
      user: req.user._id,
      isVerified: false,
      status: "pending",
    };

    const inst = await Institute.create(payload);

    res.status(201).json({ success: true, institute: inst });
  } catch (err) {
    console.error("❌ institute.create error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================================================
// ✅ PUBLIC — Get Institute By ID
// ======================================================
exports.getById = async (req, res) => {
  try {
    const inst = await Institute.findById(req.params.id).populate(
      "user",
      "name email phone"
    );

    if (!inst)
      return res
        .status(404)
        .json({ success: false, message: "Institute not found" });

    res.json({ success: true, institute: inst });
  } catch (err) {
    console.error("❌ institute.getById error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================================================
// ✅ INSTITUTE OWNER — Get Profile
// ======================================================
exports.getProfile = async (req, res) => {
  try {
    const inst = await Institute.findOne({ user: req.user._id }).populate(
      "user",
      "name email phone"
    );

    if (!inst)
      return res
        .status(404)
        .json({ success: false, message: "Institute profile not found" });

    res.json({ success: true, institute: inst });
  } catch (err) {
    console.error("❌ institute.getProfile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================================================
// ✅ INSTITUTE OWNER — Update Profile
// ======================================================
exports.updateProfile = async (req, res) => {
  try {
    const inst = await Institute.findOne({ user: req.user._id });
    if (!inst)
      return res
        .status(404)
        .json({ success: false, message: "Institute not found" });

    const updated = await Institute.findByIdAndUpdate(inst._id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, institute: updated });
  } catch (err) {
    console.error("❌ institute.updateProfile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================================================
// ✅ ADMIN — Get Pending Institutes
// ======================================================
exports.getPending = async (req, res) => {
  try {
    const pending = await Institute.find({ isVerified: false })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, institutes: pending });
  } catch (err) {
    console.error("❌ institute.getPending error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================================================
// ✅ ADMIN — Approve / Reject Institute
// ======================================================
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body; // approved / rejected
    if (!["approved", "rejected"].includes(status))
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });

    const inst = await Institute.findById(req.params.id).populate(
      "user",
      "email name"
    );

    if (!inst)
      return res
        .status(404)
        .json({ success: false, message: "Institute not found" });

    inst.isVerified = status === "approved";
    inst.status = status;
    await inst.save();

    res.json({
      success: true,
      message: `Institute ${status}`,
      institute: inst,
    });
  } catch (err) {
    console.error("❌ institute.updateStatus error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================================================
// ✅ INSTITUTE OWNER — Dashboard Stats
// ======================================================
exports.getStats = async (req, res) => {
  try {
    const inst = await Institute.findOne({ user: req.user._id });
    if (!inst)
      return res
        .status(404)
        .json({ success: false, message: "Institute not found" });

    const [reviewsCount, coursesCount] = await Promise.all([
      Review.countDocuments({ institute: inst._id }),
      Course.countDocuments({ institute: inst._id }),
    ]);

    res.json({
      success: true,
      data: {
        reviews: reviewsCount,
        courses: coursesCount,
      },
    });
  } catch (err) {
    console.error("❌ institute.getStats error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
