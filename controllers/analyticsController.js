const Institute = require('../models/Institute');
const User = require('../models/User');
const Review = require('../models/Review');
const Enquiry = require('../models/Enquiry');

exports.getPlatformAnalytics = async (req, res) => {
  try {
    const [
      totalInstitutes,
      totalUsers,
      totalReviews,
      totalEnquiries,
      pendingInstitutes
    ] = await Promise.all([
      Institute.countDocuments({ isVerified: true }),
      User.countDocuments({ role: 'user' }),
      Review.countDocuments(),
      Enquiry.countDocuments(),
      Institute.countDocuments({ isVerified: false })
    ]);

    res.json({
      overview: {
        totalInstitutes,
        totalUsers,
        totalReviews,
        totalEnquiries,
        pendingInstitutes
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getInstituteAnalytics = async (req, res) => {
  try {
    const instituteId = req.params.id;
    
    const [
      totalReviews,
      totalEnquiries,
      pendingEnquiries
    ] = await Promise.all([
      Review.countDocuments({ institute: instituteId }),
      Enquiry.countDocuments({ institute: instituteId }),
      Enquiry.countDocuments({ institute: instituteId, status: 'pending' })
    ]);

    res.json({
      overview: {
        totalReviews,
        totalEnquiries,
        pendingEnquiries
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};