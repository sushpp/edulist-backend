const express = require('express');
const User = require('../models/User');
const Institute = require('../models/Institute');

const router = express.Router();

// Debug route to check all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('name email role isActive');
    res.json({
      totalUsers: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug route to check all institutes
router.get('/institutes', async (req, res) => {
  try {
    const institutes = await Institute.find().select('name email verified');
    res.json({
      totalInstitutes: institutes.length,
      institutes: institutes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Debug endpoint to test database
app.get('/api/debug/db', async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const institutesCount = await Institute.countDocuments();
    
    res.json({
      database: 'Connected',
      users: usersCount,
      institutes: institutesCount,
      collections: ['Users', 'Institutes', 'Courses', 'Reviews', 'Enquiries']
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;