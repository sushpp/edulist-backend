// routes/institutes.js
const express = require('express');
const router = express.Router();
const inst = require('../controllers/instituteController');
const { auth, instituteAuth, adminAuth } = require('../middleware/auth');

// Public
router.get('/public', inst.getPublicInstitutes);
router.get('/', inst.getPublicInstitutes);
router.get('/:id', inst.getById);

// Institute (protected) — NOTE: profile routes MUST be before /:id to avoid CastError
router.get('/profile', auth, instituteAuth, inst.getProfile);
router.put('/profile', auth, instituteAuth, inst.updateProfile);

// Admin
router.get('/admin/pending', auth, adminAuth, inst.getPending);
router.put('/admin/:id/status', auth, adminAuth, inst.updateStatus);

// Stats
router.get('/:id/stats', auth, inst.getStats);

module.exports = router;
