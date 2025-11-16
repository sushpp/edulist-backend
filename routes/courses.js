const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, instituteAuth } = require('../middleware/auth');
const courseCtrl = require('../controllers/courseController');

// Ensure upload folder exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'courses');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Public
router.get('/institute/:instituteId', courseCtrl.getByInstitute);

// Admin / Debug
router.get('/', courseCtrl.getAllCourses);

// Institute routes
router.get('/my', auth, instituteAuth, courseCtrl.getMyCourses);
router.post('/', auth, instituteAuth, upload.single('image'), courseCtrl.createCourse);
router.put('/:id', auth, instituteAuth, upload.single('image'), courseCtrl.updateCourse);
router.delete('/:id', auth, instituteAuth, courseCtrl.deleteCourse);

module.exports = router;
