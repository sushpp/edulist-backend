const Course = require('../models/Course');
const Institute = require('../models/Institute');

/*==========================================
  CREATE COURSE
===========================================*/
exports.createCourse = async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user.id });

    if (!institute) {
      return res.status(404).json({ message: "Institute not found" });
    }

    const facilities = JSON.parse(req.body.facilities || "[]");
    const syllabus = JSON.parse(req.body.syllabus || "[]");

    const newCourse = new Course({
      institute: institute._id,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      fees: req.body.fees,
      duration: req.body.duration,
      eligibility: req.body.eligibility,
      facilities,
      syllabus,
    });

    // Save image metadata
    if (req.file) {
      newCourse.image = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
      };
    }

    await newCourse.save();

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course: newCourse
    });

  } catch (err) {
    res.status(500).json({ message: "Create course error", error: err.message });
  }
};

/*==========================================
  UPDATE COURSE
===========================================*/
exports.updateCourse = async (req, res) => {
  try {
    const facilities = JSON.parse(req.body.facilities || "[]");
    const syllabus = JSON.parse(req.body.syllabus || "[]");

    const updateData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      fees: req.body.fees,
      duration: req.body.duration,
      eligibility: req.body.eligibility,
      facilities,
      syllabus
    };

    if (req.file) {
      updateData.image = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path
      };
    }

    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({ success: true, course: updated });

  } catch (err) {
    res.status(500).json({ message: "Update course error", error: err.message });
  }
};

/*==========================================
  GET COURSES FOR LOGGED-IN INSTITUTE
===========================================*/
exports.getCoursesByInstitute = async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user.id });

    const courses = await Course.find({ institute: institute._id });

    // Add imageURL
    const withUrl = courses.map(c => ({
      ...c.toObject(),
      imageUrl: c.image ? `${req.protocol}://${req.get("host")}/uploads/courses/${c.image.filename}` : null
    }));

    res.json({ success: true, courses: withUrl });

  } catch (err) {
    res.status(500).json({ message: "Get courses error", error: err.message });
  }
};

/*==========================================
  GET COURSES BY INSTITUTE ID (PUBLIC)
===========================================*/
exports.getInstituteCourses = async (req, res) => {
  try {
    const courses = await Course.find({ institute: req.params.instituteId });

    const withUrl = courses.map(c => ({
      ...c.toObject(),
      imageUrl: c.image ? `${req.protocol}://${req.get("host")}/uploads/courses/${c.image.filename}` : null
    }));

    res.json({ success: true, courses: withUrl });

  } catch (err) {
    res.status(500).json({ message: "Get public courses error", error: err.message });
  }
};

/*==========================================
  DELETE COURSE
===========================================*/
exports.deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Course deleted" });

  } catch (err) {
    res.status(500).json({ message: "Delete course error", error: err.message });
  }
};
