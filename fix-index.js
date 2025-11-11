const mongoose = require('mongoose');
require('dotenv').config();

const fixIndex = async () => {
  try {
    console.log('🔧 Fixing duplicate index issue...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edulist');
    console.log('✅ Connected to MongoDB');

    // Get the institutes collection
    const institutesCollection = mongoose.connection.collection('institutes');
    
    // Get all indexes
    const indexes = await institutesCollection.getIndexes();
    console.log('📋 Current indexes:', Object.keys(indexes));
    
    // Check if the problematic index exists and drop it
    if (indexes['contact.email_1']) {
      console.log('🗑️ Dropping problematic index: contact.email_1');
      await institutesCollection.dropIndex('contact.email_1');
      console.log('✅ Index dropped successfully');
    } else if (indexes['email_1']) {
      console.log('🗑️ Dropping problematic index: email_1');
      await institutesCollection.dropIndex('email_1');
      console.log('✅ Index dropped successfully');
    } else {
      console.log('ℹ️ No problematic index found');
    }

    // Create a sparse index instead (allows multiple nulls)
    console.log('📝 Creating sparse index...');
    await institutesCollection.createIndex(
      { 'contact.email': 1 }, 
      { 
        unique: true, 
        sparse: true,
        name: 'contact_email_sparse'
      }
    );
    console.log('✅ Sparse index created successfully');

    console.log('🎉 Index fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing index:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit();
  }
};

fixIndex();