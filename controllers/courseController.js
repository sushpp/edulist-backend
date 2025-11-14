// controllers/courseController.js
const Course = require('../models/Course');
const Institute = require('../models/Institute');

exports.createCourse = async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user._id });
    if (!institute) return res.status(404).json({ success: false, message: 'Institute not found' });

    const payload = {
      institute: institute._id,
      name: req.body.name || req.body.title || 'Untitled',
      description: req.body.description || '',
      duration: req.body.duration || '',
      fees: req.body.fees || 0,
      mode: req.body.mode || 'offline'
    };

    const course = await Course.create(payload);
    // Optionally push to institute.courses
    institute.courses = institute.courses || [];
    institute.courses.push(course._id);
    await institute.save();

    res.status(201).json({ success: true, course });
  } catch (err) {
    console.error('course.create error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMyCourses = async (req, res) => {
  try {
    const inst = await Institute.findOne({ user: req.user._id });
    if (!inst) return res.status(404).json({ success: false, message: 'Institute not found' });

    const courses = await Course.find({ institute: inst._id }).sort({ createdAt: -1 });
    res.json({ success: true, courses });
  } catch (err) {
    console.error('course.getMyCourses error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getByInstitute = async (req, res) => {
  try {
    const courses = await Course.find({ institute: req.params.instituteId }).sort({ createdAt: -1 });
    res.json({ success: true, courses });
  } catch (err) {
    console.error('course.getByInstitute error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const courses = await Course.find().populate('institute', 'name').sort({ createdAt: -1 });
    res.json({ success: true, courses });
  } catch (err) {
    console.error('course.getAll error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course: updated });
  } catch (err) {
    console.error('course.update error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    await Course.findByIdAndDelete(req.params.id);

    // also remove from institute.courses if present
    await Institute.updateOne({ _id: course.institute }, { $pull: { courses: course._id } });

    res.json({ success: true, message: 'Course deleted' });
  } catch (err) {
    console.error('course.remove error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
