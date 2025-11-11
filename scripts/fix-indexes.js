const mongoose = require('mongoose');
require('dotenv').config();

const fixIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edulist');
    console.log('✅ Connected to MongoDB');

    // Get the Institute collection
    const instituteCollection = mongoose.connection.collection('institutes');
    
    // List all indexes
    const indexes = await instituteCollection.getIndexes();
    console.log('📊 Current indexes:', Object.keys(indexes));
    
    // Drop the problematic email index if it exists
    if (indexes.email_1) {
      console.log('🗑️  Dropping problematic email index...');
      await instituteCollection.dropIndex('email_1');
      console.log('✅ Email index dropped successfully');
    }
    
    // Create new indexes without unique constraint on email
    console.log('🔧 Creating new indexes...');
    await instituteCollection.createIndex({ user: 1 }, { unique: true });
    await instituteCollection.createIndex({ isVerified: 1 });
    await instituteCollection.createIndex({ category: 1 });
    
    console.log('✅ Indexes fixed successfully');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
    process.exit(1);
  }
};

fixIndexes();