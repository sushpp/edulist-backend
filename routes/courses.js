const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  createCourse,
  getCourses,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');

// Create course
router.post('/', auth, createCourse);

// Get all courses for institute
router.get('/', auth, getCourses);

// Update course
router.put('/:id', auth, updateCourse);

// Delete course
router.delete('/:id', auth, deleteCourse);

module.exports = router;