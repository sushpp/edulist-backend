const Institute = require('../models/Institute');
const User = require('../models/User');
const Review = require('../models/Review');
const Enquiry = require('../models/Enquiry');

// Get All Institutes
const getAllInstitutes = async (req, res) => {
  try {
    const institutes = await Institute.find()
      .populate('userId', 'name email phone')
      .sort({ createdDate: -1 });

    res.json(institutes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Approve/Reject Institute
const updateInstituteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }

    const institute = await Institute.findByIdAndUpdate(
      id,
      { verifiedStatus: status },
      { new: true }
    ).populate('userId', 'name email phone');

    if (!institute) {
      return res.status(404).json({ msg: 'Institute not found' });
    }

    res.json(institute);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get All Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdDate: -1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get All Reviews
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('userId', 'name')
      .populate('instituteId', 'name')
      .sort({ date: -1 });

    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Approve/Reject Review
const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { approvalStatus: status },
      { new: true }
    ).populate('userId', 'name').populate('instituteId', 'name');

    if (!review) {
      return res.status(404).json({ msg: 'Review not found' });
    }

    res.json(review);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get All Enquiries
const getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find()
      .populate('userId', 'name email phone')
      .populate('instituteId', 'name')
      .sort({ date: -1 });

    res.json(enquiries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get Dashboard Analytics
const getDashboardAnalytics = async (req, res) => {
  try {
    const totalInstitutes = await Institute.countDocuments();
    const approvedInstitutes = await Institute.countDocuments({ verifiedStatus: 'approved' });
    const pendingInstitutes = await Institute.countDocuments({ verifiedStatus: 'pending' });
    const rejectedInstitutes = await Institute.countDocuments({ verifiedStatus: 'rejected' });
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalReviews = await Review.countDocuments();
    const approvedReviews = await Review.countDocuments({ approvalStatus: 'approved' });
    const pendingReviews = await Review.countDocuments({ approvalStatus: 'pending' });
    const totalEnquiries = await Enquiry.countDocuments();

    res.json({
      totalInstitutes,
      approvedInstitutes,
      pendingInstitutes,
      rejectedInstitutes,
      totalUsers,
      totalReviews,
      approvedReviews,
      pendingReviews,
      totalEnquiries,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getAllInstitutes,
  updateInstituteStatus,
  getAllUsers,
  getAllReviews,
  updateReviewStatus,
  getAllEnquiries,
  getDashboardAnalytics,
};