// controllers/reviewController.js
const Review = require('../models/Review');
const Institute = require('../models/Institute');

exports.createReview = async (req, res) => {
  try {
    const { institute, rating, reviewText } = req.body;
    const instituteExists = await Institute.findById(institute);
    if (!instituteExists) return res.status(404).json({ success: false, message: 'Institute not found' });

    const existing = await Review.findOne({ user: req.user._id, institute });
    if (existing) return res.status(400).json({ success: false, message: 'You already reviewed this institute' });

    const review = await Review.create({ user: req.user._id, institute, rating, reviewText, status: 'approved' });
    res.status(201).json({ success: true, review });
  } catch (err) {
    console.error('review.create error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getByInstitute = async (req, res) => {
  try {
    const reviews = await Review.find({ institute: req.params.instituteId, status: 'approved' }).populate('user', 'name').sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    console.error('review.getByInstitute error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate('user', 'name').populate('institute', 'name').sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    console.error('review.getAllReviews error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.moderateReview = async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    if (!['approve','reject'].includes(action)) return res.status(400).json({ success: false, message: 'Invalid action' });

    if (action === 'approve') {
      const review = await Review.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
      return res.json({ success: true, review });
    } else {
      await Review.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
      return res.json({ success: true, message: 'Review rejected' });
    }
  } catch (err) {
    console.error('review.moderateReview error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });

    Object.assign(review, req.body);
    await review.save();
    res.json({ success: true, review });
  } catch (err) {
    console.error('review.update error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized' });
    await review.remove();
    res.json({ success: true, message: 'Review removed' });
  } catch (err) {
    console.error('review.remove error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
