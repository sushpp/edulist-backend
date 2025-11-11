const express = require('express');
const {
  createCourse,
  getCoursesByInstitute,
  updateCourse,
  deleteCourse,
  getInstituteCourses
} = require('../controllers/courseController');
const { auth, instituteAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Create a new course (with image upload)
router.post('/', auth, instituteAuth, upload.single('image'), createCourse);

// Get all courses for logged-in institute
router.get('/institute', auth, instituteAuth, getCoursesByInstitute);

// Get courses by public institute ID
router.get('/institute/:instituteId', getInstituteCourses);

// Update course (with image upload)
router.put('/:id', auth, instituteAuth, upload.single('image'), updateCourse);

// Delete course
router.delete('/:id', auth, instituteAuth, deleteCourse);

module.exports = router;
