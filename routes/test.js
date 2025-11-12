const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Test route to check users in database
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('name email role');
    res.json({
      message: `Found ${users.length} users in database`,
      users: users
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Test route to create a test user
router.post('/create-test-user', async (req, res) => {
  try {
    // Clear existing test users
    await User.deleteMany({ email: 'test@example.com' });
    
    // Create a test user
    const hashedPassword = await bcrypt.hash('test123', 10);
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      password: hashedPassword,
      role: 'user'
    });
    
    await testUser.save();
    
    res.json({
      message: 'Test user created successfully',
      user: {
        email: 'test@example.com',
        password: 'test123'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating test user', error: error.message });
  }
});

module.exports = router;