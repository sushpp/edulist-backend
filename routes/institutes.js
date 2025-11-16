const express = require('express');
const router = express.Router();
const inst = require('../controllers/instituteController');
const { auth, instituteAuth, adminAuth } = require('../middleware/auth');

// Public
router.get('/', inst.getPublicInstitutes);
router.get('/public', inst.getPublicInstitutes);
router.get('/featured', inst.getFeaturedInstitutes);

// Make sure this is above any dynamic `/:id` routes
router.get('/profile', auth, instituteAuth, inst.getProfile);
router.put('/profile', auth, instituteAuth, inst.updateProfile);

// Admin
router.get('/admin/pending', auth, adminAuth, inst.getPendingInstitutes);
router.put('/admin/:id/status', auth, adminAuth, inst.updateInstituteStatus);

// Dashboard stats (specific route)
router.get('/:id/stats', auth, inst.getInstituteStats);

// Dynamic route (LAST — to avoid conflicts with other routes)
router.get('/:id', inst.getInstituteById);

module.exports = router;
