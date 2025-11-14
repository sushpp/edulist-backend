// routes/institutes.js
const express = require('express');
const router = express.Router();
const inst = require('../controllers/instituteController');
const { auth, instituteAuth, adminAuth } = require('../middleware/auth');

// Public endpoints
router.get('/public', inst.getPublicInstitutes);
router.get('/', inst.getPublicInstitutes);

// Profile & institute protected
router.get('/profile', auth, instituteAuth, inst.getProfile);
router.put('/profile', auth, instituteAuth, inst.updateProfile);

// Admin
router.get('/admin/pending', auth, adminAuth, inst.getPending);
router.put('/admin/:id/status', auth, adminAuth, inst.updateStatus);
// ⭐ FEATURED INSTITUTES (MISSING ROUTE)
router.get('/featured', inst.getFeaturedInstitutes);

// Stats for institute
router.get('/:id/stats', auth, inst.getStats);

// Single institute (must be after profile)
router.get('/:id', inst.getById);

module.exports = router;
