const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { updateUser } = require('../controllers/userController');

// Update user
router.put('/', auth, updateUser);

module.exports = router;