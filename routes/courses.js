const express = require('express');
const { auth, instituteAuth } = require('../middleware/auth');
const Course = require('../models/Course'); // Assuming you have a Course model
const Institute = require('../models/Institute');

const router = express.Router();

// ===========================
// 🔹 PUBLIC ROUTES
// ===========================

// Get courses by a specific institute ID (for public view)
router.get('/institute/:instituteId', async (req, res) => {
  try {
    const courses = await Course.find({ institute: req.params.instituteId });
    res.json({ success: true, courses });
  } catch (error) {
    console.error('Error fetching courses for institute:', error);
    res.status(500).json({ message: 'Server error', courses: [] });
  }
});

// ===========================
// 🔹 INSTITUTE AUTH ROUTES
// ===========================

// 🔥 IMPORTANT: This is the route your frontend calls for the dashboard
// Get all courses for the logged-in institute
router.get('/my', auth, instituteAuth, async (req, res) => {
  try {
    // Find the institute document associated with the logged-in user
    const institute = await Institute.findOne({ user: req.user._id });
    if (!institute) {
      return res.status(404).json({ message: 'Institute profile not found', courses: [] });
    }

    // Find all courses that belong to this institute
    const courses = await Course.find({ institute: institute._id });
    res.json({ success: true, courses });
  } catch (error) {
    console.error('Error fetching my courses:', error);
    res.status(500).json({ message: 'Server error', courses: [] });
  }
});

// Create a new course
router.post('/', auth, instituteAuth, async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user._id });
    if (!institute) {
      return res.status(404).json({ message: 'Institute profile not found' });
    }

    const newCourse = new Course({
      ...req.body,
      institute: institute._id, // Associate the course with the institute
    });

    const savedCourse = await newCourse.save();
    res.status(201).json({ success: true, course: savedCourse });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a course
router.put('/:id', auth, instituteAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Optional: Add a check to ensure the user owns this course
    const institute = await Institute.findOne({ user: req.user._id });
    if (course.institute.toString() !== institute._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, course: updatedCourse });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a course
router.delete('/:id', auth, instituteAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Optional: Add a check to ensure the user owns this course
    const institute = await Institute.findOne({ user: req.user._id });
    if (course.institute.toString() !== institute._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }

    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;