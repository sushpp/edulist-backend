const User = require('../models/User');
const Institute = require('../models/Institute');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'edulist_secret_key_2024', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user/institute
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, phone, password, role, instituteData } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required: name, email, phone, password' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: hashedPassword,
      role: role || 'user',
    });

    await user.save();
    console.log('User created successfully:', user._id);

    // If institute registration, create institute profile linked to this user
    if (role === 'institute' && instituteData) {
      const institute = new Institute({
        user: user._id,
        name: instituteData.name || name,
        category: (instituteData.category || 'school').toLowerCase(),
        affiliation: instituteData.affiliation || 'Not specified',
        address: instituteData.address || {},
        contact: instituteData.contact || { email, phone },
        description: instituteData.description || 'No description provided',
        facilities: instituteData.facilities || [],
        status: 'pending'
      });
      await institute.save();
      console.log('Institute profile created for user:', user._id);
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim(), isActive: true }).select('+password');
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // For institutes, check if approved
    if (user.role === 'institute') {
      const institute = await Institute.findOne({ user: user._id });
      if (!institute) {
        return res.status(401).json({ success: false, message: 'Institute profile not found' });
      }
      if (institute.status !== 'approved') {
        return res.status(401).json({ success: false, message: 'Institute account is pending approval. Please contact administrator.' });
      }
    }

    // Generate token
    const token = generateToken(user._id);
    console.log('Login successful:', user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // Find user by ID from middleware
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let institute = null;
    if (user.role === 'institute') {
      institute = await Institute.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage
      },
      institute
    });

  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
};