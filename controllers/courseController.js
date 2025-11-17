const Course = require('../models/Course');
const Institute = require('../models/Institute');

// Create Course
const createCourse = async (req, res) => {
  try {
    const { title, description, duration, fees } = req.body;

    // Get institute for this user
    const institute = await Institute.findOne({ userId: req.user.id });
    if (!institute) {
      return res.status(404).json({ msg: 'Institute not found' });
    }

    // Handle image upload
    let imageName = '';
    if (req.files && req.files.image) {
      const image = req.files.image;
      imageName = `course_${Date.now()}_${image.name}`;
      image.mv(`./uploads/${imageName}`, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Server error');
        }
      });
    }

    // Create new course
    const newCourse = new Course({
      title,
      description,
      duration,
      fees,
      image: imageName,
      instituteId: institute._id,
    });

    const course = await newCourse.save();

    // Add course to institute
    await Institute.findByIdAndUpdate(
      institute._id,
      { $push: { courses: course._id } }
    );

    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get All Courses for Institute
const getCourses = async (req, res) => {
  try {
    // Get institute for this user
    const institute = await Institute.findOne({ userId: req.user.id });
    if (!institute) {
      return res.status(404).json({ msg: 'Institute not found' });
    }

    const courses = await Course.find({ instituteId: institute._id });
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update Course
const updateCourse = async (req, res) => {
  try {
    const { title, description, duration, fees } = req.body;
    const { id } = req.params;

    // Build course object
    const courseFields = {};
    if (title) courseFields.title = title;
    if (description) courseFields.description = description;
    if (duration) courseFields.duration = duration;
    if (fees) courseFields.fees = fees;

    // Handle image upload
    if (req.files && req.files.image) {
      const image = req.files.image;
      const imageName = `course_${Date.now()}_${image.name}`;
      image.mv(`./uploads/${imageName}`, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Server error');
        }
      });
      courseFields.image = imageName;
    }

    // Get institute for this user
    const institute = await Institute.findOne({ userId: req.user.id });
    if (!institute) {
      return res.status(404).json({ msg: 'Institute not found' });
    }

    let course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    // Check if course belongs to this institute
    if (course.instituteId.toString() !== institute._id.toString()) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    course = await Course.findByIdAndUpdate(
      id,
      { $set: courseFields },
      { new: true }
    );

    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete Course
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Get institute for this user
    const institute = await Institute.findOne({ userId: req.user.id });
    if (!institute) {
      return res.status(404).json({ msg: 'Institute not found' });
    }

    let course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    // Check if course belongs to this institute
    if (course.instituteId.toString() !== institute._id.toString()) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Course.findByIdAndDelete(id);

    // Remove course from institute
    await Institute.findByIdAndUpdate(
      institute._id,
      { $pull: { courses: id } }
    );

    res.json({ msg: 'Course removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  createCourse,
  getCourses,
  updateCourse,
  deleteCourse,
};