// routes/facilities.js
const express = require('express');
const router = express.Router();
const facility = require('../controllers/facilityController');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/', facility.list);
router.post('/', auth, adminAuth, facility.create);
router.delete('/:id', auth, adminAuth, facility.remove);

module.exports = router;
