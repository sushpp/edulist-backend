const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Institute = require('../models/Institute');
const Review = require('../models/Review');
const Enquiry = require('../models/Enquiry');

// Get homepage statistics
router.get('/homepage', async (req, res) => {
  try {
    const [
      totalInstitutes,
      totalReviews,
      totalUsers,
      approvedInstitutes,
      cities
    ] = await Promise.all([
      Institute.countDocuments({ status: 'approved' }),
      Review.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Institute.find({ status: 'approved' }),
      Institute.distinct('city', { status: 'approved' })
    ]);

    // Get featured institutes (top rated)
    const featuredInstitutes = await Institute.find({ status: 'approved' })
      .limit(6)
      .sort({ createdAt: -1 }); // Or implement rating-based sorting

    res.json({
      stats: {
        institutes: totalInstitutes,
        reviews: totalReviews,
        students: totalUsers,
        cities: cities.length
      },
      featuredInstitutes
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Get platform analytics (admin only)
router.get('/dashboard', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [
      totalUsers,
      totalInstitutes,
      totalReviews,
      totalEnquiries,
      pendingInstitutes,
      approvedInstitutes
    ] = await Promise.all([
      User.countDocuments(),
      Institute.countDocuments(),
      Review.countDocuments(),
      Enquiry.countDocuments(),
      Institute.countDocuments({ status: 'pending' }),
      Institute.countDocuments({ status: 'approved' })
    ]);

    res.json({
      stats: {
        totalUsers,
        totalInstitutes,
        totalReviews,
        totalEnquiries,
        pendingInstitutes,
        approvedInstitutes
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user statistics
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;

    const [reviewsCount, enquiriesCount] = await Promise.all([
      Review.countDocuments({ user: userId }),
      Enquiry.countDocuments({ user: userId })
    ]);

    // Get unique institutes viewed (from reviews and enquiries)
    const reviewedInstitutes = await Review.distinct('institute', { user: userId });
    const enquiredInstitutes = await Enquiry.distinct('institute', { user: userId });
    const uniqueInstitutes = new Set([...reviewedInstitutes, ...enquiredInstitutes]).size;

    res.json({
      reviewsGiven: reviewsCount,
      enquiriesSent: enquiriesCount,
      institutesViewed: uniqueInstitutes
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;