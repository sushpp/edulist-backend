// controllers/facilityController.js
const Facility = require('../models/Facility');

exports.list = async (req, res) => {
  try {
    const items = await Facility.find().sort({ name: 1 });
    res.json({ success: true, facilities: items });
  } catch (err) {
    console.error('facility.list error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, icon } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'name required' });
    const f = await Facility.create({ name, icon });
    res.status(201).json({ success: true, facility: f });
  } catch (err) {
    console.error('facility.create error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    await Facility.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    console.error('facility.remove error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
