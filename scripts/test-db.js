const mongoose = require('mongoose');
const User = require('../models/User');
const Institute = require('../models/Institute');
require('dotenv').config();

const testDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edulist');
    console.log('✅ Connected to MongoDB');

    // Count users
    const userCount = await User.countDocuments();
    console.log(`👥 Total users: ${userCount}`);

    // Count institutes
    const instituteCount = await Institute.countDocuments();
    console.log(`🏫 Total institutes: ${instituteCount}`);

    // Show all users
    const users = await User.find().select('name email role');
    console.log('\n📋 All Users:');
    users.forEach(user => {
      console.log(`   ${user.name} (${user.email}) - ${user.role}`);
    });

    // Show all institutes
    const institutes = await Institute.find().populate('user', 'name email');
    console.log('\n📋 All Institutes:');
    institutes.forEach(inst => {
      console.log(`   ${inst.name} - Verified: ${inst.isVerified} - User: ${inst.user.email}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database test completed');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
};

testDatabase();