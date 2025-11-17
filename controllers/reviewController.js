const Review = require('../models/Review');
const Institute = require('../models/Institute');

// Create Review
const createReview = async (req, res) => {
  try {
    const { instituteId, rating, reviewText } = req.body;

    // Check if institute exists
    const institute = await Institute.findById(instituteId);
    if (!institute) {
      return res.status(404).json({ msg: 'Institute not found' });
    }

    // Check if user has already reviewed this institute
    const existingReview = await Review.findOne({
      userId: req.user.id,
      instituteId,
    });

    if (existingReview) {
      return res.status(400).json({ msg: 'You have already reviewed this institute' });
    }

    // Create new review
    const newReview = new Review({
      userId: req.user.id,
      instituteId,
      rating,
      reviewText,
    });

    const review = await newReview.save();
    await review.populate('userId', 'name');
    await review.populate('instituteId', 'name');

    res.json(review);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get Reviews for Institute
const getReviews = async (req, res) => {
  try {
    const { instituteId } = req.params;

    // Check if institute exists
    const institute = await Institute.findById(instituteId);
    if (!institute) {
      return res.status(404).json({ msg: 'Institute not found' });
    }

    const reviews = await Review.find({ instituteId, approvalStatus: 'approved' })
      .populate('userId', 'name')
      .sort({ date: -1 });

    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update Review
const updateReview = async (req, res) => {
  try {
    const { rating, reviewText } = req.body;
    const { id } = req.params;

    // Build review object
    const reviewFields = {};
    if (rating) reviewFields.rating = rating;
    if (reviewText) reviewFields.reviewText = reviewText;

    let review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ msg: 'Review not found' });
    }

    // Check if review belongs to this user
    if (review.userId.toString() !== req.user.id.toString()) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    review = await Review.findByIdAndUpdate(
      id,
      { $set: reviewFields },
      { new: true }
    ).populate('userId', 'name').populate('instituteId', 'name');

    res.json(review);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete Review
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    let review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ msg: 'Review not found' });
    }

    // Check if review belongs to this user
    if (review.userId.toString() !== req.user.id.toString()) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Review.findByIdAndDelete(id);

    res.json({ msg: 'Review removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
};