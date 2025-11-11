const express = require('express');
const {
  createEnquiry,
  getInstituteEnquiries,
  getUserEnquiries,
  updateEnquiryStatus,
  respondToEnquiry
} = require('../controllers/enquiryController');
const { auth, instituteAuth } = require('../middleware/auth');

const router = express.Router();

// Create enquiry
router.post('/', auth, createEnquiry);

// Get enquiries for logged-in institute
router.get('/institute', auth, instituteAuth, getInstituteEnquiries);

// Get enquiries for logged-in user
router.get('/user', auth, getUserEnquiries);

// Update enquiry status (approve/reject/close)
router.put('/:id/status', auth, instituteAuth, updateEnquiryStatus);

// Respond to an enquiry (message or feedback)
router.put('/:id/respond', auth, instituteAuth, respondToEnquiry);

module.exports = router;
