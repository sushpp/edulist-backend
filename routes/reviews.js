const express = require('express');
const router = express.Router();
const {
  createReview,
  getInstituteReviews,
  getAllReviews,
  moderateReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController'); // make sure the path is correct
const { auth } = require('../middleware/auth');

// Routes
router.post('/', auth, createReview);
router.get('/institute/:instituteId', getInstituteReviews);
router.get('/all', auth, getAllReviews); // admin route
router.put('/moderate/:id', auth, moderateReview); // admin route
router.put('/:id', auth, updateReview);
router.delete('/:id', auth, deleteReview);

module.exports = router;
