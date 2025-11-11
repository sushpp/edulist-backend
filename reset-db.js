const mongoose = require('mongoose');
require('dotenv').config();

const resetDatabase = async () => {
  try {
    console.log('🔄 Resetting database...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edulist');
    console.log('✅ Connected to MongoDB');

    // Drop the entire database
    await mongoose.connection.db.dropDatabase();
    console.log('✅ Database dropped successfully');

    // Create fresh collections with proper schemas
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      phone: String,
      password: String,
      role: String
    }));

    const Institute = mongoose.model('Institute', new mongoose.Schema({
      user: mongoose.Schema.Types.ObjectId,
      name: String,
      category: String,
      affiliation: String,
      address: Object,
      contact: Object,
      description: String
    }));

    console.log('✅ Fresh collections created');
    console.log('🎉 Database reset completed! You can now register without index errors.');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit();
  }
};

resetDatabase();