const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ General authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'edulist_secret_key_2024');
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// ✅ Admin-only middleware
const adminAuth = (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Institute-only middleware
const instituteAuth = (req, res, next) => {
  try {
    if (req.user.role !== 'institute') {
      return res.status(403).json({ message: 'Access denied. Institute only.' });
    }
    next();
  } catch (error) {
    console.error('Institute auth error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { auth, adminAuth, instituteAuth };
