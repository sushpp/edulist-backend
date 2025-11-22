// controllers/authController.js

const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in the environment.');
    throw new Error('Server configuration error: JWT_SECRET is missing.');
  }
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '5h',
  });
};

// @desc    Register a new user (user or institute)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Determine status based on role:
    // - 'institute' => 'pending' (admin must approve)
    // - other roles (user/admin) => 'approved'
    const status = (role === 'institute') ? 'pending' : 'approved';

    const user = await User.create({
      name,
      email,
      password,
      role,
      status,
    });

    // If user is an institute -> return success message only (no token).
    if (role === 'institute') {
      return res.status(201).json({
        success: true,
        message: 'Registration successful. Your institute account is pending admin approval.'
      });
    }

    // If regular user/admin -> auto-approve and return token + user
    const token = generateToken(user._id, user.role);
    const userObj = user.toObject();
    delete userObj.password;

    return res.status(201).json({
      success: true,
      token,
      user: userObj
    });
  } catch (err) {
    console.error('--- REGISTRATION ERROR ---');
    console.error('Error Message:', err.message);
    console.error('Error Stack:', err.stack);

    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: 'Validation Error', errors });
    }

    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
    }

    res.status(500).json({ success: false, message: 'Server Error during registration' });
  }
};

// @desc    Login a user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Only allow login if user is approved
    if (user.status !== 'approved') {
      // 403 Forbidden (user exists but not allowed to login yet)
      return res.status(403).json({ success: false, message: `Your account is ${user.status}. Please contact an admin.` });
    }

    const token = generateToken(user._id, user.role);
    const userObject = user.toObject();
    delete userObject.password;

    res.status(200).json({
      success: true,
      token,
      user: userObject
    });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ success: false, message: 'Server Error during login' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (err) {
    console.error('GetMe Error:', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Check if auth service is running
// @route   GET /api/auth
// @access  Public
const getAuthStatus = (req, res) => {
  res.status(200).json({ success: true, message: 'Auth service is running' });
};

module.exports = {
  register,
  login,
  getMe,
  getAuthStatus
};
