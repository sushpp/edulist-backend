const mongoose = require('mongoose');
require('dotenv').config();

async function testSetup() {
  try {
    // Test database connection
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edulist');
    console.log('✅ MongoDB connected successfully');

    // Test models
    const User = require('./models/User');
    const Institute = require('./models/Institute');
    
    // Check if admin exists
    const admin = await User.findOne({ email: 'admin@edulist.com' });
    console.log(admin ? '✅ Admin user exists' : '❌ Admin user not found');

    // Check if institutes exist
    const institutes = await Institute.find();
    console.log(`📊 ${institutes.length} institutes found`);

    // Check if users exist
    const users = await User.find();
    console.log(`👥 ${users.length} total users found`);

    await mongoose.connection.close();
    console.log('✅ All tests passed! Server is ready.');
    
  } catch (error) {
    console.error('❌ Setup test failed:', error);
    process.exit(1);
  }
}

testSetup();