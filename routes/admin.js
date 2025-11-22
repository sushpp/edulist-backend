// routes/admin.js
const express = require('express');
const router = express.Router();

const { auth, authorize } = require('../middleware/auth'); // make sure authorize checks roles
const { getPendingInstitutes, updateInstituteStatus, getAllUsers, updateUserStatus } = require('../controllers/adminController');

// All admin routes require auth + admin role
router.get('/pending-institutes', auth, authorize('admin'), getPendingInstitutes);
router.put('/institutes/:id/approve', auth, authorize('admin'), updateInstituteStatus);

// Users endpoints
router.get('/users', auth, authorize('admin'), getAllUsers);
router.put('/users/:id/status', auth, authorize('admin'), updateUserStatus);

module.exports = router;
