const express = require('express');
const { auth, instituteAuth } = require('../middleware/auth');
const Course = require('../models/Course');
const Institute = require('../models/Institute');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// ===========================
// 🔹 PUBLIC ROUTES
// ===========================

// Get ALL courses (public) - ADD THIS MISSING ROUTE
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().populate('institute', 'name logo');
    
    // Add image URLs
    const coursesWithUrls = courses.map(course => ({
      ...course.toObject(),
      imageUrl: course.image ? `${req.protocol}://${req.get('host')}/uploads/${course.image.filename}` : null
    }));

    res.json({ 
      success: true, 
      courses: coursesWithUrls 
    });
  } catch (error) {
    console.error('Error fetching all courses:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      courses: [] 
    });
  }
});

// Get courses by a specific institute ID (for public view)
router.get('/institute/:instituteId', async (req, res) => {
  try {
    const courses = await Course.find({ institute: req.params.instituteId });
    
    // Add image URLs
    const coursesWithUrls = courses.map(course => ({
      ...course.toObject(),
      imageUrl: course.image ? `${req.protocol}://${req.get('host')}/uploads/${course.image.filename}` : null
    }));

    res.json({ 
      success: true, 
      courses: coursesWithUrls 
    });
  } catch (error) {
    console.error('Error fetching courses for institute:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      courses: [] 
    });
  }
});

// ===========================
// 🔹 INSTITUTE AUTH ROUTES
// ===========================

// Get all courses for the logged-in institute
router.get('/my', auth, instituteAuth, async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user._id });
    if (!institute) {
      return res.status(404).json({ 
        success: false,
        message: 'Institute profile not found', 
        courses: [] 
      });
    }

    const courses = await Course.find({ institute: institute._id });
    
    // Add image URLs
    const coursesWithUrls = courses.map(course => ({
      ...course.toObject(),
      imageUrl: course.image ? `${req.protocol}://${req.get('host')}/uploads/${course.image.filename}` : null
    }));

    res.json({ 
      success: true, 
      courses: coursesWithUrls 
    });
  } catch (error) {
    console.error('Error fetching my courses:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      courses: [] 
    });
  }
});

// Create a new course (WITH FILE UPLOAD)
router.post('/', auth, instituteAuth, upload.single('image'), async (req, res) => {
  try {
    console.log('🔍 Course creation request body:', req.body);
    console.log('🔍 Uploaded file:', req.file);

    const institute = await Institute.findOne({ user: req.user._id });
    if (!institute) {
      return res.status(404).json({ 
        success: false,
        message: 'Institute profile not found' 
      });
    }

    // Parse facilities and syllabus from JSON strings or arrays
    let facilities = [];
    let syllabus = [];
    
    if (req.body.facilities) {
      try {
        facilities = typeof req.body.facilities === 'string' 
          ? JSON.parse(req.body.facilities) 
          : req.body.facilities;
      } catch (parseError) {
        console.warn('Failed to parse facilities, using empty array');
      }
    }
    
    if (req.body.syllabus) {
      try {
        syllabus = typeof req.body.syllabus === 'string'
          ? JSON.parse(req.body.syllabus)
          : req.body.syllabus;
      } catch (parseError) {
        console.warn('Failed to parse syllabus, using empty array');
      }
    }

    // Validate required fields
    const requiredFields = ['title', 'description', 'duration', 'fees', 'category'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    const courseData = {
      institute: institute._id,
      title: req.body.title,
      description: req.body.description,
      duration: req.body.duration,
      fees: Number(req.body.fees),
      category: req.body.category,
      facilities: Array.isArray(facilities) ? facilities : [],
      syllabus: Array.isArray(syllabus) ? syllabus : [],
      eligibility: req.body.eligibility || ''
    };

    // Add image data if uploaded
    if (req.file) {
      courseData.image = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path
      };
    }

    const newCourse = new Course(courseData);
    const savedCourse = await newCourse.save();

    // Add image URL for response
    const responseCourse = {
      ...savedCourse.toObject(),
      imageUrl: savedCourse.image ? `${req.protocol}://${req.get('host')}/uploads/${savedCourse.image.filename}` : null
    };

    res.status(201).json({ 
      success: true, 
      course: responseCourse,
      message: 'Course created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating course:', error);
    
    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error creating course',
      error: error.message 
    });
  }
});

// Update a course (WITH FILE UPLOAD)
router.put('/:id', auth, instituteAuth, upload.single('image'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: 'Course not found' 
      });
    }

    const institute = await Institute.findOne({ user: req.user._id });
    if (!institute || course.institute.toString() !== institute._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this course' 
      });
    }

    // Parse facilities and syllabus
    let updateData = { ...req.body };
    
    if (req.body.facilities) {
      try {
        updateData.facilities = typeof req.body.facilities === 'string'
          ? JSON.parse(req.body.facilities)
          : req.body.facilities;
      } catch (e) {
        updateData.facilities = [];
      }
    }
    
    if (req.body.syllabus) {
      try {
        updateData.syllabus = typeof req.body.syllabus === 'string'
          ? JSON.parse(req.body.syllabus)
          : req.body.syllabus;
      } catch (e) {
        updateData.syllabus = [];
      }
    }

    // Convert fees to number
    if (req.body.fees) {
      updateData.fees = Number(req.body.fees);
    }

    // Update image if new file uploaded
    if (req.file) {
      updateData.image = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path
      };
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Add image URL for response
    const responseCourse = {
      ...updatedCourse.toObject(),
      imageUrl: updatedCourse.image ? `${req.protocol}://${req.get('host')}/uploads/${updatedCourse.image.filename}` : null
    };

    res.json({ 
      success: true, 
      course: responseCourse,
      message: 'Course updated successfully'
    });

  } catch (error) {
    console.error('Error updating course:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error updating course' 
    });
  }
});

// Delete a course
router.delete('/:id', auth, instituteAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: 'Course not found' 
      });
    }

    const institute = await Institute.findOne({ user: req.user._id });
    if (course.institute.toString() !== institute._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this course' 
      });
    }

    await Course.findByIdAndDelete(req.params.id);
    res.json({ 
      success: true, 
      message: 'Course deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error deleting course' 
    });
  }
});

module.exports = router;