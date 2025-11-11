const express = require('express');
const {
  createReview,
  getInstituteReviews,
  getUserReviews,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create a new review
router.post('/', auth, createReview);

// Get all reviews for a specific institute (public)
router.get('/institute/:instituteId', getInstituteReviews);

// Get all reviews created by the logged-in user
router.get('/user', auth, getUserReviews);

// Update a review by ID
router.put('/:id', auth, updateReview);

// Delete a review by ID
router.delete('/:id', auth, deleteReview);

module.exports = router;
