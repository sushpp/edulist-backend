const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Institute = require('./models/Institute');
const dotenv = require('dotenv');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edulist');
    
    console.log('🗑️ Clearing existing data...');
    await User.deleteMany({});
    await Institute.deleteMany({});

    // Create admin user
    console.log('👤 Creating admin user...');
    const hashedAdminPassword = await bcrypt.hash('admin123', 12);
    const adminUser = new User({
      name: 'System Administrator',
      email: 'admin@edulist.com',
      password: hashedAdminPassword,
      phone: '+1234567890',
      role: 'admin',
      isActive: true
    });
    await adminUser.save();

    // Create sample institute user
    console.log('🏫 Creating sample institute...');
    const hashedInstitutePassword = await bcrypt.hash('institute123', 12);
    const instituteUser = new User({
      name: 'ABC Public School',
      email: 'school@example.com',
      password: hashedInstitutePassword,
      phone: '+1234567891',
      role: 'institute',
      isActive: true
    });
    await instituteUser.save();

    // Create institute profile
    const institute = new Institute({
      user: instituteUser._id,
      name: 'ABC Public School',
      category: 'School',
      affiliation: 'CBSE',
      address: '123 Education Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      phone: '+1234567891',
      email: 'school@example.com',
      website: 'https://abcschool.edu',
      description: 'A premier educational institution focused on holistic development of students.',
      facilities: ['Library', 'Sports', 'Laboratory', 'Computer Lab'],
      status: 'approved'
    });
    await institute.save();

    // Create sample student user
    console.log('🎓 Creating sample student...');
    const hashedStudentPassword = await bcrypt.hash('student123', 12);
    const studentUser = new User({
      name: 'John Student',
      email: 'student@example.com',
      password: hashedStudentPassword,
      phone: '+1234567892',
      role: 'user',
      isActive: true
    });
    await studentUser.save();

    console.log('✅ Database seeded successfully!');
    console.log('📋 Demo Credentials:');
    console.log('   Admin: admin@edulist.com / admin123');
    console.log('   Institute: school@example.com / institute123');
    console.log('   Student: student@example.com / student123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();