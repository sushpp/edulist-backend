const Institute = require('../models/Institute');
const Course = require('../models/Course');
const Facility = require('../models/Facility');
const Enquiry = require('../models/Enquiry');
const Review = require('../models/Review');

// Get Institute by ID
const getInstituteById = async (req, res) => {
  try {
    const institute = await Institute.findById(req.params.id)
      .populate('facilities')
      .populate('courses')
      .populate('userId', 'name email phone');

    if (!institute) {
      return res.status(404).json({ msg: 'Institute not found' });
    }

    res.json(institute);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update Institute
const updateInstitute = async (req, res) => {
  try {
    const {
      name,
      category,
      affiliation,
      address,
      city,
      state,
      contactInfo,
      website,
      description,
    } = req.body;

    // Build institute object
    const instituteFields = {};
    if (name) instituteFields.name = name;
    if (category) instituteFields.category = category;
    if (affiliation) instituteFields.affiliation = affiliation;
    if (address) instituteFields.address = address;
    if (city) instituteFields.city = city;
    if (state) instituteFields.state = state;
    if (contactInfo) instituteFields.contactInfo = contactInfo;
    if (website) instituteFields.website = website;
    if (description) instituteFields.description = description;

    // Handle logo upload
    if (req.files && req.files.logo) {
      const logo = req.files.logo;
      const logoName = `logo_${Date.now()}_${logo.name}`;
      logo.mv(`./uploads/${logoName}`, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Server error');
        }
      });
      instituteFields.logo = logoName;
    }

    // Handle images upload
    if (req.files && req.files.images) {
      const images = req.files.images;
      const imageNames = [];
      
      if (Array.isArray(images)) {
        for (const image of images) {
          const imageName = `image_${Date.now()}_${image.name}`;
          image.mv(`./uploads/${imageName}`, (err) => {
            if (err) {
              console.error(err);
              return res.status(500).send('Server error');
            }
          });
          imageNames.push(imageName);
        }
      } else {
        const imageName = `image_${Date.now()}_${images.name}`;
        images.mv(`./uploads/${imageName}`, (err) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Server error');
          }
        });
        imageNames.push(imageName);
      }
      
      instituteFields.images = imageNames;
    }

    let institute = await Institute.findOne({ userId: req.user.id });

    if (!institute) {
      return res.status(404).json({ msg: 'Institute not found' });
    }

    institute = await Institute.findOneAndUpdate(
      { userId: req.user.id },
      { $set: instituteFields },
      { new: true }
    ).populate('facilities').populate('courses');

    res.json(institute);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get Institutes
const getInstitutes = async (req, res) => {
  try {
    const { search, city, category, board } = req.query;
    
    // Build query
    const query = { verifiedStatus: 'approved' };
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }
    
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }
    
    if (board) {
      query.affiliation = { $regex: board, $options: 'i' };
    }

    const institutes = await Institute.find(query)
      .populate('facilities')
      .populate('courses');

    res.json(institutes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get Institute Dashboard Data
const getInstituteDashboard = async (req, res) => {
  try {
    const institute = await Institute.findOne({ userId: req.user.id })
      .populate('facilities')
      .populate('courses');

    if (!institute) {
      return res.status(404).json({ msg: 'Institute not found' });
    }

    // Get enquiries
    const enquiries = await Enquiry.find({ instituteId: institute._id })
      .populate('userId', 'name email phone')
      .sort({ date: -1 });

    // Get reviews
    const reviews = await Review.find({ instituteId: institute._id })
      .populate('userId', 'name')
      .sort({ date: -1 });

    // Calculate average rating
    let avgRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      avgRating = totalRating / reviews.length;
    }

    res.json({
      institute,
      enquiries,
      reviews,
      avgRating,
      totalEnquiries: enquiries.length,
      totalReviews: reviews.length,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getInstituteById,
  updateInstitute,
  getInstitutes,
  getInstituteDashboard,
};