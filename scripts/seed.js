const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Institute = require('../models/Institute');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edulist');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Institute.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create Admin User
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@edulist.com',
      phone: '9876543210',
      password: adminPassword,
      role: 'admin',
      isActive: true
    });
    await adminUser.save();
    console.log('👑 Admin user created');

    // Create VERIFIED Institutes (for testing login)
    const verifiedInstitutes = [
      {
        name: 'Delhi Public School',
        category: 'school',
        affiliation: 'CBSE',
        address: {
          street: 'RK Puram',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110066'
        },
        contact: {
          phone: '011-12345678',
          email: 'info@dpsdelhi.com',
          website: 'https://dpsdelhi.com'
        },
        description: 'One of the premier educational institutions in Delhi.',
        establishedYear: 1949,
        isVerified: true
      }
    ];

    for (const instituteData of verifiedInstitutes) {
      const institutePassword = await bcrypt.hash('institute123', 10);
      const user = new User({
        name: instituteData.name,
        email: instituteData.contact.email,
        phone: instituteData.contact.phone,
        password: institutePassword,
        role: 'institute',
        isActive: true
      });
      await user.save();

      const institute = new Institute({
        ...instituteData,
        user: user._id,
        isVerified: true // This institute can login
      });
      await institute.save();
      console.log(`🏫 Verified Institute created: ${instituteData.name}`);
    }

    // Create PENDING Institutes (need admin approval)
    const pendingInstitutes = [
      {
        name: 'New Tech Institute',
        category: 'coaching',
        affiliation: 'Coaching Center',
        address: {
          city: 'Mumbai',
          state: 'Maharashtra'
        },
        contact: {
          phone: '022-98765432',
          email: 'pending@newtech.com',
          website: 'https://newtech.com'
        },
        description: 'New coaching institute waiting for approval.',
        establishedYear: 2023,
        isVerified: false
      },
      {
        name: 'Future Kids Preschool',
        category: 'preschool',
        affiliation: 'Early Childhood',
        address: {
          city: 'Bangalore',
          state: 'Karnataka'
        },
        contact: {
          phone: '080-12345678',
          email: 'info@futurekids.com'
        },
        description: 'New preschool waiting for admin approval.',
        establishedYear: 2022,
        isVerified: false
      }
    ];

    for (const instituteData of pendingInstitutes) {
      const institutePassword = await bcrypt.hash('institute123', 10);
      const user = new User({
        name: instituteData.name,
        email: instituteData.contact.email,
        phone: instituteData.contact.phone,
        password: institutePassword,
        role: 'institute',
        isActive: true
      });
      await user.save();

      const institute = new Institute({
        ...instituteData,
        user: user._id,
        isVerified: false, // These institutes cannot login yet
        adminResponse: {
          status: 'pending'
        }
      });
      await institute.save();
      console.log(`⏳ Pending Institute created: ${instituteData.name}`);
    }

    // Create sample regular users
    const regularUsers = [
      {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        phone: '9876543211',
        password: await bcrypt.hash('user123', 10),
        role: 'user',
        isActive: true
      },
      {
        name: 'Priya Singh',
        email: 'priya@example.com',
        phone: '9876543212',
        password: await bcrypt.hash('user123', 10),
        role: 'user',
        isActive: true
      }
    ];

    for (const userData of regularUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`👤 User created: ${userData.name}`);
    }

    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('👑 Admin: admin@edulist.com / admin123');
    console.log('🏫 Verified Institute (can login): info@dpsdelhi.com / institute123');
    console.log('⏳ Pending Institute (cannot login): pending@newtech.com / institute123');
    console.log('👤 User: rahul@example.com / user123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();