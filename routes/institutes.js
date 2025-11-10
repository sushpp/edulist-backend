const express = require('express');
const { 
  getInstituteById, 
  updateInstitute, 
  addFacility, 
  removeFacility,
  getAllInstitutes 
} = require('../controllers/instituteController');
const { auth, instituteAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/public', getAllInstitutes);

// Protected routes
router.get('/profile', auth, instituteAuth, getInstituteById);
router.put('/profile', auth, instituteAuth, updateInstitute);
router.post('/facilities', auth, instituteAuth, addFacility);
router.delete('/facilities/:facilityId', auth, instituteAuth, removeFacility);

module.exports = router;