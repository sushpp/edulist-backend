const User = require('../models/User');
const Institute = require('../models/Institute');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, instituteData } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({ 
        message: 'All fields are required: name, email, password, phone, role' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role
    });

    await user.save();

    let institute = null;
    // If institute registration, create institute profile
    if (role === 'institute' && instituteData) {
      // Validate institute data
      if (!instituteData.name || !instituteData.category || !instituteData.affiliation || 
          !instituteData.address || !instituteData.city || !instituteData.state || 
          !instituteData.description) {
        return res.status(400).json({ 
          message: 'All institute fields are required: name, category, affiliation, address, city, state, description' 
        });
      }

      institute = new Institute({
        user: user._id,
        name: instituteData.name,
        category: instituteData.category,
        affiliation: instituteData.affiliation,
        address: instituteData.address,
        city: instituteData.city,
        state: instituteData.state,
        phone: instituteData.phone || phone,
        email: instituteData.email || email,
        website: instituteData.website,
        description: instituteData.description,
        facilities: instituteData.facilities || [],
        status: 'pending'
      });
      await institute.save();
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      institute: institute ? {
        id: institute._id,
        name: institute.name,
        status: institute.status
      } : null
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({ 
        message: 'Email, password, and role are required' 
      });
    }

    // Find user
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email, password, or role' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account has been deactivated' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email, password, or role' });
    }

    // For institutes, check if approved
    if (role === 'institute') {
      const institute = await Institute.findOne({ user: user._id });
      if (!institute) {
        return res.status(400).json({ message: 'Institute profile not found' });
      }
      if (institute.status !== 'approved') {
        return res.status(400).json({ 
          message: 'Institute registration is pending approval. Please wait for admin approval.' 
        });
      }
    }

    // For admin, check if it's actually an admin
    if (role === 'admin') {
      // You might want to add additional admin verification here
      const isAdmin = email === 'admin@edulist.com'; // Simple check
      if (!isAdmin) {
        return res.status(400).json({ message: 'Admin access denied' });
      }
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
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
    res.status(500).json({ message: 'Server error during login' });
  }
};

module.exports = { register, login };