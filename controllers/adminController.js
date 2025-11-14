const User = require('../models/User');
const Institute = require('../models/Institute');
const Review = require('../models/Review');
const Enquiry = require('../models/Enquiry');

exports.dashboard = async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      totalInstitutes: await Institute.countDocuments(),
      pendingInstitutes: await Institute.countDocuments({ isVerified: false }),
      totalReviews: await Review.countDocuments(),
      totalEnquiries: await Enquiry.countDocuments(),
    };

    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPendingInstitutes = async (req, res) => {
  try {
    const pending = await Institute.find({ isVerified: false });
    res.json({ success: true, institutes: pending });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyInstitute = async (req, res) => {
  try {
    await Institute.findByIdAndUpdate(req.params.id, {
      isVerified: true
    });

    res.json({ success: true, message: 'Institute Verified' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
