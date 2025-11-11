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

    res.json({ success: true, data: institutes });
  } catch (error) {
    console.error('Error fetching pending institutes:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Public — get all approved institutes (with filters)
exports.getAllInstitutes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = '', city = '' } = req.query;

    const query = { isVerified: true };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (category) {
      query.category = category;
    }

    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }

    const institutes = await Institute.find(query)
      .populate('user', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Institute.countDocuments(query);

    res.json({
      success: true,
      data: {
        institutes,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching institutes:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Public — get institute by ID
exports.getInstituteById = async (req, res) => {
  try {
    const institute = await Institute.findById(req.params.id)
      .populate('user', 'name email phone');

    if (!institute) {
      return res.status(404).json({ success: false, message: 'Institute not found' });
    }

    res.json({ success: true, data: institute });
  } catch (error) {
    console.error('Error fetching institute:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Admin — approve or reject institute
exports.verifyInstitute = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    const institute = await Institute.findById(id).populate('user');
    if (!institute) {
      return res.status(404).json({ success: false, message: 'Institute not found' });
    }

    if (action === 'approve') {
      institute.isVerified = true;
      institute.adminResponse = {
        status: 'approved',
        reviewedBy: req.user.userId,
        reviewedAt: new Date(),
        comments: 'Institute approved by admin'
      };
      await institute.save();

      res.json({
        success: true,
        message: 'Institute approved successfully',
        data: institute
      });
    } else if (action === 'reject') {
      await User.findByIdAndDelete(institute.user._id);
      await Institute.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Institute rejected and removed successfully'
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error verifying institute:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Institute — get their own profile
exports.getMyInstitute = async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user.id })
      .populate('user', 'name email phone');

    if (!institute) {
      return res.status(404).json({ message: 'Institute not found' });
    }

    res.json(institute);
  } catch (error) {
    console.error('Error fetching institute:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Institute — update their own details
exports.updateInstitute = async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user.id });

    if (!institute) {
      return res.status(404).json({ message: 'Institute not found' });
    }

    const updatedInstitute = await Institute.findByIdAndUpdate(
      institute._id,
      { $set: req.body },
      { new: true }
    ).populate('user', 'name email phone');

    res.json({
      message: 'Institute updated successfully',
      institute: updatedInstitute
    });
  } catch (error) {
    console.error('Error updating institute:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Admin or Institute — get stats
exports.getInstituteStats = async (req, res) => {
  try {
    const instituteId = req.params.id || req.user.instituteId;

    const [reviews, enquiries, courses] = await Promise.all([
      Review.countDocuments({ institute: instituteId }),
      Enquiry.countDocuments({ institute: instituteId }),
      Course.countDocuments({ institute: instituteId })
    ]);

    res.json({
      success: true,
      data: { reviews, enquiries, courses }
    });
  } catch (error) {
    console.error('Error fetching institute stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
