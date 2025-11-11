const axios = require('axios');

const testBackend = async () => {
  try {
    console.log('Testing backend connection...');
    
    const response = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Backend is running:', response.data);
    
    const testResponse = await axios.get('http://localhost:5000/api/test');
    console.log('✅ Test endpoint working:', testResponse.data);
    
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    console.log('Make sure the backend server is running on port 5000');
  }
};

testBackend();