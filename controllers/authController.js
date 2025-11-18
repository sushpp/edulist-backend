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
      role: role || 'user',
    });
    console.log('User created successfully:', user._id);

    // 4. Generate token and send response
    const token = generateToken(user._id, user.role);
    console.log('Token generated successfully.');
    
    // Convert user to a plain object and delete the password field
    const userObject = user.toObject();
    delete userObject.password;

    res.status(201).json({
      success: true,
      token: token,
      user: userObject // Send the user object back
    });
  } catch (err) {
    console.error('--- REGISTRATION ERROR ---');
    console.error('Error Message:', err.message);
    console.error('Error Stack:', err.stack);
    console.error('-------------------------');

    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ message: 'Validation Error', errors });
    }

    if (err.code === 11000) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }
    
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

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide an email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token and send response
    const token = generateToken(user._id, user.role);
    
    // Convert user to a plain object and delete the password field
    const userObject = user.toObject();
    delete userObject.password;

    res.status(200).json({
      success: true,
      token: token,
      user: userObject // Send the user object back
    });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ message: 'Server Error during login' });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        // The protect middleware should have attached the user to req.user
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error('GetMe Error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
  register,
  login,
  getMe
};