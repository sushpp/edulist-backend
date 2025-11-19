// routes/admin.js

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
  getDashboardAnalytics,
} = require('../controllers/adminController');

// Apply authentication and authorization to all admin routes
router.use(auth);
router.use(authorize('admin'));

// --- Admin Dashboard and Analytics ---
router.get('/analytics', getDashboardAnalytics);

// --- Institute Management ---
router.get('/institutes', getAllInstitutes);
// IMPROVEMENT: More explicit route for status updates
router.put('/institutes/:id/status', updateInstituteStatus);

// --- User Management ---
router.get('/users', getAllUsers);

// --- Review Management ---
router.get('/reviews', getAllReviews);
router.put('/reviews/:id/status', updateReviewStatus);

// --- Enquiry Management ---
router.get('/enquiries', getAllEnquiries);

module.exports = router;