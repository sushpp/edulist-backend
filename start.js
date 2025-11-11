const mongoose = require('mongoose');
require('dotenv').config();

// Import all models at once
const models = require('./models');

const app = require('./server');

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edulist', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log('📊 Registered models:', Object.keys(models).join(', '));
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
  });
})
.catch(err => {
  console.log('❌ MongoDB connection error:', err);
  process.exit(1);
});