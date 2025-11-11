const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

console.log('🏫 Creating Test Institute for Admin Panel...');

mongoose.connect('mongodb://127.0.0.1:27017/edulist')
  .then(async () => {
    try {
      const User = mongoose.model('User');
      const Institute = mongoose.model('Institute');
      
      // Check if test institute already exists
      const existingInstitute = await Institute.findOne({ name: 'Test Institute Pending' });
      if (existingInstitute) {
        console.log('⚠️ Test institute already exists');
        console.log('🗑️ Deleting and recreating...');
        await Institute.deleteOne({ _id: existingInstitute._id });
        await User.deleteOne({ email: 'testinstitute@example.com' });
      }
      
      // Create user for institute
      const user = new User({
        name: 'Test Institute Owner',
        email: 'testinstitute@example.com',
        phone: '9876543215',
        password: 'password123',
        role: 'institute'
      });
      await user.save();
      console.log('✅ Created institute user');
      
      // Create institute with adminApproved: false (PENDING)
      const institute = new Institute({
        name: 'Test Institute Pending',
        category: 'coaching',
        affiliation: 'Test Board',
        address: '123 Test Street, Test City',
        city: 'Delhi',
        state: 'Delhi',
        contactEmail: 'testinstitute@example.com',
        contactPhone: '9876543215',
        description: 'This is a test institute for admin approval',
        facilities: ['Library', 'Lab'],
        courses: [
          {
            title: 'Test Course',
            description: 'This is a test course',
            duration: '1 year',
            fees: 50000
          }
        ],
        adminApproved: false, // This is important - should be FALSE for pending
        verified: false,
        userId: user._id
      });
      
      await institute.save();
      console.log('✅ Created test institute (PENDING APPROVAL)');
      console.log('📧 Email: testinstitute@example.com');
      console.log('🔑 Password: password123');
      console.log('⏳ Status: Pending Admin Approval');
      
      // Verify it was created correctly
      const pendingCount = await Institute.countDocuments({ adminApproved: false });
      console.log(`\n📊 Pending institutes in database: ${pendingCount}`);
      
      mongoose.connection.close();
      console.log('\n🎉 Now check your admin panel - you should see the pending institute!');
      
    } catch (error) {
      console.error('Error:', error);
      mongoose.connection.close();
    }
  });