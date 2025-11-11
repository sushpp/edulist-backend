const Review = require('../models/Review');
const Institute = require('../models/Institute');
const { updateInstituteRating } = require('../services/reviewService');

// 🟢 Create a new review
exports.createReview = async (req, res) => {
  try {
    const { institute, rating, reviewText } = req.body;

    // Check if institute exists
    const instituteExists = await Institute.findById(institute);
    if (!instituteExists) {
      return res.status(404).json({ message: 'Institute not found' });
    }

    // Check if user already reviewed this institute
    const existingReview = await Review.findOne({ user: req.user.userId, institute });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this institute' });
    }

    const review = new Review({
      user: req.user.userId,
      institute,
      rating,
      reviewText,
      isApproved: true, // Auto-approved for now
    });

    await review.save();
    await review.populate('user', 'name');

    // Update institute rating
    await updateInstituteRating(institute);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 🟢 Get reviews for a specific institute
exports.getInstituteReviews = async (req, res) => {
  try {
    const { instituteId } = req.params;

    const reviews = await Review.find({ institute: instituteId, isApproved: true })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Get institute reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 🟢 Get all reviews (Admin only)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name')
      .populate('institute', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 🟢 Moderate (Approve / Reject) a review (Admin only)
exports.moderateReview = async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'

    let review;
    if (action === 'approve') {
      review = await Review.findByIdAndUpdate(
        req.params.id,
        { isApproved: true },
        { new: true }
      );
      if (review) await updateInstituteRating(review.institute);
    } else if (action === 'reject') {
      review = await Review.findByIdAndDelete(req.params.id);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    res.json({
      success: true,
      message: `Review ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
    });
  } catch (error) {
    console.error('Moderate review error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 🟢 Update review (User)
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    )
      .populate('user', 'name')
      .populate('institute', 'name');

    await updateInstituteRating(updatedReview.institute);

    res.json({ success: true, message: 'Review updated successfully', review: updatedReview });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 🟢 Delete review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Review.findByIdAndDelete(req.params.id);
    await updateInstituteRating(review.institute);

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
