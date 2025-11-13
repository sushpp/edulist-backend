const jwt = require('jsonwebtoken');
const User = require('../models/User');

// General auth middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    // Check if no token
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'edulist_secret_key_2024');
      
      // Attach user from payload to the request object
      // IMPORTANT: Find the full user document, not just the ID
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Token is valid, but user not found.' });
      }

      // Check if user is active
      if (!req.user.isActive) {
        return res.status(401).json({ success: false, message: 'Your account has been deactivated. Please contact an administrator.' });
      }

      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Token is not valid.' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Your session has expired. Please log in again.' });
      }
      return res.status(500).json({ success: false, message: 'Server error during authentication.' });
    }
  } catch (error) {
    console.error('Unexpected error in auth middleware:', error);
    return res.status(500).json({ success: false, message: 'Unexpected server error.' });
  }
};

// Admin-only middleware
const adminAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access only.' }); // 403 Forbidden
  }
  next();
};

// Institute-only middleware
const instituteAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }
  if (req.user.role !== 'institute') {
    return res.status(403).json({ success: false, message: 'Institute access only.' }); // 403 Forbidden
  }
  next();
};

module.exports = { auth, adminAuth, instituteAuth };