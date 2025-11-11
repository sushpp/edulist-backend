const Institute = require('../models/Institute');
<<<<<<< HEAD
=======
<<<<<<< HEAD
const Course = require('../models/Course');

// Get all institutes (public route)
exports.getAllInstitutes = async (req, res) => {
  try {
    const { category, city, minFees, maxFees, facilities, rating } = req.query;
    
    let filter = { status: 'approved' };
    
    if (category) filter.category = category;
    if (city) filter['address.city'] = new RegExp(city, 'i');
    
    const institutes = await Institute.find(filter)
      .populate('user', 'name email phone')
      .lean();

    res.json(institutes);
  } catch (error) {
    console.error('Error fetching institutes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
=======
>>>>>>> c12b9554ad867aeeab065de4f2c4fbf7a05570bc
const User = require('../models/User');

// Get pending institutes for admin approval
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

// Get all institutes (verified only for public)
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
<<<<<<< HEAD
=======
>>>>>>> c15d45fca (Initial commit)
>>>>>>> c12b9554ad867aeeab065de4f2c4fbf7a05570bc
  }
};

// Get institute by ID
exports.getInstituteById = async (req, res) => {
  try {
<<<<<<< HEAD
=======
<<<<<<< HEAD
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

// Update institute profile
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

// Add facility
// Add facility
exports.addFacility = async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user.id });
    
    if (!institute) {
      return res.status(404).json({ message: 'Institute not found' });
    }

    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Facility name is required' });
    }

    const newFacility = {
      name,
      description: description || ''
    };

    institute.facilities.push(newFacility);
    await institute.save();

    res.json({
      message: 'Facility added successfully',
      facilities: institute.facilities
    });
  } catch (error) {
    console.error('Add facility error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove facility
exports.removeFacility = async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user.id });
    
    if (!institute) {
      return res.status(404).json({ message: 'Institute not found' });
    }

    const { facilityId } = req.params;
    
    institute.facilities = institute.facilities.filter(
      facility => facility._id.toString() !== facilityId
    );
    
    await institute.save();

    res.json({
      message: 'Facility removed successfully',
      facilities: institute.facilities
    });
  } catch (error) {
    console.error('Remove facility error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
=======
>>>>>>> c12b9554ad867aeeab065de4f2c4fbf7a05570bc
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

// Approve or reject institute
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
      // Delete the institute and user
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

// Get institute stats
exports.getInstituteStats = async (req, res) => {
  try {
    const instituteId = req.params.id;
    
    const Review = require('../models/Review');
    const Enquiry = require('../models/Enquiry');
    const Course = require('../models/Course');
    
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
<<<<<<< HEAD
=======
>>>>>>> c15d45fca (Initial commit)
>>>>>>> c12b9554ad867aeeab065de4f2c4fbf7a05570bc
  }
};