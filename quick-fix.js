const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/edulist', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

console.log('🔧 Running Quick Fix...');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String
});

const User = mongoose.model('User', userSchema);

const quickFix = async () => {
  try {
    console.log('🔄 Step 1: Clearing all users...');
    await User.deleteMany({});
    
    console.log('🔄 Step 2: Creating fresh users with proper passwords...');
    
    // Hash passwords properly
    const adminHash = await bcrypt.hash('admin123', 12);
    const userHash = await bcrypt.hash('password123', 12);
    
    const users = [
      {
        name: 'Admin User',
        email: 'admin@edulist.com',
        phone: '1234567890',
        password: adminHash,
        role: 'admin'
      },
      {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        phone: '9876543210',
        password: userHash,
        role: 'user'
      },
      {
        name: 'Priya Patel',
        email: 'priya@example.com',
        phone: '9876543211',
        password: userHash,
        role: 'user'
      }
    ];
    
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created: ${user.name} (${user.email})`);
      
      // Verify password
      const testPassword = user.role === 'admin' ? 'admin123' : 'password123';
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log(`   🔐 Password test: ${isValid}`);
    }
    
    console.log('\n🎉 QUICK FIX COMPLETE!');
    console.log('🔐 TEST LOGINS:');
    console.log('   Admin: admin@edulist.com / admin123');
    console.log('   User: rahul@example.com / password123');
    console.log('   User: priya@example.com / password123');
    
    mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Quick fix failed:', error);
    mongoose.connection.close();
  }
};

quickFix();