const express = require('express');
const cors = require('cors');

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

app.use(express.json());

// Simple test routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Simple test server is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint working!' });
});

// Mock institutes data for testing
app.get('/api/institutes', (req, res) => {
  const mockInstitutes = [
    {
      _id: '1',
      name: 'Delhi Public School',
      category: 'school',
      affiliation: 'CBSE',
      address: {
        city: 'New Delhi',
        state: 'Delhi'
      },
      rating: {
        average: 4.5,
        count: 28
      },
      facilities: ['Library', 'Sports', 'Lab'],
      courses: [{ title: 'Science' }, { title: 'Commerce' }]
    },
    {
      _id: '2',
      name: 'St. Xavier\'s College',
      category: 'college',
      affiliation: 'University of Delhi',
      address: {
        city: 'Mumbai',
        state: 'Maharashtra'
      },
      rating: {
        average: 4.7,
        count: 35
      },
      facilities: ['Library', 'Hostel', 'Cafeteria'],
      courses: [{ title: 'B.Sc Computer Science' }]
    }
  ];
  
  res.json({
    institutes: mockInstitutes,
    totalPages: 1,
    currentPage: 1,
    total: 2
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🎯 Simple test server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}/api`);
});