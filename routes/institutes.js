const express = require('express');
const router = express.Router();
const inst = require('../controllers/instituteController');
const { auth, instituteAuth, adminAuth } = require('../middleware/auth');

// Public
router.get('/', inst.getPublicInstitutes);
router.get('/public', inst.getPublicInstitutes);
router.get('/featured', inst.getFeaturedInstitutes);
router.get('/:id', inst.getInstituteById);

// Institute
router.get('/profile', auth, instituteAuth, inst.getProfile);
router.put('/profile', auth, instituteAuth, inst.updateProfile);

// Admin
router.get('/admin/pending', auth, adminAuth, inst.getPendingInstitutes);
router.put('/admin/:id/status', auth, adminAuth, inst.updateInstituteStatus);

// Dashboard
router.get('/:id/stats', auth, inst.getInstituteStats);

module.exports = router;
