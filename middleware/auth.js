// middleware/auth.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// This middleware protects routes and adds the user object to the request
const auth = async (req, res, next) => {
  try {
    // --- FIX: Safely get the token from the header ---
    const authHeader = req.header('Authorization');
    
    // Check if the header exists and starts with 'Bearer'
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }
    
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from the token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Token is not valid.' });
    }
    
    // Add user to the request object
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err.message);
    res.status(401).json({ success: false, message: 'Token is not valid.' });
  }
};

// This middleware grants access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

module.exports = { auth, authorize };