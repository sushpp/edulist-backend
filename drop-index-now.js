const { MongoClient } = require('mongodb');

async function dropProblematicIndex() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const database = client.db('test'); // or 'edulist' if that's your db name
    const institutes = database.collection('institutes');
    
    // Get all indexes
    const indexes = await institutes.indexes();
    console.log('📋 Current indexes:');
    indexes.forEach(index => {
      console.log(' -', index.name, '->', index.key);
    });
    
    // Drop the problematic index
    try {
      await institutes.dropIndex('email_1');
      console.log('✅ Successfully dropped email_1 index');
    } catch (e) {
      console.log('ℹ️ email_1 index already dropped or does not exist');
    }
    
    // Also drop contact.email_1 if it exists
    try {
      await institutes.dropIndex('contact.email_1');
      console.log('✅ Successfully dropped contact.email_1 index');
    } catch (e) {
      console.log('ℹ️ contact.email_1 index already dropped or does not exist');
    }
    
    console.log('🎉 Index cleanup completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

dropProblematicIndex();