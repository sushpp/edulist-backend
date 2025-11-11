const Institute = require('../models/Institute');

const instituteAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'institute') {
      return res.status(403).json({ message: 'Access denied. Institute only.' });
    }

    // Check if institute owns the resource
    if (req.params.id) {
      const institute = await Institute.findOne({ user: req.user.userId });
      if (!institute || institute._id.toString() !== req.params.id) {
        return res.status(403).json({ message: 'Access denied to this resource' });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = instituteAuth;