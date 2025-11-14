const express = require("express");
const router = express.Router();
const multer = require("multer");

const { auth, instituteAuth } = require("../middleware/auth");
const courseController = require("../controllers/courseController");

/*==============================
  MULTER SETUP
===============================*/
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/courses"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

/*==============================
  ROUTES
===============================*/

// Get ALL courses (admin/debug)
router.get("/", courseController.getInstituteCourses);

// Get logged-in institute's courses
router.get("/my", auth, instituteAuth, courseController.getCoursesByInstitute);

// Public - get courses for any institute
router.get("/institute/:instituteId", courseController.getInstituteCourses);

// Create a course
router.post(
  "/",
  auth,
  instituteAuth,
  upload.single("image"),
  courseController.createCourse
);

// Update
router.put(
  "/:id",
  auth,
  instituteAuth,
  upload.single("image"),
  courseController.updateCourse
);

// Delete
router.delete(
  "/:id",
  auth,
  instituteAuth,
  courseController.deleteCourse
);

module.exports = router;
