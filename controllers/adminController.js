const User = require("../models/User");
const Institute = require("../models/Institute");
const Review = require("../models/Review");
const Enquiry = require("../models/Enquiry");

exports.dashboard = async (req, res) => {
  try {
    // 1. Fetch all counts in parallel for efficiency
    const [
      totalUsers,
      totalInstitutes,
      pendingInstitutesCount,
      totalReviews,
      totalEnquiries
    ] = await Promise.all([
      User.countDocuments(),
      Institute.countDocuments(),
      Institute.countDocuments({ isVerified: false }),
      Review.countDocuments(),
      Enquiry.countDocuments(),
    ]);

    // 2. Fetch data for featured institutes and recent activities
    const [
      featured,
      newestUser,
      newestPendingInstitute,
      newestReview
    ] = await Promise.all([
      // Fetch a few featured, verified institutes
      // NOTE: Make sure your Institute model has an `isFeatured: Boolean` field
      Institute.find({ isFeatured: true, isVerified: true }).limit(5).select('name location photoUrl'),
      
      // Fetch the newest user for activity
      User.findOne().sort({ createdAt: -1 }).select('name createdAt'),
      
      // Fetch the newest pending institute for activity
      Institute.findOne({ isVerified: false }).sort({ createdAt: -1 }).select('name createdAt'),
      
      // Fetch the newest review for activity
      Review.findOne()
        .sort({ createdAt: -1 })
        .populate('user', 'name')
        .populate('institute', 'name')
        .select('rating createdAt user institute')
    ]);

    // 3. Structure the response to match what the frontend expects
    res.json({
      success: true,
      // The analytics object is now at the top level
      analytics: {
        totalUsers,
        totalInstitutes,
        pendingInstitutes: pendingInstitutesCount,
        totalReviews,
        totalEnquiries,
      },
      // The featured institutes array is now included
      featuredInstitutes: featured || [],
      // The recent activities are now structured as arrays
      recentActivities: {
        newUsers: newestUser ? [newestUser] : [],
        pendingInstitutes: newestPendingInstitute ? [newestPendingInstitute] : [],
        recentReviews: newestReview ? [newestReview] : [],
      },
    });
  } catch (err) {
    console.error("admin.dashboard error", err);
    res.status(500).json({ success: false, message: "Server Error while fetching dashboard data." });
  }
};

// --- The other functions look correct and don't need changes ---

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

// In your backend controller (e.g., controllers/admin.js)

exports.listUsers = async (req, res) => {
  try {
    // Example: Get page 1, with 20 users per page
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select("-password") // Don't fetch passwords
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await User.countDocuments();

    res.json({ 
      success: true, 
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
      }
    });
  } catch (err) {
    console.error("admin.listUsers error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};