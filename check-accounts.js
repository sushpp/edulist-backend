const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Institute = require('./models/Institute');

const checkAccounts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edulist');
    console.log('🔍 Checking demo accounts...\n');

    // Check admin account
    const admin = await User.findOne({ email: 'admin@edulist.com' });
    console.log('Admin account:', admin ? '✅ Exists' : '❌ Missing');
    if (admin) {
      const validPassword = await bcrypt.compare('admin123', admin.password);
      console.log('Admin password check:', validPassword ? '✅ Valid' : '❌ Invalid');
    }

    // Check institute account
    const instituteUser = await User.findOne({ email: 'dps@example.com' });
    console.log('Institute user account:', instituteUser ? '✅ Exists' : '❌ Missing');
    if (instituteUser) {
      const validPassword = await bcrypt.compare('institute123', instituteUser.password);
      console.log('Institute password check:', validPassword ? '✅ Valid' : '❌ Invalid');
      
      const institute = await Institute.findOne({ user: instituteUser._id });
      console.log('Institute profile:', institute ? '✅ Exists' : '❌ Missing');
      if (institute) {
        console.log('Institute verified:', institute.verified ? '✅ Yes' : '❌ No');
      }
    }

    // Check user account
    const regularUser = await User.findOne({ email: 'john@example.com' });
    console.log('User account:', regularUser ? '✅ Exists' : '❌ Missing');
    if (regularUser) {
      const validPassword = await bcrypt.compare('user123', regularUser.password);
      console.log('User password check:', validPassword ? '✅ Valid' : '❌ Invalid');
    }

    console.log('\n🎯 If any accounts are missing, run: npm run seed');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error checking accounts:', error);
  }
};

checkAccounts();