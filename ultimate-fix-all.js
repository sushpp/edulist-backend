const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

console.log('🚀 ULTIMATE FIX - Creating Fresh Database with EVERYTHING...');

mongoose.connect('mongodb://127.0.0.1:27017/edulist')
  .then(async () => {
    try {
      console.log('✅ Connected to MongoDB');
      
      // Clear EVERYTHING
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
      console.log('✅ Cleared all existing data');
      
      // Define models
      const User = mongoose.model('User', new mongoose.Schema({
        name: String, email: String, password: String, role: String, phone: String
      }));
      
      const Institute = mongoose.model('Institute', new mongoose.Schema({
        name: String, category: String, affiliation: String, address: String,
        city: String, state: String, contactEmail: String, contactPhone: String,
        description: String, facilities: [String], courses: [Object],
        adminApproved: Boolean, verified: Boolean, userId: Object, createdAt: Date
      }));

      // Step 1: Create users with GUARANTEED working passwords
      console.log('\n👥 Creating users with WORKING passwords...');
      
      const users = [
        {
          name: 'Admin User',
          email: 'admin@edulist.com',
          phone: '1234567890',
          password: await bcrypt.hash('admin123', 12),
          role: 'admin'
        },
        {
          name: 'Rahul Sharma',
          email: 'rahul@example.com',
          phone: '9876543210',
          password: await bcrypt.hash('password123', 12),
          role: 'user'
        },
        {
          name: 'RLS College',
          email: 'rlsclg@gmail.com',
          phone: '9876543212',
          password: await bcrypt.hash('password123', 12),
          role: 'institute'
        }
      ];

      for (const userData of users) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created: ${user.name} (${user.email})`);
        
        // Verify password works
        const testPassword = user.role === 'admin' ? 'admin123' : 'password123';
        const isValid = await bcrypt.compare(testPassword, user.password);
        console.log(`   🔐 Password test: ${isValid ? '✅ WORKS' : '❌ FAILED'}`);
      }

      // Step 2: Create PENDING institutes for admin panel
      console.log('\n🏫 Creating PENDING institutes for admin panel...');
      
      const pendingInstitutes = [
        {
          name: 'ABC Public School - PENDING',
          category: 'school',
          affiliation: 'CBSE',
          address: '123 Main Street, Delhi',
          city: 'Delhi',
          state: 'Delhi',
          contactEmail: 'abc.school@example.com',
          contactPhone: '9876543201',
          description: 'A leading CBSE school waiting for approval',
          facilities: ['Library', 'Sports', 'Lab', 'Transport'],
          courses: [
            {
              title: 'Science Stream',
              description: 'Physics, Chemistry, Biology',
              duration: '2 years',
              fees: 120000
            }
          ],
          adminApproved: false, // IMPORTANT: This makes it PENDING
          verified: false,
          userId: await User.findOne({email: 'rlsclg@gmail.com'}).then(u => u._id),
          createdAt: new Date()
        },
        {
          name: 'XYZ Coaching Center - PENDING',
          category: 'coaching',
          affiliation: 'Private',
          address: '456 Coaching Street, Mumbai',
          city: 'Mumbai',
          state: 'Maharashtra',
          contactEmail: 'xyz.coaching@example.com',
          contactPhone: '9876543202',
          description: 'Best coaching for competitive exams',
          facilities: ['Library', 'Test Series', 'Doubt Classes'],
          courses: [
            {
              title: 'IIT-JEE Preparation',
              description: 'Complete IIT-JEE coaching',
              duration: '2 years',
              fees: 250000
            }
          ],
          adminApproved: false, // IMPORTANT: This makes it PENDING
          verified: false,
          userId: await User.findOne({email: 'rlsclg@gmail.com'}).then(u => u._id),
          createdAt: new Date()
        }
      ];

      for (const instData of pendingInstitutes) {
        const institute = new Institute(instData);
        await institute.save();
        console.log(`✅ Created PENDING institute: ${institute.name}`);
        console.log(`   📧 ${institute.contactEmail} | Approved: ${institute.adminApproved}`);
      }

      // Step 3: Create APPROVED institutes
      console.log('\n🏫 Creating APPROVED institutes...');
      
      const approvedInstitutes = [
        {
          name: 'Delhi Public School - APPROVED',
          category: 'school',
          affiliation: 'CBSE',
          address: '789 Education Road, Delhi',
          city: 'Delhi',
          state: 'Delhi',
          contactEmail: 'dps@example.com',
          contactPhone: '9876543203',
          description: 'One of the top schools in Delhi',
          facilities: ['Smart Classes', 'Sports Complex', 'Science Lab'],
          courses: [
            {
              title: 'All Streams',
              description: 'Complete school education',
              duration: '12 years',
              fees: 150000
            }
          ],
          adminApproved: true, // This makes it APPROVED
          verified: true,
          createdAt: new Date()
        }
      ];

      for (const instData of approvedInstitutes) {
        const institute = new Institute(instData);
        await institute.save();
        console.log(`✅ Created APPROVED institute: ${institute.name}`);
      }

      // Final verification
      console.log('\n📊 FINAL DATABASE STATUS:');
      console.log('========================');
      console.log(`👥 Total Users: ${await User.countDocuments()}`);
      console.log(`🏫 Total Institutes: ${await Institute.countDocuments()}`);
      console.log(`⏳ Pending Institutes: ${await Institute.countDocuments({adminApproved: false})}`);
      console.log(`✅ Approved Institutes: ${await Institute.countDocuments({adminApproved: true})}`);

      console.log('\n🎉 ULTIMATE FIX COMPLETE!');
      console.log('\n🔐 GUARANTEED WORKING LOGINS:');
      console.log('============================');
      console.log('ADMIN PANEL:');
      console.log('   📧 admin@edulist.com');
      console.log('   🔑 admin123');
      console.log('\nINSTITUTE LOGIN:');
      console.log('   📧 rlsclg@gmail.com');
      console.log('   🔑 password123');
      console.log('\nUSER LOGIN:');
      console.log('   📧 rahul@example.com');
      console.log('   🔑 password123');

      console.log('\n🏫 IN ADMIN PANEL YOU WILL SEE:');
      console.log('   ⏳ 2 PENDING institutes waiting for approval');
      console.log('   ✅ 1 APPROVED institute');

      mongoose.connection.close();
      console.log('\n🚀 Start your server with: npm start');

    } catch (error) {
      console.error('❌ Error:', error);
      mongoose.connection.close();
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err);
    console.log('\n💡 Make sure MongoDB is running!');
    console.log('   On Windows: "net start MongoDB"');
  });