// routes/enquiries.js
const express = require('express');
const router = express.Router();
const enquiry = require('../controllers/enquiryController');
const { auth, instituteAuth } = require('../middleware/auth');

// Create an enquiry (any logged-in user)
router.post('/', auth, enquiry.create);

// Institute: view enquiries for their institute
router.get('/institute', auth, instituteAuth, enquiry.getInstituteEnquiries);

// User: view own enquiries
router.get('/user', auth, enquiry.getUserEnquiries);

// Institute: update status / respond
router.put('/:id/status', auth, instituteAuth, enquiry.updateStatus);
router.put('/:id/respond', auth, instituteAuth, enquiry.respond);

module.exports = router;
