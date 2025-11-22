// routes/admin.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/auth'); // or adminAuth
const { updateInstituteStatus, getPendingInstitutes } = require('../controllers/adminController');

router.get('/pending-institutes', auth, authorize('admin'), getPendingInstitutes);
router.put('/institutes/:id/approve', auth, authorize('admin'), updateInstituteStatus);

module.exports = router;
