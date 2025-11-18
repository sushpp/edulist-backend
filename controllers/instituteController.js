// controllers/instituteController.js

const Institute = require('../models/Institute');
const Course = require('../models/Course');
const Facility = require('../models/Facility');
const Enquiry = require('../models/Enquiry');
const Review = require('../models/Review');

// @desc    Get a single institute by ID
// @route   GET /api/institutes/:id
// @access  Public
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

// @desc    Update an institute
// @route   PUT /api/institutes
// @access  Private
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
      await new Promise((resolve, reject) => {
        logo.mv(`./uploads/${logoName}`, (err) => {
          if (err) reject(err);
          resolve();
        });
      });
      instituteFields['media.logo'] = logoName;
    }

    // Handle images upload
    if (req.files && req.files.images) {
      const images = req.files.images;
      const imageNames = [];
      
      const imageArray = Array.isArray(images) ? images : [images];
      for (const image of imageArray) {
        const imageName = `image_${Date.now()}_${image.name}`;
        await new Promise((resolve, reject) => {
          image.mv(`./uploads/${imageName}`, (err) => {
            if (err) reject(err);
            resolve();
          });
        });
        imageNames.push(imageName);
      }
      instituteFields['media.images'] = imageNames;
    }

    let institute = await Institute.findOne({ userId: req.user.id });

    if (!institute) {
      return res.status(404).json({ msg: 'Institute not found' });
    }

    institute = await Institute.findOneAndUpdate(
      { userId: req.user.id },
      { $set: instituteFields },
      { new: true, runValidators: true }
    ).populate('facilities').populate('courses');

    res.json(institute);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get all institutes
// @route   GET /api/institutes
// @access  Public
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

// @desc    Get institute dashboard data
// @route   GET /api/institutes/dashboard/me
// @access  Private
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

// @desc    Create a new institute profile for a logged-in 'institute' user
// @route   POST /api/institutes
// @access  Private
const createInstitute = async (req, res, next) => {
  try {
    // The protect middleware should have attached the user to req.user
    if (!req.user || req.user.role !== 'institute') {
      return res.status(403).json({ message: 'Only institute users can create an institute profile.' });
    }

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

    // Basic validation
    if (!name || !category || !address || !city || !state || !contactInfo || !contactInfo.phone || !contactInfo.email) {
      return res.status(400).json({ message: 'Please provide all required institute information.' });
    }

    // Check if an institute profile already exists for this user
    const existingInstitute = await Institute.findOne({ userId: req.user.id });
    if (existingInstitute) {
      return res.status(400).json({ message: 'You have already created an institute profile.' });
    }

    // Create institute, linking it to the logged-in user's ID
    const instituteFields = {
      userId: req.user.id,
      name,
      category,
      affiliation,
      address,
      city,
      state,
      contactInfo,
      website,
      description,
    };

    // Handle logo upload
    let logoName;
    if (req.files && req.files.logo) {
      const logo = req.files.logo;
      logoName = `logo_${Date.now()}_${logo.name}`;
      await new Promise((resolve, reject) => {
        logo.mv(`./uploads/${logoName}`, (err) => {
          if (err) reject(err);
          resolve();
        });
      });
      instituteFields['media.logo'] = logoName;
    }

    const institute = new Institute(instituteFields);
    await institute.save();

    res.status(201).json({
      success: true,
      data: institute,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getInstituteById,
  updateInstitute,
  getInstitutes,
  getInstituteDashboard,
  createInstitute, // Add the new function to exports
};