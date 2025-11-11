const mongoose = require('mongoose');
const User = require('./models/User');
const Institute = require('./models/Institute');
const Course = require('./models/Course');
const Review = require('./models/Review');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/edulist', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Institute.deleteMany({});
    await Course.deleteMany({});
    await Review.deleteMany({});

    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      name: 'System Administrator',
      email: 'admin@edulist.com',
      phone: '9876543210',
      password: adminPassword,
      role: 'admin'
    });
    await adminUser.save();
    console.log('Admin user created');

    // Create sample institutes with real data
    const institutes = [
      {
        name: 'Delhi Public School, RK Puram',
        category: 'school',
        affiliation: 'CBSE',
        address: {
          street: 'Dr. S. Radhakrishnan Marg',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110022'
        },
        contact: {
          phone: '011-26171267',
          email: 'principal@dpsrkp.net',
          website: 'https://dpsrkp.com'
        },
        description: 'Delhi Public School, R.K. Puram is a co-educational school affiliated to the Central Board of Secondary Education. Established in 1972, it is known for its academic excellence and holistic development approach.',
        facilities: [
          { name: 'Library', description: 'Fully automated library with 40,000+ books and digital resources' },
          { name: 'Science Labs', description: 'Well-equipped physics, chemistry, and biology laboratories' },
          { name: 'Sports Complex', description: 'Olympic-sized swimming pool, basketball courts, and football field' },
          { name: 'Computer Lab', description: 'State-of-the-art computer laboratory with latest technology' }
        ]
      },
      {
        name: 'St. Stephen\'s College',
        category: 'college',
        affiliation: 'University of Delhi',
        address: {
          street: 'University Enclave',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110007'
        },
        contact: {
          phone: '011-27667251',
          email: 'principal@ststephens.edu',
          website: 'https://ststephens.edu'
        },
        description: 'St. Stephen\'s College is a constituent college of the University of Delhi, widely regarded as one of the best liberal arts colleges in India. Established in 1881, it offers undergraduate and postgraduate programs.',
        facilities: [
          { name: 'College Library', description: 'Rare collection of books and research materials' },
          { name: 'Seminar Halls', description: 'Air-conditioned seminar halls for academic discussions' },
          { name: 'Hostel Facilities', description: 'Separate hostel accommodation for boys and girls' },
          { name: 'Research Center', description: 'Advanced research facilities for various disciplines' }
        ]
      },
      {
        name: 'Aakash Educational Services',
        category: 'coaching',
        affiliation: 'IIT-JEE & NEET Foundation',
        address: {
          street: 'Plot No. 11, Central Market',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110060'
        },
        contact: {
          phone: '011-41587545',
          email: 'info@aakash.ac.in',
          website: 'https://aakash.ac.in'
        },
        description: 'Aakash Institute is a premier coaching institute for medical and engineering entrance examinations. With over 30 years of experience, it has produced numerous IIT and medical college selections.',
        facilities: [
          { name: 'Study Material', description: 'Comprehensive study material and test series' },
          { name: 'Doubt Classes', description: 'Regular doubt clearing sessions with expert faculty' },
          { name: 'Online Portal', description: 'Digital learning platform with recorded lectures' },
          { name: 'Test Series', description: 'Regular mock tests and performance analysis' }
        ]
      }
    ];

    for (const instituteData of institutes) {
      // Create user for institute
      const institutePassword = await bcrypt.hash('institute123', 10);
      const instituteUser = new User({
        name: instituteData.name,
        email: instituteData.contact.email,
        phone: instituteData.contact.phone,
        password: institutePassword,
        role: 'institute'
      });
      await instituteUser.save();

      // Create institute
      const institute = new Institute({
        user: instituteUser._id,
        ...instituteData,
        status: 'approved',
        verified: true
      });
      await institute.save();

      // Create sample courses
      const courses = [
        {
          title: 'Science Stream (Class 11-12)',
          description: 'Comprehensive science program with Physics, Chemistry, Mathematics, and Biology for CBSE curriculum.',
          duration: '2 years',
          fees: 120000,
          category: 'science',
          facilities: ['Lab Access', 'Study Material', 'Test Series', 'Doubt Classes'],
          eligibility: 'Class 10 with minimum 75% marks'
        },
        {
          title: 'IIT-JEE Foundation Course',
          description: 'Specialized coaching for IIT-JEE entrance examination with expert faculty and comprehensive study material.',
          duration: '1 year',
          fees: 150000,
          category: 'engineering',
          facilities: ['Mock Tests', 'Online Portal', 'Study Material', 'Doubt Classes'],
          eligibility: 'Class 11-12 Science students'
        }
      ];

      for (const courseData of courses) {
        const course = new Course({
          institute: institute._id,
          ...courseData
        });
        await course.save();
      }

      console.log(`Created institute: ${instituteData.name}`);
    }

    // Create sample regular users
    const regularUsers = [
      {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        phone: '9876543211',
        password: await bcrypt.hash('user123', 10),
        role: 'user'
      },
      {
        name: 'Priya Singh',
        email: 'priya@example.com',
        phone: '9876543212',
        password: await bcrypt.hash('user123', 10),
        role: 'user'
      }
    ];

    for (const userData of regularUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${userData.name}`);
    }

    console.log('Database seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();