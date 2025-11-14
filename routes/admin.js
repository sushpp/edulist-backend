// routes/admin.js
const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/users', auth, adminAuth, admin.listUsers);
router.put('/institutes/:id/verify', auth, adminAuth, admin.verifyInstitute);

module.exports = router;
