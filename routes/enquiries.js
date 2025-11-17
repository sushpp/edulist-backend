const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  createEnquiry,
  getEnquiries,
  updateEnquiryStatus,
} = require('../controllers/enquiryController');

// Create enquiry
router.post('/', auth, createEnquiry);

// Get enquiries for institute
router.get('/', auth, getEnquiries);

// Update enquiry status
router.put('/:id', auth, updateEnquiryStatus);

module.exports = router;