const jwt = require('jsonwebtoken');
const User = require('../models/User');

// General auth middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // Check if no token
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied, no token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'edulist_secret_key_2024');
    
    // Attach user from payload to request object
    req.user = { id: decoded.id }; // Use 'id' to match the controller

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};

// Admin-only middleware
const adminAuth = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access only' });
  next();
};

// Institute-only middleware
const instituteAuth = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  if (req.user.role !== 'institute') return res.status(403).json({ success: false, message: 'Institute access only' });
  next();
};

module.exports = { auth, adminAuth, instituteAuth };