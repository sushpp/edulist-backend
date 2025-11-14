// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    console.error('user.getUser error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.password) {
      update.password = await bcrypt.hash(update.password, 10);
    }
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    console.error('user.updateUser error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin - list users (optional)
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    console.error('user.listUsers error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
