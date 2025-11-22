// routes/auth.js
const express = require('express');
const router = express.Router();

const { register, login, getMe, getAuthStatus } = require('../controllers/authController');
const { auth } = require('../middleware/auth'); // middleware that sets req.user

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.get('/', getAuthStatus);

module.exports = router;
