const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/edulist', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

const testPasswords = async () => {
  try {
    console.log('🔐 Testing passwords...');
    
    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);
    
    for (const user of users) {
      console.log(`\n👤 User: ${user.name} (${user.email})`);
      console.log(`📝 Password hash: ${user.password}`);
      
      // Test with common passwords
      const testPasswords = ['password123', 'admin123', 'password', '123456'];
      
      for (const testPassword of testPasswords) {
        const isValid = await user.comparePassword(testPassword);
        console.log(`🔑 Testing "${testPassword}": ${isValid}`);
        if (isValid) {
          console.log(`✅ CORRECT PASSWORD: "${testPassword}"`);
        }
      }
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
};

testPasswords();