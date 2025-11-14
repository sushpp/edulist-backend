// test-backend.js
const mongoose = require('mongoose');
const Institute = require('./models/Institute');

const testBackend = async () => {
  try {
    await mongoose.connect('your-mongodb-uri');
    
    // Test 1: Check if approved institutes query works
    const approvedInstitutes = await Institute.find({ status: 'approved' });
    console.log('✅ Approved institutes:', approvedInstitutes.length);
    
    // Test 2: Check if pending institutes query works  
    const pendingInstitutes = await Institute.find({ status: 'pending' });
    console.log('✅ Pending institutes:', pendingInstitutes.length);
    
    // Test 3: Check schema fields
    const sampleInstitute = await Institute.findOne();
    console.log('✅ Sample institute fields:', Object.keys(sampleInstitute.toObject()));
    
  } catch (error) {
    console.error('❌ Backend test failed:', error);
  }
};

testBackend();