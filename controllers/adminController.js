// controllers/adminController.js

const Institute = require('../models/Institute');
const User = require('../models/User');
const Review = require('../models/Review');
const Enquiry = require('../models/Enquiry');

// @desc    Get all institutes for admin view
// @route   GET /api/admin/institutes
// @access  Private/Admin (Requires 'auth' and 'authorize' middleware in route)
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
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Approve or Reject an institute (and its user)
// @route   PUT /api/admin/institutes/:id/status
// @access  Private/Admin (Requires 'auth' and 'authorize' middleware in route)
const updateInstituteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expects { status: 'approved' } or { status: 'rejected' }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status provided' });
    }

    const institute = await Institute.findById(id).populate('userId');

    if (!institute) {
      return res.status(404).json({ success: false, message: 'Institute not found' });
    }

    if (institute.verifiedStatus !== 'pending') {
        return res.status(400).json({ success: false, message: `Institute is already ${institute.verifiedStatus}` });
    }

    // --- KEY FIX: Update both Institute and User models atomically ---
    // Start a Mongoose session for atomic transactions
    const session = await Institute.startSession();
    session.startTransaction();

    try {
        // Update the institute's status
        institute.verifiedStatus = status;
        await institute.save({ session });

        // Update the associated user's status
        await User.findByIdAndUpdate(
            institute.userId._id,
            { status: status }, // User status should match institute status
            { session }
        );

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success: true,
            message: `Institute has been ${status}.`,
            data: { instituteId: id, newStatus: status }
        });

    } catch (transactionError) {
        // If any error occurs, abort the transaction
        await session.abortTransaction();
        session.endSession();
        throw transactionError; // Re-throw the error to be caught by the outer catch block
    }

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all regular users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all reviews
// @route   GET /api/admin/reviews
// @access  Private/Admin
const getAllReviews = async (req, res) => {
  try {
    // NOTE: Assumes your Review model has a 'status' field (e.g., 'pending', 'approved')
    const reviews = await Review.find()
      .populate('userId', 'name')
      .populate('instituteId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Approve or Reject a review
// @route   PUT /api/admin/reviews/:id/status
// @access  Private/Admin
const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expects { status: 'approved' } or { status: 'rejected' }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status provided' });
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { status: status }, // NOTE: Assumes 'status' field exists in Review model
      { new: true, runValidators: true }
    ).populate('userId', 'name').populate('instituteId', 'name');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.status(200).json({
      success: true,
      message: `Review has been ${status}.`,
      data: review
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
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

    res.status(200).json({ success: true, count: enquiries.length, data: enquiries });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get dashboard analytics
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
      Review.countDocuments({ status: 'approved' }), // NOTE: Assumes 'status' field in Review model
      Review.countDocuments({ status: 'pending' }), // NOTE: Assumes 'status' field in Review model
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
    res.status(500).json({ success: false, message: 'Server Error' });
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