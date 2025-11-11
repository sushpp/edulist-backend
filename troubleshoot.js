const axios = require('axios');

const troubleshoot = async () => {
  console.log('🔍 Troubleshooting EduList Backend...\n');

  // Check if port 5000 is available
  try {
    const response = await axios.get('http://localhost:5000/api/health', { timeout: 2000 });
    console.log('✅ Backend is running on port 5000');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Backend is NOT running on port 5000');
    console.log('Error:', error.message);
  }

  // Check MongoDB connection
  try {
    const mongoose = require('mongoose');
    await mongoose.connect('mongodb://localhost:27017/edulist', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 3000
    });
    console.log('✅ MongoDB is connected');
    await mongoose.connection.close();
  } catch (error) {
    console.log('❌ MongoDB connection failed');
    console.log('Error:', error.message);
    console.log('\n💡 Solution: Make sure MongoDB is installed and running');
    console.log('Download MongoDB: https://www.mongodb.com/try/download/community');
    console.log('Or install MongoDB Compass for GUI');
  }

  console.log('\n🎯 Quick Fixes:');
  console.log('1. Make sure MongoDB is running');
  console.log('2. Run: cd backend && npm start');
  console.log('3. Check if port 5000 is free');
  console.log('4. Try different port: set PORT=5001 in .env file');
};

troubleshoot();