// routes/reviews.js
const express = require('express');
const router = express.Router();
const review = require('../controllers/reviewController');
const { auth, adminAuth } = require('../middleware/auth');

router.post('/', auth, review.createReview || review.create);
router.get('/institute/:instituteId', review.getByInstitute);
router.get('/all', auth, adminAuth, review.getAllReviews);
router.put('/moderate/:id', auth, adminAuth, review.moderateReview || review.moderateReview);
router.put('/:id', auth, review.update);
router.delete('/:id', auth, review.remove);

module.exports = router;
