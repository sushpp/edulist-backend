const express = require('express');
const { auth, adminAuth, instituteAuth } = require('../middleware/auth');
const Institute = require('../models/Institute');
const User = require('../models/User');

const router = express.Router();

/* ===========================
   🔹 PUBLIC ROUTES
=========================== */

// ADDED THIS ROUTE: Get all approved institutes for the public page
// This directly fixes the error for the /public endpoint
router.get('/public', async (req, res) => {
  try {
    // You can add filters here later if needed, similar to the '/' route
    const institutes = await Institute.find({ status: 'approved' })
      .populate('user', 'name email');

    res.json({ success: true, count: institutes.length, institutes });
  } catch (error) {
    console.error('Error fetching public institutes:', error);
    res.status(500).json({ message: 'Server error while fetching public institutes' });
  }
});

// Get all approved institutes (with filters)
router.get('/', async (req, res) => {
  try {
    const { search, category, city, minFees, maxFees, facilities } = req.query;

    let query = { status: 'approved' };

    if (search) query.name = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (city) query.city = { $regex: city, $options: 'i' };
    if (facilities) query.facilities = { $in: facilities.split(',') };

    const institutes = await Institute.find(query)
      .populate('user', 'name email');

    res.json({ success: true, count: institutes.length, institutes });
  } catch (error) {
    console.error('Error fetching institutes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single institute by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const institute = await Institute.findById(req.params.id)
      .populate('user', 'name email phone');
    if (!institute) {
      return res.status(404).json({ message: 'Institute not found' });
    }
    res.json({ success: true, institute });
  } catch (error) {
    console.error('Error fetching institute by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


/* ===========================
   🔹 INSTITUTE AUTH ROUTES
=========================== */

// MOVED THIS ROUTE UP: Get institute profile (logged-in institute)
// This must come before /:id to avoid being treated as an ID
router.get('/profile', auth, instituteAuth, async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user._id })
      .populate('user', 'name email phone');
    if (!institute) {
      return res.status(404).json({ message: 'Institute not found' });
    }
    res.json({ success: true, institute });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

// Update institute profile
router.put('/profile', auth, instituteAuth, async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user._id });
    if (!institute) {
      return res.status(404).json({ message: 'Institute not found' });
    }

    const updatedInstitute = await Institute.findByIdAndUpdate(
      institute._id,
      req.body,
      { new: true }
    );

    // FIXED TYPO: "Profsile" -> "Profile"
    res.json({ success: true, message: 'Profile updated successfully', updatedInstitute });
  } catch (error) {
    console.error('Error updating institute:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


/* ===========================
   🔹 ADMIN ROUTES
=========================== */

// MOVED THIS ROUTE UP: Get all pending institutes (admin only)
// This must come before /:id to avoid being treated as an ID
router.get('/admin/pending', auth, adminAuth, async (req, res) => {
  try {
    const institutes = await Institute.find({ status: 'pending' })
      .populate('user', 'name email phone createdAt');

    res.json({ success: true, institutes });
  } catch (error) {
    console.error('Error fetching pending institutes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update institute status (admin only)
router.put('/admin/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const institute = await Institute.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email');

    res.json({ success: true, message: 'Status updated', institute });
  } catch (error) {
    console.error('Error updating institute status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;