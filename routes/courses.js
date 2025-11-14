// routes/courses.js
const express = require('express');
const router = express.Router();
const course = require('../controllers/courseController');
const { auth, instituteAuth } = require('../middleware/auth');

// Admin / debug
router.get('/', course.getAll);

// Logged-in institute routes
router.get('/my', auth, instituteAuth, course.getMyCourses);
router.post('/', auth, instituteAuth, course.createCourse);
router.put('/:id', auth, instituteAuth, course.update);
router.delete('/:id', auth, instituteAuth, course.remove);

// Public
router.get('/institute/:instituteId', course.getByInstitute);

module.exports = router;
