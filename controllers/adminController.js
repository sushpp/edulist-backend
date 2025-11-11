<<<<<<< HEAD
=======
<<<<<<< HEAD
const User = require('../models/User');
const Institute = require('../models/Institute');
const Review = require('../models/Review');
const Enquiry = require('../models/Enquiry');
const Course = require('../models/Course');

// Get dashboard analytics
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalInstitutes = await Institute.countDocuments({ status: 'approved' });
    const pendingInstitutes = await Institute.countDocuments({ status: 'pending' });
    const totalReviews = await Review.countDocuments({ status: 'approved' });
    const totalEnquiries = await Enquiry.countDocuments();
    const totalCourses = await Course.countDocuments();

    const recentActivities = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(5),
      Institute.find({ status: 'pending' }).populate('user').limit(5),
      Review.find().populate('user').populate('institute').sort({ createdAt: -1 }).limit(5)
    ]);

    res.json({
      analytics: {
        totalUsers,
        totalInstitutes,
        pendingInstitutes,
        totalReviews,
        totalEnquiries,
        totalCourses
      },
      recentActivities: {
        newUsers: recentActivities[0],
        pendingInstitutes: recentActivities[1],
        recentReviews: recentActivities[2]
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get pending institutes
exports.getPendingInstitutes = async (req, res) => {
  try {
    const institutes = await Institute.find({ status: 'pending' })
      .populate('user', 'name email phone createdAt');
    
    res.json(institutes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve/reject institute
exports.updateInstituteStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const institute = await Institute.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user');

    res.json({
      message: `Institute ${status} successfully`,
      institute
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['user', 'institute'] } })
      .select('-password');
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle user active status
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { new: true }
    ).select('-password');

    res.json({
      message: `User ${req.body.isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('institute', 'name')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update review status
exports.updateReviewStatus = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, isActive: req.body.status === 'approved' },
      { new: true }
    );

    res.json({
      message: `Review ${req.body.status} successfully`,
      review
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
=======
>>>>>>> c12b9554ad867aeeab065de4f2c4fbf7a05570bc
const Institute = require('../models/Institute');
const User = require('../models/User');
const Review = require('../models/Review');
const Enquiry = require('../models/Enquiry');

// Get pending institutes - FIXED VERSION
const getPendingInstitutes = async (req, res) => {
  try {
    console.log('🔍 Fetching pending institutes...');
    
    const institutes = await Institute.find({ adminApproved: false })
      .populate('userId', 'name email phone createdAt');
    
    console.log(`✅ Found ${institutes.length} pending institutes`);
    
    // Log the institutes for debugging
    institutes.forEach(inst => {
      console.log(`   - ${inst.name} | ${inst.contactEmail} | Approved: ${inst.adminApproved}`);
    });
    
    res.json(institutes);
  } catch (error) {
    console.error('❌ Get pending institutes error:', error);
    res.status(500).json({ 
      message: 'Error fetching pending institutes', 
      error: error.message 
    });
  }
};

// Approve institute - FIXED VERSION
const approveInstitute = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`✅ Approving institute: ${id}`);
    
    const institute = await Institute.findByIdAndUpdate(
      id,
      { 
        adminApproved: true, 
        verified: true 
      },
      { new: true }
    ).populate('userId', 'name email');

    if (!institute) {
      return res.status(404).json({ message: 'Institute not found' });
    }

    console.log(`🎉 Institute approved: ${institute.name}`);
    
    res.json({
      message: 'Institute approved successfully',
      institute
    });
  } catch (error) {
    console.error('❌ Approve institute error:', error);
    res.status(500).json({ 
      message: 'Error approving institute', 
      error: error.message 
    });
  }
};

// Reject institute
const rejectInstitute = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`❌ Rejecting institute: ${id}`);
    
    const institute = await Institute.findByIdAndDelete(id);
    
    if (!institute) {
      return res.status(404).json({ message: 'Institute not found' });
    }

    // Also delete the associated user
    await User.findByIdAndDelete(institute.userId);
    
    console.log(`🗑️ Institute rejected and deleted: ${institute.name}`);
    
    res.json({
      message: 'Institute rejected and removed successfully'
    });
  } catch (error) {
    console.error('Reject institute error:', error);
    res.status(500).json({ 
      message: 'Error rejecting institute', 
      error: error.message 
    });
  }
};

// Get analytics - FIXED VERSION
const getAnalytics = async (req, res) => {
  try {
    const totalInstitutes = await Institute.countDocuments({ adminApproved: true });
    const totalUsers = await User.countDocuments({ role: 'user', isActive: true });
    const totalReviews = await Review.countDocuments({ approvalStatus: 'approved' });
    const totalEnquiries = await Enquiry.countDocuments();
    const pendingInstitutes = await Institute.countDocuments({ adminApproved: false });

    console.log(`📊 Analytics - Pending: ${pendingInstitutes}, Total: ${totalInstitutes}`);

    res.json({
      totalInstitutes,
      totalUsers,
      totalReviews,
      totalEnquiries,
      pendingInstitutes,
      recentActivities: []
    });
  } catch (error) {
    console.error('❌ Get analytics error:', error);
    res.status(500).json({ 
      message: 'Error fetching analytics', 
      error: error.message 
    });
  }
};

module.exports = {
  getPendingInstitutes,
  approveInstitute,
  rejectInstitute,
  getAnalytics
<<<<<<< HEAD
=======
>>>>>>> c15d45fca (Initial commit)
>>>>>>> c12b9554ad867aeeab065de4f2c4fbf7a05570bc
};