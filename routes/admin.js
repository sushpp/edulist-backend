const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/dashboard', auth, adminAuth, admin.dashboard);
router.get('/institutes/pending', auth, adminAuth, admin.getPendingInstitutes);
router.put('/institutes/:id/verify', auth, adminAuth, admin.verifyInstitute);
router.get('/users', auth, adminAuth, admin.listUsers);

module.exports = router;
