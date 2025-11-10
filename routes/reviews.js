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

router.post('/', auth, createReview);
router.get('/institute/:instituteId', getInstituteReviews);
router.get('/user', auth, getUserReviews);
router.put('/:id', auth, updateReview);
router.delete('/:id', auth, deleteReview);

module.exports = router;