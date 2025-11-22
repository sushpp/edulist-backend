// controllers/adminController.js

const Institute = require('../models/Institute');
const User = require('../models/User');
const Review = require('../models/Review');
const Enquiry = require('../models/Enquiry');
const mongoose = require('mongoose');

/* ---------------------------------------------------
    USERS — Approve / Reject User Accounts
--------------------------------------------------- */

// @desc    Admin updates user status (approved/rejected)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status provided'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.status === status) {
      return res.status(400).json({
        success: false,
        message: `User already ${status}`
      });
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User has been ${status}.`,
      data: { userId: id, newStatus: status }
    });

  } catch (err) {
    console.error('updateUserStatus Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

/* ---------------------------------------------------
    INSTITUTES — All, Pending, Approval
--------------------------------------------------- */

// @desc    Get all institutes for admin view
// @route   GET /api/admin/institutes
// @access  Private/Admin
const getAllInstitutes = async (req, res) => {
  try {
    const institutes = await Institute.find()
      .populate('userId', 'name email phone status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: institutes.length,
      data: institutes,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get pending institutes
// @route   GET /api/admin/pending-institutes
// @access  Private/Admin
const getPendingInstitutes = async (req, res) => {
  try {
    const pending = await Institute.find({ verifiedStatus: 'pending' })
      .populate('userId', 'name email createdAt status');

    res.status(200).json({
      success: true,
      count: pending.length,
      data: pending,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Approve or Reject an institute (and associated user)
// @route   PUT /api/admin/institutes/:id/status
// @access  Private/Admin
const updateInstituteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status provided'
      });
    }

    const institute = await Institute.findById(id).populate('userId');

    if (!institute) {
      return res.status(404).json({
        success: false,
        message: 'Institute not found'
      });
    }

    if (institute.verifiedStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Institute is already ${institute.verifiedStatus}`
      });
    }

    // Start Transaction
    const session = await Institute.startSession();
    session.startTransaction();

    try {
      institute.verifiedStatus = status;
      await institute.save({ session });

      await User.findByIdAndUpdate(
        institute.userId._id,
        { status: status },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: `Institute has been ${status}.`,
        data: { instituteId: id, newStatus: status }
      });

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Transaction Error:', error);
      res.status(500).json({
        success: false,
        message: 'Server Error during approval process'
      });
    }

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

/* ---------------------------------------------------
    USERS, REVIEWS, ENQUIRIES
--------------------------------------------------- */

// @desc    Get all regular users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get all reviews
// @route   GET /api/admin/reviews
// @access  Private/Admin
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('userId', 'name')
      .populate('instituteId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Approve or reject a review
// @route   PUT /api/admin/reviews/:id/status
// @access  Private/Admin
const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status provided'
      });
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('userId', 'name')
      .populate('instituteId', 'name');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Review has been ${status}.`,
      data: review
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get all enquiries
// @route   GET /api/admin/enquiries
// @access  Private/Admin
const getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find()
      .populate('userId', 'name email phone')
      .populate('instituteId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Admin Dashboard Analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
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
      success: true,
      data: {
        institutes: {
          total: totalInstitutes,
          approved: approvedInstitutes,
          pending: pendingInstitutes,
          rejected: rejectedInstitutes,
        },
        users: {
          total: totalUsers,
        },
        reviews: {
          total: totalReviews,
          approved: approvedReviews,
          pending: pendingReviews,
        },
        enquiries: {
          total: totalEnquiries,
        },
      },
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

/* ---------------------------------------------------
    EXPORTS (FINAL)
--------------------------------------------------- */

module.exports = {
  getAllInstitutes,
  getPendingInstitutes,
  updateInstituteStatus,
  updateUserStatus,       // <-- NEW
  getAllUsers,
  getAllReviews,
  updateReviewStatus,
  getAllEnquiries,
  getDashboardAnalytics,
};
