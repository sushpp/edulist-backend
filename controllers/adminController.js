// controllers/adminController.js
const User = require('../models/User');
const Institute = require('../models/Institute');

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    console.error('admin.listUsers error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.verifyInstitute = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'
    if (!['approve', 'reject'].includes(action)) return res.status(400).json({ success: false, message: 'Invalid action' });

    const inst = await Institute.findById(id).populate('user', 'email name');
    if (!inst) return res.status(404).json({ success: false, message: 'Institute not found' });

    inst.isVerified = action === 'approve';
    await inst.save();

    res.json({ success: true, message: `Institute ${action === 'approve' ? 'approved' : 'rejected'}`, institute: inst });
  } catch (err) {
    console.error('admin.verifyInstitute error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
