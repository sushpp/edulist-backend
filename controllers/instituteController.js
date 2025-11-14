// controllers/instituteController.js
const Institute = require('../models/Institute');
const Review = require('../models/Review');
const Course = require('../models/Course');
const User = require('../models/User');

exports.createInstitute = async (req, res) => {
  try {
    const existing = await Institute.findOne({ user: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Institute already exists for this user' });

    const payload = { ...req.body, user: req.user._id, isVerified: false };
    const institute = await Institute.create(payload);
    res.status(201).json({ success: true, institute });
  } catch (err) {
    console.error('institute.create error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getPublicInstitutes = async (req, res) => {
  try {
    const { page = 1, limit = 12, search = '', category = '', city = '' } = req.query;
    const query = { isVerified: true };
    if (search) query.name = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (city) query.city = { $regex: city, $options: 'i' };

    const institutes = await Institute.find(query)
      .populate('user', 'name email')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 })
      .lean();

    const total = await Institute.countDocuments(query);
    res.json({ success: true, data: { institutes, total, page: Number(page), totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error('institute.getPublic error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const inst = await Institute.findById(req.params.id).populate('user', 'name email phone');
    if (!inst) return res.status(404).json({ success: false, message: 'Institute not found' });
    res.json({ success: true, institute: inst });
  } catch (err) {
    console.error('institute.getById error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const inst = await Institute.findOne({ user: req.user._id }).populate('user', 'name email phone');
    if (!inst) return res.status(404).json({ success: false, message: 'Institute profile not found' });
    res.json({ success: true, institute: inst });
  } catch (err) {
    console.error('institute.getProfile error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const inst = await Institute.findOne({ user: req.user._id });
    if (!inst) return res.status(404).json({ success: false, message: 'Institute not found' });
    const updated = await Institute.findByIdAndUpdate(inst._id, req.body, { new: true, runValidators: true });
    res.json({ success: true, institute: updated });
  } catch (err) {
    console.error('institute.updateProfile error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getPending = async (req, res) => {
  try {
    const pending = await Institute.find({ isVerified: false }).populate('user', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, institutes: pending });
  } catch (err) {
    console.error('institute.getPending error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

    const inst = await Institute.findById(req.params.id).populate('user', 'email name');
    if (!inst) return res.status(404).json({ success: false, message: 'Institute not found' });

    inst.isVerified = status === 'approved';
    await inst.save();

    // If approved = true, keep user; if rejected maybe notify / keep or remove depending on your policy
    res.json({ success: true, message: `Institute ${status}`, institute: inst });
  } catch (err) {
    console.error('institute.updateStatus error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const instituteId = req.params.id || (await Institute.findOne({ user: req.user._id }))._id;
    if (!instituteId) return res.status(400).json({ success: false, message: 'Institute ID required' });

    const [reviewsCount, coursesCount] = await Promise.all([
      Review.countDocuments({ institute: instituteId }),
      Course.countDocuments({ institute: instituteId })
    ]);

    res.json({ success: true, data: { reviews: reviewsCount, courses: coursesCount } });
  } catch (err) {
    console.error('institute.getStats error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
