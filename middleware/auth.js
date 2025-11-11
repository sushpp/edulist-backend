const jwt = require('jsonwebtoken');
const User = require('../models/User');

// General auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'edulist_secret_key_2024');
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(401).json({ message: 'Token is not valid' });

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Admin-only middleware
const adminAuth = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access only' });
  next();
};

// Institute-only middleware
const instituteAuth = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  if (req.user.role !== 'institute') return res.status(403).json({ message: 'Institute access only' });
  next();
};

// Export all middlewares properly
module.exports = { auth, adminAuth, instituteAuth };
