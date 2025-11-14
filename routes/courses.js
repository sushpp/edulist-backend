// routes/courseRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { auth, instituteAuth } = require("../middleware/auth");

const Course = require("../models/Course");
const Institute = require("../models/Institute");

/* ===========================
    MULTER SETUP
=========================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/courses"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

/* ===========================
   GET ALL COURSES (ADMIN/Debug)
=========================== */
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("institute", "name address user")
      .sort({ createdAt: -1 });

    res.json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
});

/* ===========================
   GET MY COURSES (INSTITUTE)
=========================== */
router.get("/my", auth, instituteAuth, async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user._id });

    if (!institute) {
      return res.status(404).json({
        success: false,
        message: "Institute not found for this user",
      });
    }

    const courses = await Course.find({ institute: institute._id }).sort({
      createdAt: -1,
    });

    res.json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
});

/* ===========================
   GET COURSES BY INSTITUTE ID (PUBLIC)
=========================== */
router.get("/institute/:instituteId", async (req, res) => {
  try {
    const courses = await Course.find({
      institute: req.params.instituteId,
    }).sort({ createdAt: -1 });

    if (!courses.length) {
      return res.status(404).json({
        success: false,
        message: "No courses found for this institute",
      });
    }

    res.json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
});

/* ===========================
   CREATE A COURSE
=========================== */
router.post("/", auth, instituteAuth, upload.single("image"), async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user._id });

    if (!institute) {
      return res.status(404).json({
        success: false,
        message: "Institute profile not found",
      });
    }

    const facilitiesArray = JSON.parse(req.body.facilities || "[]");
    const syllabusArray = JSON.parse(req.body.syllabus || "[]");

    const newCourse = new Course({
      institute: institute._id,
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      fees: req.body.fees,
      duration: req.body.duration,
      facilities: facilitiesArray,
      syllabus: syllabusArray,
      image: req.file ? req.file.filename : null,
    });

    await newCourse.save();

    res.json({ success: true, message: "Course created", course: newCourse });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error creating course",
      error: err.message,
    });
  }
});

/* ===========================
   UPDATE COURSE
=========================== */
router.put("/:id", auth, instituteAuth, upload.single("image"), async (req, res) => {
  try {
    const facilitiesArray = JSON.parse(req.body.facilities || "[]");
    const syllabusArray = JSON.parse(req.body.syllabus || "[]");

    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        facilities: facilitiesArray,
        syllabus: syllabusArray,
        image: req.file ? req.file.filename : undefined,
      },
      { new: true }
    );

    res.json({ success: true, course: updated });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Update failed",
      error: err.message,
    });
  }
});

/* ===========================
   DELETE COURSE
=========================== */
router.delete("/:id", auth, instituteAuth, async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Course deleted" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: err.message,
    });
  }
});

module.exports = router;
