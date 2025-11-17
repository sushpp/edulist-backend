const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  createFacility,
  getFacilities,
  updateFacility,
  deleteFacility,
} = require('../controllers/facilityController');

// Create facility
router.post('/', auth, createFacility);

// Get all facilities for institute
router.get('/', auth, getFacilities);

// Update facility
router.put('/:id', auth, updateFacility);

// Delete facility
router.delete('/:id', auth, deleteFacility);

module.exports = router;