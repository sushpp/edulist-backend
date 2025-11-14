// routes/enquiries.js
const express = require('express');
const router = express.Router();
const enquiry = require('../controllers/enquiryController');
const { auth, instituteAuth } = require('../middleware/auth');

router.post('/', auth, enquiry.create);
router.get('/institute', auth, instituteAuth, enquiry.getInstituteEnquiries);
router.get('/user', auth, enquiry.getUserEnquiries);
router.put('/:id/status', auth, instituteAuth, enquiry.updateStatus);
router.put('/:id/respond', auth, instituteAuth, enquiry.respond);

module.exports = router;
