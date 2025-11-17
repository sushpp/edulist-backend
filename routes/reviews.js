const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');

// Create review
router.post('/', auth, createReview);

// Get reviews for institute
router.get('/:instituteId', getReviews);

// Update review
router.put('/:id', auth, updateReview);

// Delete review
router.delete('/:id', auth, deleteReview);

module.exports = router;