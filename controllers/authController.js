// controllers/authController.js

const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id, role) => {
  console.log('Generating token for user ID:', id, 'with role:', role);
  if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    throw new Error('JWT_SECRET is not defined in the environment.');
  }
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '5h',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  console.log('Registration request received with body:', req.body);
  try {
    const { name, email, password, role } = req.body;

    // 1. Validate request body
    if (!name || !email || !password) {
      console.log('Validation failed: Missing fields.');
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('Validation failed: User already exists.');
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // 3. Create user
    console.log('Attempting to create user...');
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user', // Default to 'user' if no role is provided
    });
    console.log('User created successfully:', user._id);

    // 4. Generate token and send response
    const token = generateToken(user._id, user.role);
    console.log('Token generated successfully.');
    res.status(201).json({
      success: true,
      token: token,
    });
  } catch (err) {
    console.error('--- REGISTRATION ERROR ---');
    console.error('Error Message:', err.message);
    console.error('Error Stack:', err.stack);
    console.error('-------------------------');

    // Handle specific Mongoose errors
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ message: 'Validation Error', errors });
    }

    // Handle duplicate key error (e.g., for unique email)
    if (err.code === 11000) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }
    
    // Handle JWT secret error
    if (err.message.includes('JWT_SECRET is not defined')) {
      return res.status(500).json({ message: 'Server configuration error.' });
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

    // 1. Validate request body
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide an email and password' });
    }

    // 2. Check for user and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 4. Generate token and send response
    res.status(200).json({
      success: true,
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ message: 'Server Error during login' });
  }
};

// @desc    Get current logged in user (for testing)
// @route   POST /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    // req.user is populated by the auth middleware
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    });
}


module.exports = {
  register,
  login,
  getMe
};