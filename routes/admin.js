const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  getAllInstitutes,
  updateInstituteStatus,
  getAllUsers,
  getAllReviews,
  updateReviewStatus,
  getAllEnquiries,
  getDashboardAnalytics, // This is the function we need
} = require('../controllers/adminController');

// Get all institutes
router.get('/institutes', auth, authorize('admin'), getAllInstitutes);

// Update institute status
router.put('/institutes/:id', auth, authorize('admin'), updateInstituteStatus);

// Get all users
router.get('/users', auth, authorize('admin'), getAllUsers);

// Get all reviews
router.get('/reviews', auth, authorize('admin'), getAllReviews);

// Update review status
router.put('/reviews/:id', auth, authorize('admin'), updateReviewStatus);

// Get all enquiries
router.get('/enquiries', auth, authorize('admin'), getAllEnquiries);

// Get dashboard analytics
router.get('/analytics', auth, authorize('admin'), getDashboardAnalytics);

module.exports = router;