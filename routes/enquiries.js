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

router.post('/', auth, createEnquiry);
router.get('/institute', auth, instituteAuth, getInstituteEnquiries);
router.get('/user', auth, getUserEnquiries);
router.put('/:id/status', auth, instituteAuth, updateEnquiryStatus);
router.put('/:id/respond', auth, instituteAuth, respondToEnquiry);

module.exports = router;