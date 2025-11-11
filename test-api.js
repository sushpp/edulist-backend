const mongoose = require('mongoose');
require('dotenv').config();

// Test database connection
async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edulist');
    console.log('✅ MongoDB connected successfully');
    
    // Test if collections exist
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 Collections:', collections.map(c => c.name));
    
    // Test if admin user exists
    const User = require('./models/User');
    const admin = await User.findOne({ email: 'admin@edulist.com' });
    console.log('👑 Admin user:', admin ? 'Exists' : 'Not found');
    
    await mongoose.connection.close();
    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testConnection();