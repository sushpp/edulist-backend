// controllers/reviewController.js
const Review = require('../models/Review');
const Institute = require('../models/Institute');

exports.create = async (req, res) => {
  try {
    const { institute: instituteId, rating, reviewText, course } = req.body;
    if (!instituteId || !rating) return res.status(400).json({ success: false, message: 'institute and rating required' });

    const inst = await Institute.findById(instituteId);
    if (!inst) return res.status(404).json({ success: false, message: 'Institute not found' });

    // check if user already reviewed
    const existing = await Review.findOne({ user: req.user._id, institute: instituteId });
    if (existing) return res.status(400).json({ success: false, message: 'You have already reviewed this institute' });

    const review = await Review.create({
      user: req.user._id,
      institute: instituteId,
      course: course || null,
      rating,
      reviewText,
      status: 'pending', // moderation workflow
      isActive: true
    });

    res.status(201).json({ success: true, review });
  } catch (err) {
    console.error('review.create error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getByInstitute = async (req, res) => {
  try {
    const reviews = await Review.find({ institute: req.params.instituteId, status: 'approved', isActive: true }).populate('user', 'name').sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    console.error('review.getByInstitute error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const reviews = await Review.find().populate('user', 'name').populate('institute', 'name').sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    console.error('review.getAll error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.moderate = async (req, res) => {
  try {
    const { action } = req.body; // approve or reject
    if (!['approve', 'reject'].includes(action)) return res.status(400).json({ success: false, message: 'Invalid action' });

    if (action === 'approve') {
      const updated = await Review.findByIdAndUpdate(req.params.id, { status: 'approved', adminApproval: true }, { new: true });
      return res.json({ success: true, message: 'Review approved', review: updated });
    } else {
      await Review.findByIdAndUpdate(req.params.id, { status: 'rejected', adminApproval: false });
      return res.json({ success: true, message: 'Review rejected' });
    }
  } catch (err) {
    console.error('review.moderate error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });

    const updated = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, review: updated });
  } catch (err) {
    console.error('review.update error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized' });

    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    console.error('review.remove error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
