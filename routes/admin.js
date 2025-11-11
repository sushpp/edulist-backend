const express = require('express');
const {
  getDashboardAnalytics,
  getPendingInstitutes,
  updateInstituteStatus,
  getAllUsers,
  toggleUserStatus,
  getAllReviews,
  updateReviewStatus
} = require('../controllers/adminController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// ✅ Admin Dashboard Analytics
router.get('/dashboard', auth, adminAuth, getDashboardAnalytics);

// ✅ Institute Management
router.get('/institutes/pending', auth, adminAuth, getPendingInstitutes);
router.put('/institutes/:id/status', auth, adminAuth, updateInstituteStatus);

// ✅ User Management
router.get('/users', auth, adminAuth, getAllUsers);
router.put('/users/:id/status', auth, adminAuth, toggleUserStatus);

// ✅ Review Management
router.get('/reviews', auth, adminAuth, getAllReviews);
router.put('/reviews/:id/status', auth, adminAuth, updateReviewStatus);

module.exports = router;
