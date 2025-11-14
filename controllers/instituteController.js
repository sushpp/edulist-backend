const Institute = require('../models/Institute');
const User = require('../models/User');
const Course = require('../models/Course');
const Review = require('../models/Review');
const Enquiry = require('../models/Enquiry');

// ✅ Admin — get all pending institutes
exports.getPendingInstitutes = async (req, res) => {
  try {
    const institutes = await Institute.find({ isVerified: false })
      .populate('user', 'name email phone createdAt')
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: institutes });
  } catch (error) {
    console.error('Error fetching pending institutes:', error.message);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ✅ Public — get all approved institutes (with filters)
exports.getAllInstitutes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = '', city = '' } = req.query;

    const query = { isVerified: true };

    if (search) query.name = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (city) query['address.city'] = { $regex: city, $options: 'i' };

    const institutes = await Institute.find(query)
      .populate('user', 'name email')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Institute.countDocuments(query);

    return res.json({
      success: true,
      data: {
        institutes,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching institutes:', error.message);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ✅ Public — get institute by ID
exports.getInstituteById = async (req, res) => {
  try {
    const institute = await Institute.findById(req.params.id)
      .populate('user', 'name email phone');

    if (!institute) return res.status(404).json({ success: false, message: 'Institute not found' });

    return res.json({ success: true, data: institute });
  } catch (error) {
    console.error('Error fetching institute:', error.message);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ✅ Admin — approve or reject institute
exports.verifyInstitute = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    const institute = await Institute.findById(id).populate('user');
    if (!institute) return res.status(404).json({ success: false, message: 'Institute not found' });

    if (action === 'approve') {
      institute.isVerified = true/false;
      institute.adminResponse = {
        status: 'approved',
        reviewedBy: req.user.userId,
        reviewedAt: new Date(),
        comments: 'Institute approved by admin'
      };
      await institute.save();

      return res.json({ success: true, message: 'Institute approved successfully', data: institute });
    }

    if (action === 'reject') {
      if (institute.user?._id) await User.findByIdAndDelete(institute.user._id);
      await Institute.findByIdAndDelete(id);

      return res.json({ success: true, message: 'Institute rejected and removed successfully' });
    }

    return res.status(400).json({ success: false, message: 'Invalid action' });
  } catch (error) {
    console.error('Error verifying institute:', error.message);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ✅ Institute — get their own profile
exports.getMyInstitute = async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user.id })
      .populate('user', 'name email phone');

    if (!institute) return res.status(404).json({ success: false, message: 'Institute not found' });

    return res.json({ success: true, data: institute });
  } catch (error) {
    console.error('Error fetching institute:', error.message);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ✅ Institute — update their own details
exports.updateInstitute = async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user.id });
    if (!institute) return res.status(404).json({ success: false, message: 'Institute not found' });

    const updatedInstitute = await Institute.findByIdAndUpdate(
      institute._id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('user', 'name email phone');

    return res.json({ success: true, message: 'Institute updated successfully', data: updatedInstitute });
  } catch (error) {
    console.error('Error updating institute:', error.message);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ✅ Admin or Institute — get stats
exports.getInstituteStats = async (req, res) => {
  try {
    const instituteId = req.params.id || req.user.instituteId;
    if (!instituteId) return res.status(400).json({ success: false, message: 'Institute ID required' });

    const [reviews, enquiries, courses] = await Promise.all([
      Review.countDocuments({ institute: instituteId }),
      Enquiry.countDocuments({ institute: instituteId }),
      Course.countDocuments({ institute: instituteId })
    ]);

    return res.json({ success: true, data: { reviews, enquiries, courses } });
  } catch (error) {
    console.error('Error fetching institute stats:', error.message);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};