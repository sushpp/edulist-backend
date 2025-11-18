// routes/institutes.js

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getInstituteById,
  updateInstitute,
  getInstitutes,
  getInstituteDashboard,
  // I am adding a createInstitute function here, which you will need.
  createInstitute,
} = require('../controllers/instituteController');

// Get all institutes
router.get('/', getInstitutes);

// IMPORTANT: Specific routes must come BEFORE the generic /:id route
// Get institute dashboard
router.get('/dashboard/me', auth, getInstituteDashboard);

// Get institute by ID
router.get('/:id', getInstituteById);

// Update institute (using PUT on the root path, which is fine)
router.put('/', auth, updateInstitute);

// I am adding a route for creating an institute
router.post('/', auth, createInstitute);

module.exports = router;