// routes/institutes.js - CORRECTED VERSION
const express = require('express');
const { auth, adminAuth, instituteAuth } = require('../middleware/auth');
const Institute = require('../models/Institute');
const User = require('../models/User');

const router = express.Router();

/* ===========================
   🔹 PUBLIC ROUTES
=========================== */

// Get all approved institutes for the public page
router.get('/public', async (req, res) => {
  try {
    const { search, category, city, minFees, maxFees, facilities } = req.query;

    // FIX: Use isVerified: true instead of status: 'approved'
    let query = { isVerified: true };

    if (search) query.name = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (city) query['address.city'] = { $regex: city, $options: 'i' };
    if (facilities) query['facilities.name'] = { $in: facilities.split(',') };

    const institutes = await Institute.find(query)
      .populate('user', 'name email')
      .lean()
      .exec();

    res.json({ success: true, count: institutes.length, institutes });
  } catch (error) {
    console.error('Error fetching public institutes:', error);
    res.status(500).json({ message: 'Server error while fetching public institutes.' });
  }
});

// Get all approved institutes (with filters) - ALIAS for /public
router.get('/', async (req, res) => {
  try {
    const { search, category, city, minFees, maxFees, facilities } = req.query;

    // FIX: Use isVerified: true instead of status: 'approved'
    let query = { isVerified: true };

    if (search) query.name = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (city) query['address.city'] = { $regex: city, $options: 'i' };
    if (facilities) query['facilities.name'] = { $in: facilities.split(',') };

    const institutes = await Institute.find(query)
      .populate('user', 'name email')
      .lean()
      .exec();

    res.json({ success: true, count: institutes.length, institutes });
  } catch (error) {
    console.error('Error fetching institutes:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get single institute by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const institute = await Institute.findById(req.params.id)
      .populate('user', 'name email phone');
    
    if (!institute) {
      return res.status(404).json({ success: false, message: 'Institute not found.' });
    }
    
    res.json({ success: true, institute });
  } catch (error) {
    console.error('Error fetching institute by ID:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

/* ===========================
   🔹 INSTITUTE AUTH ROUTES
=========================== */

// Get institute profile (logged-in institute)
router.get('/profile', auth, instituteAuth, async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user._id })
      .populate('user', 'name email phone');
      
    if (!institute) {
      return res.status(404).json({ success: false, message: 'Institute profile not found.' });
    }
    
    res.json({ success: true, institute });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Update institute profile
router.put('/profile', auth, instituteAuth, async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user._id });
    if (!institute) {
      return res.status(404).json({ success: false, message: 'Institute profile not found.' });
    }

    const updatedInstitute = await Institute.findByIdAndUpdate(
      institute._id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name email phone');

    res.json({ 
      success: true, 
      message: 'Profile updated successfully.', 
      institute: updatedInstitute 
    });
  } catch (error) {
    console.error('Error updating institute:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

/* ===========================
   🔹 ADMIN ROUTES
=========================== */

// Get all pending institutes (admin only)
router.get('/admin/pending', auth, adminAuth, async (req, res) => {
  try {
    // FIX: Use isVerified: false instead of status: 'pending'
    const institutes = await Institute.find({ isVerified: false })
      .populate('user', 'name email phone createdAt');
      
    res.json({ success: true, institutes });
  } catch (error) {
    console.error('Error fetching pending institutes:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Update institute status (admin only)
router.put('/admin/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    // FIX: Map status to isVerified
    let updateData = {};
    if (status === 'approved') {
      updateData = { isVerified: true };
    } else if (status === 'rejected') {
      updateData = { isVerified: false };
    } else {
      return res.status(400).json({ success: false, message: 'Invalid status. Use "approved" or "rejected".' });
    }

    const institute = await Institute.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('user', 'name email');

    res.json({ 
      success: true, 
      message: `Institute ${status} successfully.`, 
      institute 
    });
  } catch (error) {
    console.error('Error updating institute status:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;