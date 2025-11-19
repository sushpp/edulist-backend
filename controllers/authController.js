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

// @desc    Register a new user (institute)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // --- Create user with 'institute' role and 'pending' status ---
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'institute', // Default to 'institute' if not provided
      status: 'pending', // New users are not approved by default
    });

    // --- Respond with a success message, not a token ---
    // The frontend will handle this message and show a "pending approval" screen.
    res.status(201).json({
      success: true,
      message: 'Registration successful. Your account is now pending admin approval.'
    });
  } catch (err) {
    console.error('--- REGISTRATION ERROR ---');
    console.error('Error Message:', err.message);
    console.error('Error Stack:', err.stack);

    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ message: 'Validation Error', errors });
    }

    if (err.code === 11000) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }
    
    res.status(500).json({ message: 'Server Error during registration' });
  }
};

// @desc    Login a user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide an email and password' });
    }

    // --- Select password to compare it ---
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // --- CRITICAL CHECK: Verify user is approved before allowing login ---
    if (user.status !== 'approved') {
      return res.status(403).json({ message: `Your account is ${user.status}. Please contact an admin.` });
    }

    // --- If approved, generate token and send response ---
    const token = generateToken(user._id, user.role);
    const userObject = user.toObject();
    delete userObject.password;

    res.status(200).json({
      success: true,
      token: token,
      user: userObject
    });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ message: 'Server Error during login' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        res.status(200).json({
            success: true,
            data: req.user
        });
    } catch (err) {
        console.error('GetMe Error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Check if auth service is running
// @route   GET /api/auth
// @access  Public
const getAuthStatus = (req, res) => {
  res.status(200).json({ message: 'Auth service is running' });
};

module.exports = {
  register,
  login,
  getMe,
  getAuthStatus
};