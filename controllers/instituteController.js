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

    // VALIDATION
    if (!name || !category || !address || !city || !state || !description) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }
    if (!contactInfo || !contactInfo.phone || !contactInfo.email) {
      return res.status(400).json({ message: 'Please provide contact phone and email.' });
    }
    if (!req.files || !req.files.logo) {
      return res.status(400).json({ message: 'Please upload institute logo.' });
    }

    // Upload Logo
    const logo = req.files.logo;
    const logoName = `logo_${Date.now()}_${logo.name}`;
    await new Promise((resolve, reject) => {
      logo.mv(`./uploads/${logoName}`, (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    // Upload Images
    let imageNames = [];
    if (req.files && req.files.images) {
      const images = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];

      for (const img of images) {
        const imgName = `image_${Date.now()}_${img.name}`;
        await new Promise((resolve, reject) => {
          img.mv(`./uploads/${imgName}`, (err) => {
            if (err) reject(err);
            resolve();
          });
        });
        imageNames.push(imgName);
      }
    }

    // CREATE INSTITUTE WITH CORRECT DEFAULTS
    const institute = new Institute({
      name,
      category,
      affiliation,
      address,
      city,
      state,
      contactInfo,
      website,
      description,
      userId: req.user.id, // logged in user creating institute
      verifiedStatus: "pending",        // ⭐ FIX ADDED
      media: {
        logo: logoName,
        images: imageNames
      }
    });

    await institute.save();

    return res.status(201).json({
      success: true,
      message: "Institute submitted successfully. Waiting for admin approval.",
      institute
    });

  } catch (err) {
    console.error(err.message);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation Error",
        errors: Object.values(err.errors).map((e) => e.message)
      });
    }

    res.status(500).json({ message: "Server Error" });
  }
};

// ------------------------------------------------------
// REMAINING FUNCTIONS (UNCHANGED, JUST CLEANED)
// ------------------------------------------------------

const getInstituteById = async (req, res) => {
  try {
    const institute = await Institute.findById(req.params.id)
      .populate("facilities")
      .populate("courses")
      .populate("userId", "name email phone");

    if (!institute) {
      return res.status(404).json({ msg: "Institute not found" });
    }

    res.json(institute);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

const updateInstitute = async (req, res) => {
  try {
    let institute = await Institute.findOne({ userId: req.user.id });

    if (!institute) {
      return res.status(404).json({ msg: "Institute not found" });
    }

    const updateFields = { ...req.body };

    // Logo Update
    if (req.files && req.files.logo) {
      const logo = req.files.logo;
      const logoName = `logo_${Date.now()}_${logo.name}`;
      await new Promise((resolve, reject) => {
        logo.mv(`./uploads/${logoName}`, (err) => {
          if (err) reject(err);
          resolve();
        });
      });
      updateFields["media.logo"] = logoName;
    }

    // Images Update
    if (req.files && req.files.images) {
      const images = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];

      let imageNames = [];
      for (const img of images) {
        const imgName = `image_${Date.now()}_${img.name}`;
        await new Promise((resolve, reject) => {
          img.mv(`./uploads/${imgName}`, (err) => {
            if (err) reject(err);
            resolve();
          });
        });
        imageNames.push(imgName);
      }

      updateFields["media.images"] = imageNames;
    }

    institute = await Institute.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.json(institute);
  } catch (err) {
    console.error(err.message);

    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: "Validation Error", errors });
    }

    res.status(500).json({ message: "Server Error" });
  }
};

const getInstitutes = async (req, res) => {
  try {
    const { search, city, category, board } = req.query;

    const query = { verifiedStatus: "approved" };

    if (search) query.name = { $regex: search, $options: "i" };
    if (city) query.city = { $regex: city, $options: "i" };
    if (category) query.category = { $regex: category, $options: "i" };
    if (board) query.affiliation = { $regex: board, $options: "i" };

    const institutes = await Institute.find(query)
      .populate("facilities")
      .populate("courses");

    res.json(institutes);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

const getInstituteDashboard = async (req, res) => {
  try {
    const institute = await Institute.findOne({ userId: req.user.id })
      .populate("facilities")
      .populate("courses");

    if (!institute) {
      return res.status(404).json({ msg: "Institute not found" });
    }

    const enquiries = await Enquiry.find({ instituteId: institute._id })
      .populate("userId", "name email phone")
      .sort({ date: -1 });

    const reviews = await Review.find({ instituteId: institute._id })
      .populate("userId", "name")
      .sort({ date: -1 });

    let avgRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      avgRating = totalRating / reviews.length;
    }

    res.json({
      institute,
      enquiries,
      reviews,
      avgRating,
      totalEnquiries: enquiries.length,
      totalReviews: reviews.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  createInstitute,
  getInstituteById,
  updateInstitute,
  getInstitutes,
  getInstituteDashboard
};
