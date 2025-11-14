// routes/admin.js
const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');
const { auth, adminAuth } = require('../middleware/auth');

// ✔ Admin Dashboard Stats
router.get('/dashboard', auth, adminAuth, admin.dashboard);

// ✔ Pending Institutes
router.get('/institutes/pending', auth, adminAuth, admin.getPendingInstitutes);

// ✔ Verify institute
router.put('/institutes/:id/verify', auth, adminAuth, admin.verifyInstitute);

// ✔ List users
router.get('/users', auth, adminAuth, admin.listUsers);

module.exports = router;
