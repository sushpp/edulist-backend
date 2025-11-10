const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, adminAuth, getAllUsers);
router.get('/:id', auth, getUserById);
router.put('/profile', auth, updateUser);
router.delete('/:id', auth, adminAuth, deleteUser);

module.exports = router;