const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { registerUser, loginUser, getUser } = require('../controllers/authController');

// Register
router.post('/register', registerUser);

// Login
router.post('/login', loginUser);

// Get user
router.get('/', auth, getUser);

module.exports = router;