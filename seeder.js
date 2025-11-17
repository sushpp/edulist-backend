const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Institute = require('./models/Institute');
const Course = require('./models/Course');
const Facility = require('./models/Facility');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');

    // Clear existing data
    await User.deleteMany({});
    await Institute.deleteMany({});
    await Course.deleteMany({});
    await Facility.deleteMany({});

    // Create admin user
    const adminSalt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('admin123', adminSalt);
    
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@edulist.com',
      password: adminHash,
      role: 'admin',
      phone: '1234567890',
    });
    await adminUser.save();
    console.log('Admin user created');

    // Create institutes
    const institutes = [
      {
        name: 'Bright Future Academy',
        category: 'School',
        affiliation: 'CBSE',
        address: '123 Education Street',
        city: 'New Delhi',
        state: 'Delhi',
        contactInfo: '+91-9876543210',
        website: 'www.brightfutureacademy.com',
        description: 'A premier educational institution dedicated to nurturing young minds with quality education and holistic development.',
        facilities: ['Library', 'Science Lab', 'Computer Lab', 'Sports Ground'],
        courses: [
          { title: 'Primary Education', description: 'Grades 1-5 with focus on foundational learning', duration: '5 years', fees: 50000 },
          { title: 'Middle School', description: 'Grades 6-8 with comprehensive curriculum', duration: '3 years', fees: 60000 },
          { title: 'High School', description: 'Grades 9-12 with specialization options', duration: '4 years', fees: 70000 }
        ]
      },
      {
        name: 'Tech Institute of Excellence',
        category: 'College',
        affiliation: 'AICTE',
        address: '456 Technology Park',
        city: 'Bangalore',
        state: 'Karnataka',
        contactInfo: '+91-9876543211',
        website: 'www.techinstitute.edu',
        description: 'Leading engineering college offering cutting-edge technical education and research opportunities.',
        facilities: ['Advanced Labs', 'Library', 'Hostel', 'Sports Complex'],
        courses: [
          { title: 'Computer Science Engineering', description: '4-year B.Tech program with industry exposure', duration: '4 years', fees: 200000 },
          { title: 'Electronics Engineering', description: 'Comprehensive electronics and communication program', duration: '4 years', fees: 180000 },
          { title: 'Mechanical Engineering', description: 'Core engineering with practical applications', duration: '4 years', fees: 170000 }
        ]
      },
      {
        name: 'Global Business School',
        category: 'College',
        affiliation: 'AICTE',
        address: '789 Business Avenue',
        city: 'Mumbai',
        state: 'Maharashtra',
        contactInfo: '+91-9876543212',
        website: 'www.globalbusiness.edu',
        description: 'Premier business school developing future business leaders with global perspective.',
        facilities: ['Library', 'Computer Lab', 'Conference Rooms', 'Cafeteria'],
        courses: [
          { title: 'MBA - Finance', description: '2-year program specializing in financial management', duration: '2 years', fees: 300000 },
          { title: 'MBA - Marketing', description: 'Focus on modern marketing strategies and digital transformation', duration: '2 years', fees: 280000 },
          { title: 'BBA', description: '3-year undergraduate business program', duration: '3 years', fees: 150000 }
        ]
      },
      {
        name: 'Science Coaching Center',
        category: 'Coaching Center',
        affiliation: 'None',
        address: '321 Study Circle',
        city: 'Kota',
        state: 'Rajasthan',
        contactInfo: '+91-9876543213',
        website: 'www.sciencecoaching.com',
        description: 'Specialized coaching for JEE and NEET aspirants with experienced faculty.',
        facilities: ['Classrooms', 'Library', 'Test Center', 'Doubt Clearing Sessions'],
        courses: [
          { title: 'JEE Main + Advanced', description: 'Complete preparation for engineering entrance', duration: '1 year', fees: 80000 },
          { title: 'NEET Coaching', description: 'Medical entrance preparation program', duration: '1 year', fees: 75000 },
          { title: 'Foundation Course', description: 'Early preparation for 9th and 10th students', duration: '2 years', fees: 40000 }
        ]
      },
      {
        name: 'Little Angels Preschool',
        category: 'Preschool',
        affiliation: 'None',
        address: '555 Kids Street',
        city: 'Pune',
        state: 'Maharashtra',
        contactInfo: '+91-9876543214',
        website: 'www.littleangels.edu',
        description: 'Nurturing environment for early childhood development with play-based learning.',
        facilities: ['Play Area', 'Activity Room', 'Nap Room', 'Safe Outdoor Space'],
        courses: [
          { title: 'Play Group', description: 'Age 2-3 years with focus on play-based learning', duration: '1 year', fees: 30000 },
          { title: 'Nursery', description: 'Age 3-4 years with structured activities', duration: '1 year', fees: 35000 },
          { title: 'Kindergarten', description: 'Age 4-5 years preparing for formal school', duration: '1 year', fees: 40000 }
        ]
      },
      {
        name: 'Vocational Training Institute',
        category: 'Vocational Training',
        affiliation: 'NSDC',
        address: '888 Skill Center',
        city: 'Hyderabad',
        state: 'Telangana',
        contactInfo: '+91-9876543215',
        website: 'www.vocationaltraining.edu',
        description: 'Practical skill development programs for immediate employment opportunities.',
        facilities: ['Workshops', 'Computer Lab', 'Practice Areas', 'Placement Cell'],
        courses: [
          { title: 'Web Development', description: 'Full-stack development with modern technologies', duration: '6 months', fees: 45000 },
          { title: 'Digital Marketing', description: 'Comprehensive digital marketing strategies', duration: '3 months', fees: 25000 },
          { title: 'Graphic Design', description: 'Creative design with industry tools', duration: '4 months', fees: 30000 }
        ]
      },
      {
        name: 'Medical College of Excellence',
        category: 'College',
        affiliation: 'MCI',
        address: '999 Health Campus',
        city: 'Chennai',
        state: 'Tamil Nadu',
        contactInfo: '+91-9876543216',
        website: 'www.medicalcollege.edu',
        description: 'Premier medical institution with advanced healthcare education and research.',
        facilities: ['Anatomy Lab', 'Hospital', 'Library', 'Research Center'],
        courses: [
          { title: 'MBBS', description: '5.5-year medical degree program', duration: '5.5 years', fees: 1000000 },
          { title: 'BDS', description: '4-year dental surgery program', duration: '4 years', fees: 500000 },
          { title: 'Nursing', description: '4-year B.Sc Nursing program', duration: '4 years', fees: 200000 }
        ]
      },
      {
        name: 'Arts and Culture Academy',
        category: 'Other',
        affiliation: 'None',
        address: '777 Creative Lane',
        city: 'Jaipur',
        state: 'Rajasthan',
        contactInfo: '+91-9876543217',
        website: 'www.artsculture.edu',
        description: 'Preserving and promoting traditional and contemporary arts through quality education.',
        facilities: ['Art Studios', 'Dance Hall', 'Music Rooms', 'Exhibition Gallery'],
        courses: [
          { title: 'Classical Dance', description: 'Traditional dance forms with expert instructors', duration: '3 years', fees: 60000 },
          { title: 'Music - Vocal', description: 'Classical and contemporary vocal training', duration: '2 years', fees: 40000 },
          { title: 'Painting', description: 'Various painting techniques and styles', duration: '2 years', fees: 35000 }
        ]
      }
    ];

    // Create institute users and institutes
    for (let i = 0; i < institutes.length; i++) {
      const instituteData = institutes[i];
      
      // Create institute user
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('institute123', salt);
      
      const instituteUser = new User({
        name: `${instituteData.name} Admin`,
        email: `institute${i + 1}@edulist.com`,
        password: hash,
        role: 'institute',
        phone: `9876543${100 + i}`,
      });
      await instituteUser.save();

      // Create institute
      const newInstitute = new Institute({
        name: instituteData.name,
        category: instituteData.category,
        affiliation: instituteData.affiliation,
        address: instituteData.address,
        city: instituteData.city,
        state: instituteData.state,
        contactInfo: instituteData.contactInfo,
        website: instituteData.website,
        description: instituteData.description,
        userId: instituteUser._id,
        verifiedStatus: 'approved', // Set all as approved for demo
      });
      await newInstitute.save();

      // Create facilities
      for (const facilityName of instituteData.facilities) {
        const facility = new Facility({
          name: facilityName,
          description: `Well-equipped ${facilityName.toLowerCase()} for students`,
          instituteId: newInstitute._id,
        });
        await facility.save();
        newInstitute.facilities.push(facility._id);
      }

      // Create courses
      for (const courseData of instituteData.courses) {
        const course = new Course({
          title: courseData.title,
          description: courseData.description,
          duration: courseData.duration,
          fees: courseData.fees,
          instituteId: newInstitute._id,
        });
        await course.save();
        newInstitute.courses.push(course._id);
      }

      await newInstitute.save();
      console.log(`Created institute: ${instituteData.name}`);
    }

    // Create regular users
    const users = [
      { name: 'John Doe', email: 'john@example.com', phone: '9876543201' },
      { name: 'Jane Smith', email: 'jane@example.com', phone: '9876543202' },
      { name: 'Mike Johnson', email: 'mike@example.com', phone: '9876543203' },
      { name: 'Sarah Williams', email: 'sarah@example.com', phone: '9876543204' },
      { name: 'David Brown', email: 'david@example.com', phone: '9876543205' },
    ];

    for (const userData of users) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('user123', salt);
      
      const user = new User({
        name: userData.name,
        email: userData.email,
        password: hash,
        role: 'user',
        phone: userData.phone,
      });
      await user.save();
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();