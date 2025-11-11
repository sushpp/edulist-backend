const User = require('../models/User');
const Institute = require('../models/Institute');

// 🟢 Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['user', 'institute', 'admin'] } })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 🟢 Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 🟢 Get logged-in user's profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 🟢 Update logged-in user's profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, phone, profileImage } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, phone, profileImage },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'Profile updated successfully', data: user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 🟢 Toggle user activation (Admin)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: user,
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 🟢 Delete user (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If the deleted user is an institute, remove related institute entry
    if (user.role === 'institute') {
      await Institute.findOneAndDelete({ user: user._id });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
