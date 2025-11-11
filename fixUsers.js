const mongoose = require('mongoose');
const User = require('./models/User');
const Institute = require('./models/Institute');
require('dotenv').config();

const fixUserRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edulist');
    console.log('🔗 Connected to MongoDB');

    // Fix jain@gmail.com - should be user, not institute
    const jainUser = await User.findOne({ email: 'jain@gmail.com' });
    if (jainUser) {
      console.log('👤 Found jain@gmail.com, current role:', jainUser.role);
      
      if (jainUser.role === 'institute') {
        jainUser.role = 'user';
        await jainUser.save();
        console.log('✅ Fixed jain@gmail.com role to: user');
        
        // Delete any institute profile for this user
        await Institute.deleteOne({ user: jainUser._id });
        console.log('✅ Removed institute profile for jain@gmail.com');
      } else {
        console.log('✅ jain@gmail.com already has correct role: user');
      }
    } else {
      console.log('❌ jain@gmail.com not found in database');
    }

    // Verify all institutes are verified
    const institutes = await Institute.find({ verified: false });
    for (const institute of institutes) {
      institute.verified = true;
      await institute.save();
      console.log(`✅ Verified institute: ${institute.name}`);
    }

    // List all users
    const allUsers = await User.find().select('name email role');
    console.log('\n📊 ALL USERS IN DATABASE:');
    allUsers.forEach(user => {
      console.log(`   👤 ${user.name} (${user.email}) - ${user.role}`);
    });

    // List all institutes
    const allInstitutes = await Institute.find().select('name verified');
    console.log('\n🏫 ALL INSTITUTES IN DATABASE:');
    allInstitutes.forEach(inst => {
      console.log(`   🏫 ${inst.name} - Verified: ${inst.verified}`);
    });

    console.log('\n🎉 User roles fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing user roles:', error);
    process.exit(1);
  }
};

fixUserRoles();