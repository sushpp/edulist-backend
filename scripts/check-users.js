const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edulist');
    console.log('✅ Connected to MongoDB');

    const users = await User.find().select('name email role');
    console.log(`📊 Total users in database: ${users.length}`);
    
    users.forEach(user => {
      console.log(`👤 ${user.name} (${user.email}) - ${user.role}`);
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkUsers();