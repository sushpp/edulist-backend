const mongoose = require('mongoose');
require('dotenv').config();

const emergencyFix = async () => {
  try {
    console.log('🚨 EMERGENCY FIX: Removing all duplicate indexes...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edulist');
    console.log('✅ Connected to MongoDB');

    const institutesCollection = mongoose.connection.collection('institutes');
    
    // Get all indexes
    const indexes = await institutesCollection.getIndexes();
    console.log('📋 All indexes:', Object.keys(indexes));
    
    // Drop ALL indexes except the default _id_ index
    for (const indexName of Object.keys(indexes)) {
      if (indexName !== '_id_') {
        console.log(`🗑️ Dropping index: ${indexName}`);
        try {
          await institutesCollection.dropIndex(indexName);
          console.log(`✅ Dropped index: ${indexName}`);
        } catch (error) {
          console.log(`ℹ️ Could not drop ${indexName}:`, error.message);
        }
      }
    }

    console.log('🎉 ALL problematic indexes removed!');
    
  } catch (error) {
    console.error('❌ Error in emergency fix:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit();
  }
};

emergencyFix();