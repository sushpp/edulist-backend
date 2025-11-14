// controllers/courseController.js
const Course = require('../models/Course');
const Institute = require('../models/Institute');

exports.createCourse = async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user._id });
    if (!institute) return res.status(404).json({ success: false, message: 'Institute not found' });

    // Accept either imageUrl in body or uploaded file handling
    const payload = {
      institute: institute._id,
      name: req.body.name,
      description: req.body.description || '',
      category: req.body.category || '',
      duration: req.body.duration || '',
      fees: req.body.fees || 0,
      imageUrl: req.body.imageUrl || (req.file ? `/uploads/courses/${req.file.filename}` : ''),
      facilities: req.body.facilities ? JSON.parse(req.body.facilities) : [],
      syllabus: req.body.syllabus ? JSON.parse(req.body.syllabus) : []
    };

    const course = await Course.create(payload);
    res.status(201).json({ success: true, course });
  } catch (err) {
    console.error('course.create error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyCourses = async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user._id });
    if (!institute) return res.status(404).json({ success: false, message: 'Institute not found' });

    const courses = await Course.find({ institute: institute._id }).sort({ createdAt: -1 });
    res.json({ success: true, courses });
  } catch (err) {
    console.error('course.getMyCourses error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getByInstitute = async (req, res) => {
  try {
    const courses = await Course.find({ institute: req.params.instituteId }).sort({ createdAt: -1 });
    // If none found, return empty array rather than 404 (frontend expects array)
    res.json({ success: true, courses: Array.isArray(courses) ? courses : [] });
  } catch (err) {
    console.error('course.getByInstitute error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('institute', 'name').sort({ createdAt: -1 });
    res.json({ success: true, courses });
  } catch (err) {
    console.error('course.getAllCourses error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      facilities: req.body.facilities ? JSON.parse(req.body.facilities) : undefined,
      syllabus: req.body.syllabus ? JSON.parse(req.body.syllabus) : undefined,
      imageUrl: req.body.imageUrl || (req.file ? `/uploads/courses/${req.file.filename}` : undefined)
    };

    // Remove undefined props so they don't overwrite
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

    const updated = await Course.findByIdAndUpdate(req.params.id, payload, { new: true });
    res.json({ success: true, course: updated });
  } catch (err) {
    console.error('course.updateCourse error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Course deleted' });
  } catch (err) {
    console.error('course.deleteCourse error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
