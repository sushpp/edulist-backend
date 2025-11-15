const Institute = require('../models/Institute');
const User = require('../models/User');
const Review = require('../models/Review');
const Enquiry = require('../models/Enquiry');

/**
 * Platform-wide analytics for admin dashboard
 */
exports.getPlatformAnalytics = async (req, res) => {
  try {
    const [
      totalInstitutes,
      totalUsers,
      totalReviews,
      totalEnquiries,
      pendingInstitutes
    ] = await Promise.all([
      Institute.countDocuments({ isVerified: true }) || 0,
      User.countDocuments({ role: 'user' }) || 0,
      Review.countDocuments() || 0,
      Enquiry.countDocuments() || 0,
      Institute.countDocuments({ isVerified: false }) || 0
    ]);

    // Flattened response for frontend compatibility
    res.json({
      totalInstitutes,
      totalUsers,
      totalReviews,
      totalEnquiries,
      pendingInstitutes
    });
  } catch (error) {
    console.error("⚠️ Error in Platform Analytics:", error);
    res.status(500).json({ message: 'Failed to load platform analytics', error: error.message });
  }
};

/**
 * Analytics for a specific institute
 */
exports.getInstituteAnalytics = async (req, res) => {
  try {
    const instituteId = req.params.id;

    const [
      totalReviews,
      totalEnquiries,
      pendingEnquiries
    ] = await Promise.all([
      Review.countDocuments({ institute: instituteId }) || 0,
      Enquiry.countDocuments({ institute: instituteId }) || 0,
      Enquiry.countDocuments({ institute: instituteId, status: 'pending' }) || 0
    ]);

    // Flattened response
    res.json({
      totalReviews,
      totalEnquiries,
      pendingEnquiries
    });
  } catch (error) {
    console.error("⚠️ Error in Institute Analytics:", error);
    res.status(500).json({ message: 'Failed to load institute analytics', error: error.message });
  }
};
