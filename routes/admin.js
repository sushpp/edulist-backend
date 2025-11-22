// routes/admin.js

const express = require('express');
const router = express.Router();

const { auth, authorize } = require('../middleware/auth');

const {
  getAllInstitutes,
  getPendingInstitutes,
  updateInstituteStatus,

  getAllUsers,
  updateUserStatus,

  getAllReviews,
  updateReviewStatus,

  getAllEnquiries,

  getDashboardAnalytics
} = require('../controllers/adminController');

// ===============================
// ADMIN ROUTES (Protected)
// ===============================

// Dashboard Analytics
router.get('/analytics', auth, authorize('admin'), getDashboardAnalytics);

// Institutes
router.get('/institutes', auth, authorize('admin'), getAllInstitutes);
router.get('/pending-institutes', auth, authorize('admin'), getPendingInstitutes);
router.put('/institutes/:id/status', auth, authorize('admin'), updateInstituteStatus);

// Users
router.get('/users', auth, authorize('admin'), getAllUsers);
router.put('/users/:id/status', auth, authorize('admin'), updateUserStatus);

// Reviews
router.get('/reviews', auth, authorize('admin'), getAllReviews);
router.put('/reviews/:id/status', auth, authorize('admin'), updateReviewStatus);

// Enquiries
router.get('/enquiries', auth, authorize('admin'), getAllEnquiries);

module.exports = router;
