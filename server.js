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
    'https://edulist-frontend-aud9-6yemo7esi-sushmitas-projects-64249a1d.vercel.app',
    process.env.FRONTEND_URL,
    process.env.FRONTEND_DEPLOY_URL
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =======================
// ✅ Rate Limiting
// =======================
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: 'fail',
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// =======================
// ✅ Route Configuration
// =======================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/institutes', require('./routes/institutes'));
app.use('/api/courses', require('./routes/courses')); // === FIXED: Corrected path ===
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/enquiries', require('./routes/enquiries')); // === REMOVED DUPLICATE ===
app.use('/api/facilities', require('./routes/facilities'));
app.use('/api/analytics', require('./routes/analytics')); // === FIXED: Corrected path ===
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
    environment: process.env.NODE_ENV || 'development', // === FIXED: Corrected variable name ===
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected' // === FIXED: Corrected string ===
  });
});

// =======================
// ✅ Basic Info Route
// =======================
app.get('/', (req, res) => {
  res.json({ 
    message: 'EduList Backend API is running!',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development', // === FIXED: Corrected variable name ===
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
  // Serve static files from uploads directory
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  
  // Serve frontend build
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Handle SPA routing
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
}

// =======================
// ✅ Error Handling Middleware
// =======================
app.use((err, req, res, next) => {
  console.error('🔴 Error Stack:', err.stack);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') { // === FIXED: Check `err` object ===
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      message: 'Validation Error',
      errors: messages
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ // === FIXED: Removed typo `that` ===
      message: `Duplicate field value: ${field}`,
      error: `This ${field} already exists`
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') { // === FIXED: Corrected string ===
    return res.status(401).json({
      message: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') { // === ADDED: Check for expired token ===
    return res.status(401).json({
      message: 'Token expired'
    });
  }
  
  // Default error
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
  app.listen(PORT, () => { // === FIXED: Corrected arrow function syntax ===
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