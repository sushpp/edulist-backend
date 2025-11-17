const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Institute = require('../models/Institute');

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      role,
      phone,
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user
    await user.save();

    // If role is institute, create institute profile
    if (role === 'institute') {
      const {
        instituteName,
        category,
        affiliation,
        address,
        city,
        state,
        contactInfo,
        website,
        description,
      } = req.body;

      const institute = new Institute({
        name: instituteName,
        category,
        affiliation,
        address,
        city,
        state,
        contactInfo,
        website,
        description,
        userId: user._id,
      });

      await institute.save();
    }

    // Create JWT
    const payload = {
      id: user.id,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // If user is institute, check if institute is approved
    if (user.role === 'institute') {
      const institute = await Institute.findOne({ userId: user._id });
      if (!institute) {
        return res.status(400).json({ msg: 'Institute profile not found' });
      }
      if (institute.verifiedStatus !== 'approved') {
        return res.status(400).json({ msg: 'Institute not approved yet' });
      }
    }

    // Create JWT
    const payload = {
      id: user.id,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get User
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUser,
};