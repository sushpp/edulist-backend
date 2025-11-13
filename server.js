const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// =======================
// ✅ Middleware Configuration
// =======================
app.use(cors({
  origin: [
    'http://localhost:3000',
    // === FIXED URL ===
    'https://edulist-frontend-aud9-q1w8pfwzi-sushmitas-projects-64249a1d.vercel.app',
    // === ROBUST FIX: Allow all subdomains of vercel.app ===
    // This regex matches any URL that ends with .vercel.app
    /https:\/\/.*\.vercel\.app$/,
    // ===================================
    process.env.FRONTEND_URL,
    process.env.FRONTEND_DEPLOY_URL
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =======================
// ✅ Database Connection
// =======================
const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error('❌ MONGODB_URI is not defined in .env');
    }

    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

// =======================
// ✅ Route Configuration
// =======================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/institutes', require('./routes/institutes'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/enquiries', require('./routes/enquiries'));
app.use('/api/facilities', require('./routes/facilities'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/admin', require('./routes/admin'));

// =======================
// ✅ Health Check Route
// =======================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'EduList Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// =======================
// ✅ Basic Info Route
// =======================
app.get('/', (req, res) => {
  res.json({ 
    message: 'EduList Backend API is running!',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      institutes: '/api/institutes',
      courses: '/api/courses',
      reviews: '/api/reviews',
      enquiries: '/api/enquiries',
      facilities: '/api/facilities',
      analytics: '/api/analytics',
      upload: '/api/upload',
      admin: '/api/admin',
      health: '/api/health'
    }
  });
});

// =======================
// ✅ Production Setup
// =======================
if (process.env.NODE_ENV === 'production') {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
}

// =======================
// ✅ Error Handling Middleware
// =======================
app.use((err, req, res, next) => {
  console.error('🔴 Error Stack:', err.stack);
  
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      message: 'Validation Error',
      errors: messages
    });
  }
  
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      message: `Duplicate field value: ${field}`,
      error: `This ${field} already exists`
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }
  
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

// =======================
// ✅ 404 Handler
// =======================
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// =======================
// ✅ Server Startup
// =======================
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log('\n🚀 EduList Backend Server Started');
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API URL: http://localhost:${PORT}/api`);
    console.log(`❤️ Health Check: http://localhost:${PORT}/api/health`);
    
    if (process.env.NODE_ENV === 'production') {
      console.log('🏗️ Serving frontend from build directory');
    }
  });
});

// =======================
// ✅ Graceful Shutdown
// =======================
process.on('SIGINT', async () => {
  console.log('\n🔻 Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed.');
  process.exit(0);
});

module.exports = app;