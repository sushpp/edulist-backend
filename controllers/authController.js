const User = require('../models/User');
const Institute = require('../models/Institute');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'edulist_secret_key_2024', {
    expiresIn: '30d',
  });
};

// Register user/institute
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role, instituteData } = req.body;

    console.log('Registration attempt:', { name, email, role });

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required: name, email, phone, password' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      });
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
      role: role || 'user'
    });

    await user.save();
    console.log('User created successfully:', user._id);

    // If institute registration, create institute profile
   // In the register function, update the institute creation part:
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
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration', 
      error: error.message 
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email });

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = await User.findOne({ 
      email: email.toLowerCase().trim(), 
      isActive: true 
    });
    
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // For institutes, check if approved
    if (user.role === 'institute') {
      const institute = await Institute.findOne({ user: user._id });
      if (!institute) {
        return res.status(400).json({ 
          success: false,
          message: 'Institute profile not found' 
        });
      }
      if (institute.status !== 'approved') {
        return res.status(400).json({ 
          success: false,
          message: 'Institute account pending approval. Please contact administrator.' 
        });
      }
    }

    // Generate token
    const token = generateToken(user._id);

    console.log('Login successful:', user._id);

    res.json({
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
    res.status(500).json({ 
      success: false,
      message: 'Server error during login', 
      error: error.message 
    });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    let institute = null;
    if (user.role === 'institute') {
      institute = await Institute.findOne({ user: user._id });
    }

    res.json({
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
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};