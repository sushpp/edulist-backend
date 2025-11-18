// routes/institutes.js

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth'); // Make sure you have an auth middleware
const {
  getInstituteById,
  updateInstitute,
  getInstitutes,
  getInstituteDashboard,
  createInstitute, // Import the new function
} = require('../controllers/instituteController');

// Public routes
router.get('/', getInstitutes);
router.get('/:id', getInstituteById);

// Protected routes
router.use(auth); // All routes below this require authentication

router.get('/dashboard/me', getInstituteDashboard);
router.put('/', updateInstitute);

// --- ADD THIS NEW PROTECTED ROUTE ---
router.post('/', createInstitute);

module.exports = router;