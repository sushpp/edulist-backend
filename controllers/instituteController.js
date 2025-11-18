// controllers/instituteController.js

const Institute = require('../models/Institute');
const Course = require('../models/Course');
const Facility = require('../models/Facility');
const Enquiry = require('../models/Enquiry');
const Review = require('../models/Review');

// @desc    Create a new Institute
// @route   POST /api/institutes
// @access  Private
const createInstitute = async (req, res) => {
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

    // --- VALIDATION ---
    // Check for all required fields based on the schema
    if (!name || !category || !address || !city || !state || !description) {
      return res.status(400).json({ message: 'Please provide all required text fields.' });
    }
    if (!contactInfo || !contactInfo.phone || !contactInfo.email) {
      return res.status(400).json({ message: 'Please provide contact phone and email.' });
    }
    if (!req.files || !req.files.logo) {
      return res.status(400).json({ message: 'Please add a logo.' });
    }
    // --- END VALIDATION ---

    // Handle logo upload
    const logo = req.files.logo;
    const logoName = `logo_${Date.now()}_${logo.name}`;
    // Use a promise wrapper for mv to use async/await
    await new Promise((resolve, reject) => {
      logo.mv(`./uploads/${logoName}`, (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    // Handle images upload (optional)
    let imageNames = [];
    if (req.files && req.files.images) {
      const images = req.files.images;
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
    }

    // Create institute object
    const instituteFields = {
      name,
      category,
      affiliation,
      address,
      city,
      state,
      contactInfo,
      website,
      description,
      userId: req.user.id, // Assuming auth middleware adds req.user.id
      media: {
        logo: logoName,
        images: imageNames,
      },
    };

    const institute = new Institute(instituteFields);
    await institute.save();

    res.status(201).json(institute);
  } catch (err) {
    console.error(err.message);
    // This is where the validation error would be caught if not handled above
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ message: 'Validation Error', errors });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

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
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update Institute
const updateInstitute = async (req, res) => {
  try {
    let institute = await Institute.findOne({ userId: req.user.id });

    if (!institute) {
      return res.status(404).json({ msg: 'Institute not found' });
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

    // Build institute object with only the fields that are being updated
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

    // Handle logo upload (if a new one is provided)
    if (req.files && req.files.logo) {
      const logo = req.files.logo;
      const logoName = `logo_${Date.now()}_${logo.name}`;
      await new Promise((resolve, reject) => {
        logo.mv(`./uploads/${logoName}`, (err) => {
          if (err) reject(err);
          resolve();
        });
      });
      instituteFields['media.logo'] = logoName; // Use dot notation for nested object
    }

    // Handle images upload (if new ones are provided)
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

    institute = await Institute.findOneAndUpdate(
      { userId: req.user.id },
      { $set: instituteFields },
      { new: true, runValidators: true } // runValidators ensures schema rules are applied on update
    ).populate('facilities').populate('courses');

    res.json(institute);
  } catch (err) {
    console.error(err.message);
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ message: 'Validation Error', errors });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get Institutes
const getInstitutes = async (req, res) => {
  try {
    const { search, city, category, board } = req.query;
    
    const query = { verifiedStatus: 'approved' }; // Assuming you have a verifiedStatus field
    
    if (search) query.name = { $regex: search, $options: 'i' };
    if (city) query.city = { $regex: city, $options: 'i' };
    if (category) query.category = { $regex: category, $options: 'i' };
    if (board) query.affiliation = { $regex: board, $options: 'i' };

    const institutes = await Institute.find(query)
      .populate('facilities')
      .populate('courses');

    res.json(institutes);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
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

    const enquiries = await Enquiry.find({ instituteId: institute._id })
      .populate('userId', 'name email phone')
      .sort({ date: -1 });

    const reviews = await Review.find({ instituteId: institute._id })
      .populate('userId', 'name')
      .sort({ date: -1 });

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
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createInstitute, // Export the new function
  getInstituteById,
  updateInstitute,
  getInstitutes,
  getInstituteDashboard,
};