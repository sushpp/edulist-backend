const express = require('express');
const { auth, instituteAuth } = require('../middleware/auth');
const Institute = require('../models/Institute');

const router = express.Router();

// Add facility
router.post('/', auth, instituteAuth, async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user.id });
    
    if (!institute) {
      return res.status(404).json({ message: 'Institute not found' });
    }

    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Facility name is required' });
    }

    institute.facilities.push({
      name,
      description: description || ''
    });
    
    await institute.save();

    res.json({
      message: 'Facility added successfully',
      facilities: institute.facilities
    });
  } catch (error) {
    console.error('Add facility error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;