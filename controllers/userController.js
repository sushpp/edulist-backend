const User = require('../models/User');
<<<<<<< HEAD
=======
<<<<<<< HEAD

// Get all users (for admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['user', 'institute'] } })
      .select('-password')
      .sort({ createdAt: -1 });
    
=======
>>>>>>> c12b9554ad867aeeab065de4f2c4fbf7a05570bc
const Institute = require('../models/Institute');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
<<<<<<< HEAD
=======
>>>>>>> c15d45fca (Initial commit)
>>>>>>> c12b9554ad867aeeab065de4f2c4fbf7a05570bc
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

<<<<<<< HEAD
=======
<<<<<<< HEAD
// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
exports.updateUser = async (req, res) => {
  try {
    const { name, phone, profileImage } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, profileImage },
      { new: true }
    ).select('-password');
    
    res.json({
      message: 'Profile updated successfully',
      user
=======
>>>>>>> c12b9554ad867aeeab065de4f2c4fbf7a05570bc
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ 
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user 
<<<<<<< HEAD
=======
>>>>>>> c15d45fca (Initial commit)
>>>>>>> c12b9554ad867aeeab065de4f2c4fbf7a05570bc
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

<<<<<<< HEAD
=======
<<<<<<< HEAD
// Delete user
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'User deleted successfully' });
=======
>>>>>>> c12b9554ad867aeeab065de4f2c4fbf7a05570bc
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      req.body,
      { new: true }
    ).select('-password');
    
    res.json({ message: 'Profile updated successfully', user });
<<<<<<< HEAD
=======
>>>>>>> c15d45fca (Initial commit)
>>>>>>> c12b9554ad867aeeab065de4f2c4fbf7a05570bc
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};