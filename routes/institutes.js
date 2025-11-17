const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getInstituteById,
  updateInstitute,
  getInstitutes,
  getInstituteDashboard,
} = require('../controllers/instituteController');

// Get all institutes
router.get('/', getInstitutes);

// Get institute by ID
router.get('/:id', getInstituteById);

// Update institute
router.put('/', auth, updateInstitute);

// Get institute dashboard
router.get('/dashboard/me', auth, getInstituteDashboard);

module.exports = router;