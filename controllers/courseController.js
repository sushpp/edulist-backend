const Course = require('../models/Course');
const Institute = require('../models/Institute');
const path = require('path');

// ✅ Create a new course (with optional image upload)
exports.createCourse = async (req, res) => {
  try {
    // Find the institute of the logged-in user
    const institute = await Institute.findOne({ user: req.user.id });
    if (!institute) {
      return res.status(404).json({ message: 'Institute not found' });
    }

    const courseData = {
      institute: institute._id,
      ...req.body
    };

    // Add uploaded image if available
    if (req.file) {
      courseData.image = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path
      };
    }

    const course = new Course(courseData);
    await course.save();

    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('❌ Create course error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Update a course (with optional image update)
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const institute = await Institute.findOne({ user: req.user.id });
    if (!institute || course.institute.toString() !== institute._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updateData = { ...req.body };

    // Replace image if uploaded
    if (req.file) {
      updateData.image = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path
      };
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    res.json({
      message: 'Course updated successfully',
      course: updatedCourse
    });
  } catch (error) {
    console.error('❌ Update course error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Get all courses for the logged-in institute
exports.getCoursesByInstitute = async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user.id });
    if (!institute) {
      return res.status(404).json({ message: 'Institute not found' });
    }

    const courses = await Course.find({ institute: institute._id });

    // Add full image URLs for frontend
    const coursesWithImageUrls = courses.map(course => ({
      ...course.toObject(),
      imageUrl: course.image
        ? `${req.protocol}://${req.get('host')}/uploads/${course.image.filename}`
        : null
    }));

    res.json(coursesWithImageUrls);
  } catch (error) {
    console.error('❌ Get courses error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Get all courses by a specific institute (public API)
exports.getInstituteCourses = async (req, res) => {
  try {
    const { instituteId } = req.params;
    const courses = await Course.find({ institute: instituteId });

    const coursesWithImageUrls = courses.map(course => ({
      ...course.toObject(),
      imageUrl: course.image
        ? `${req.protocol}://${req.get('host')}/uploads/${course.image.filename}`
        : null
    }));

    res.json(coursesWithImageUrls);
  } catch (error) {
    console.error('❌ Get institute courses error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Delete a course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const institute = await Institute.findOne({ user: req.user.id });
    if (!institute || course.institute.toString() !== institute._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('❌ Delete course error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
