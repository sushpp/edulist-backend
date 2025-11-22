// controllers/adminController.js

const Institute = require('../models/Institute');
const User = require('../models/User');
const Review = require('../models/Review');
const Enquiry = require('../models/Enquiry');


/* ---------------------------------------------------
    USERS — Approve / Reject User Accounts
--------------------------------------------------- */

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = status;
    await user.save();

    res.status(200).json({ message: `User ${status}`, user });

  } catch (err) {
    console.error('updateUserStatus Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};


/* ---------------------------------------------------
    INSTITUTES — All, Pending, Approval
--------------------------------------------------- */

const getAllInstitutes = async (req, res) => {
  try {
    const institutes = await Institute.find()
      .populate('userId', 'name email phone status')
      .sort({ createdAt: -1 });

    res.status(200).json(institutes); // MUST return array

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getPendingInstitutes = async (req, res) => {
  try {
    const pending = await Institute.find({ verifiedStatus: 'pending' })
      .populate('userId', 'name email createdAt status');

    res.status(200).json(pending); // MUST return array

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateInstituteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const institute = await Institute.findById(id).populate('userId');
    if (!institute) return res.status(404).json({ message: 'Institute not found' });

    institute.verifiedStatus = status;
    await institute.save();

    await User.findByIdAndUpdate(institute.userId._id, { status });

    res.status(200).json({ message: `Institute ${status}`, status });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};


/* ---------------------------------------------------
    USERS, REVIEWS, ENQUIRIES
--------------------------------------------------- */

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json(users); // MUST return array

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('userId', 'name')
      .populate('instituteId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews); // MUST return array

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const review = await Review.findByIdAndUpdate(id, { status }, { new: true })
      .populate('userId', 'name')
      .populate('instituteId', 'name');

    if (!review) return res.status(404).json({ message: 'Review not found' });

    res.status(200).json({ message: `Review ${status}`, review });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find()
      .populate('userId', 'name email phone')
      .populate('instituteId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(enquiries); // MUST return array

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};


/* ---------------------------------------------------
    DASHBOARD ANALYTICS
--------------------------------------------------- */

const getDashboardAnalytics = async (req, res) => {
  try {
    const [
      totalInstitutes,
      approvedInstitutes,
      pendingInstitutes,
      rejectedInstitutes,
      totalUsers,
      totalReviews,
      approvedReviews,
      pendingReviews,
      totalEnquiries,
    ] = await Promise.all([
      Institute.countDocuments(),
      Institute.countDocuments({ verifiedStatus: 'approved' }),
      Institute.countDocuments({ verifiedStatus: 'pending' }),
      Institute.countDocuments({ verifiedStatus: 'rejected' }),
      User.countDocuments({ role: 'user' }),
      Review.countDocuments(),
      Review.countDocuments({ status: 'approved' }),
      Review.countDocuments({ status: 'pending' }),
      Enquiry.countDocuments(),
    ]);

    res.status(200).json({
      institutes: {
        total: totalInstitutes,
        approved: approvedInstitutes,
        pending: pendingInstitutes,
        rejected: rejectedInstitutes,
      },
      users: { total: totalUsers },
      reviews: {
        total: totalReviews,
        approved: approvedReviews,
        pending: pendingReviews,
      },
      enquiries: { total: totalEnquiries },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};


/* ---------------------------------------------------
    EXPORTS
--------------------------------------------------- */

module.exports = {
  getAllInstitutes,
  getPendingInstitutes,
  updateInstituteStatus,
  updateUserStatus,
  getAllUsers,
  getAllReviews,
  updateReviewStatus,
  getAllEnquiries,
  getDashboardAnalytics,
};
