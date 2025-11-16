const express = require('express');
const router = express.Router();
const inst = require('../controllers/instituteController');
const { auth, instituteAuth, adminAuth } = require('../middleware/auth');

// Public routes
router.get('/', inst.getPublicInstitutes);
router.get('/public', inst.getPublicInstitutes);
router.get('/featured', inst.getFeaturedInstitutes);

// Protected institute profile
router.get('/profile', auth, instituteAuth, inst.getProfile);
router.put('/profile', auth, instituteAuth, inst.updateProfile);

// Admin routes
router.get('/admin/pending', auth, adminAuth, inst.getPendingInstitutes);
router.put('/admin/:id/status', auth, adminAuth, inst.updateInstituteStatus);

// Dashboard stats route (specific route BEFORE /:id)
router.get('/:id/stats', auth, inst.getInstituteStats);

// Dynamic institute by ID (must ALWAYS be last)
router.get('/:id', inst.getInstituteById);

module.exports = router;
