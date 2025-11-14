// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Institute = require('../models/Institute');

const JWT_SECRET = process.env.JWT_SECRET || 'edulist_secret_key_2025';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '30d';

const signToken = (userId) => jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role, instituteData } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'name, email and password are required' });

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), phone, password: hashed, role: role || 'user' });

    // If registering an institute, create initial institute doc (status pending)
    if (user.role === 'institute' && instituteData) {
      await Institute.create({
        user: user._id,
        name: instituteData.name || user.name,
        description: instituteData.description || '',
        address: instituteData.address || '',
        city: instituteData.city || '',
        contactNumber: instituteData.contactNumber || user.phone || '',
        email: instituteData.email || user.email || '',
        website: instituteData.website || '',
        isVerified: false
      });
    }

    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('auth.register error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'email and password required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = signToken(user._id);
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('auth.login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let institute = null;
    if (user.role === 'institute') {
      institute = await Institute.findOne({ user: user._id }).lean();
    }

    res.json({ success: true, user, institute });
  } catch (err) {
    console.error('auth.getMe error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
