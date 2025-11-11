const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const cleanupDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edulist');
    console.log('✅ Connected to MongoDB');

    // Find duplicate users by email
    const duplicates = await User.aggregate([
      {
        $group: {
          _id: '$email',
          count: { $sum: 1 },
          ids: { $push: '$_id' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    console.log(`🔍 Found ${duplicates.length} duplicate email entries`);

    for (const duplicate of duplicates) {
      console.log(`📧 Email: ${duplicate._id}, Count: ${duplicate.count}`);
      
      // Keep the first user, delete the rest
      const usersToKeep = duplicate.ids.slice(0, 1);
      const usersToDelete = duplicate.ids.slice(1);
      
      if (usersToDelete.length > 0) {
        console.log(`🗑️  Deleting ${usersToDelete.length} duplicates for ${duplicate._id}`);
        await User.deleteMany({ _id: { $in: usersToDelete } });
      }
    }

    console.log('✅ Database cleanup completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    process.exit(1);
  }
};

cleanupDatabase();