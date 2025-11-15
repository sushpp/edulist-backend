const User = require("../models/User");
const Institute = require("../models/Institute");
const Review = require("../models/Review");
const Enquiry = require("../models/Enquiry");

exports.dashboard = async (req, res) => {
  try {
    const stats = await Promise.all([
      User.countDocuments(),
      Institute.countDocuments(),
      Institute.countDocuments({ isVerified: false }),
      Review.countDocuments(),
      Enquiry.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers: stats[0],
        totalInstitutes: stats[1],
        pendingInstitutes: stats[2],
        totalReviews: stats[3],
        totalEnquiries: stats[4],
      },
    });
  } catch (err) {
    console.error("admin.dashboard error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPendingInstitutes = async (req, res) => {
  try {
    const pending = await Institute.find({ isVerified: false })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    res.json({ success: true, institutes: pending });
  } catch (err) {
    console.error("admin.getPendingInstitutes error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyInstitute = async (req, res) => {
  try {
    const inst = await Institute.findById(req.params.id);
    if (!inst) return res.status(404).json({ success: false, message: "Institute not found" });

    inst.isVerified = true;
    inst.status = "approved";
    await inst.save();

    res.json({ success: true, message: "Institute verified", institute: inst });
  } catch (err) {
    console.error("admin.verifyInstitute error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    console.error("admin.listUsers error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
