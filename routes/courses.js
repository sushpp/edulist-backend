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

router.post('/', auth, instituteAuth, upload.single('image'), createCourse);
router.get('/institute', auth, instituteAuth, getCoursesByInstitute);
router.get('/institute/:instituteId', getInstituteCourses);
router.put('/:id', auth, instituteAuth, upload.single('image'), updateCourse);
router.delete('/:id', auth, instituteAuth, deleteCourse);

module.exports = router;