const express = require('express');
const { auth, instituteAuth } = require('../middleware/auth');
const Facility = require('../models/Facility');
const Institute = require('../models/Institute');

const router = express.Router();

// Create facility
router.post('/', auth, instituteAuth, async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user.id });
    if (!institute) {
      return res.status(404).json({ message: 'Institute not found' });
    }

    const facility = new Facility({
      institute: institute._id,
      ...req.body
    });

    await facility.save();
    res.status(201).json({
      success: true,
      message: 'Facility added successfully',
      facility
    });
  } catch (error) {
    console.error('Error creating facility:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get facilities by institute ID
router.get('/institute/:instituteId', async (req, res) => {
  try {
    const facilities = await Facility.find({ institute: req.params.instituteId });
    res.json({ success: true, facilities });
  } catch (error) {
    console.error('Error fetching facilities:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update facility
router.put('/:id', auth, instituteAuth, async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user.id });
    if (!institute) {
      return res.status(404).json({ message: 'Institute not found' });
    }

    const facility = await Facility.findOneAndUpdate(
      { _id: req.params.id, institute: institute._id },
      req.body,
      { new: true }
    );

    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    res.json({
      success: true,
      message: 'Facility updated successfully',
      facility
    });
  } catch (error) {
    console.error('Error updating facility:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete facility
router.delete('/:id', auth, instituteAuth, async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user.id });
    if (!institute) {
      return res.status(404).json({ message: 'Institute not found' });
    }

    const facility = await Facility.findOneAndDelete({
      _id: req.params.id,
      institute: institute._id
    });

    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    res.json({
      success: true,
      message: 'Facility deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting facility:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
