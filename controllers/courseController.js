const Course = require('../models/Course');
const Institute = require('../models/Institute');

// Create course
exports.createCourse = async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user._id });
    if (!institute) return res.status(404).json({ success: false, message: 'Institute not found' });

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
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('institute', 'name').sort({ createdAt: -1 });
    res.json({ success: true, courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get courses by institute
exports.getByInstitute = async (req, res) => {
  try {
    const courses = await Course.find({ institute: req.params.instituteId }).sort({ createdAt: -1 });
    res.json({ success: true, courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get my courses
exports.getMyCourses = async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user._id });
    if (!institute) return res.status(404).json({ success: false, message: 'Institute not found' });

    const courses = await Course.find({ institute: institute._id }).sort({ createdAt: -1 });
    res.json({ success: true, courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      facilities: req.body.facilities ? JSON.parse(req.body.facilities) : undefined,
      syllabus: req.body.syllabus ? JSON.parse(req.body.syllabus) : undefined,
      imageUrl: req.body.imageUrl || (req.file ? `/uploads/courses/${req.file.filename}` : undefined)
    };

    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

    const updated = await Course.findByIdAndUpdate(req.params.id, payload, { new: true });
    res.json({ success: true, course: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
