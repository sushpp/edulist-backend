// routes/users.js
const express = require('express');
const router = express.Router();
const { getUser, updateUser, listUsers } = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// Public: get user by id
router.get('/:id', getUser);

// Protected: update current user
router.put('/', auth, updateUser);

// Admin: list users (if your admin middleware used in controller)
router.get('/', auth, listUsers);

module.exports = router;
