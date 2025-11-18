const express = require('express');
const router = express.Router();

// Make sure you have this exact line at the top
const { register, login, getMe } = require('../controllers/authController');

// This is line 7 where the error was happening.
// The 'register' variable must be imported correctly for this to work.
router.post('/register', register);

router.post('/login', login);

// Example of a protected route
router.get('/me', getMe);

module.exports = router;