// routes/reviews.js
const express = require('express');
const router = express.Router();
const review = require('../controllers/reviewController');
const { auth, adminAuth } = require('../middleware/auth');

// Create review (authenticated)
router.post('/', auth, review.create);

// Get reviews for an institute (public)
router.get('/institute/:instituteId', review.getByInstitute);

// Admin routes
router.get('/all', auth, adminAuth, review.getAll);
router.put('/moderate/:id', auth, adminAuth, review.moderate);

// Update / delete by owner (auth)
router.put('/:id', auth, review.update);
router.delete('/:id', auth, review.remove);

module.exports = router;
