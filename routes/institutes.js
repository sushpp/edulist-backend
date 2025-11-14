// routes/institutes.js

const express = require('express');
const router = express.Router();

const {
  getPublicInstitutes,
  getProfile,
  updateProfile,
  getPendingInstitutes,
  updateInstituteStatus,
  getFeaturedInstitutes,
  getInstituteStats,
  getInstituteById
} = require('../controllers/instituteController');

const { auth, instituteAuth, adminAuth } = require('../middleware/auth');


// ----------------------
// PUBLIC ROUTES
// ----------------------
router.get('/public', getPublicInstitutes);
router.get('/', getPublicInstitutes);

// Featured institutes
router.get('/featured', getFeaturedInstitutes);


// ----------------------
// INSTITUTE PROFILE ROUTES
// ----------------------
router.get('/profile', auth, instituteAuth, getProfile);
router.put('/profile', auth, instituteAuth, updateProfile);


// ----------------------
// ADMIN ROUTES
// ----------------------
router.get('/admin/pending', auth, adminAuth, getPendingInstitutes);
router.put('/admin/:id/status', auth, adminAuth, updateInstituteStatus);


// ----------------------
// INSTITUTE STATS
// ----------------------
router.get('/:id/stats', auth, getInstituteStats);


// ----------------------
// SINGLE INSTITUTE DETAILS
// (ALWAYS LAST — dynamic route)
// ----------------------
router.get('/:id', getInstituteById);


module.exports = router;
