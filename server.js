const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// =======================
// ✅ ENHANCED CORS Configuration
// =======================
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://edulist-frontend-aud9.vercel.app',
      // Match all Vercel preview and production URLs
      /https:\/\/edulist-frontend-aud9-.*\.vercel\.app$/,
      /https:\/\/edulist-frontend-.*\.vercel\.app$/,
      // Add your specific Vercel URLs
      'https://edulist-frontend-aud9-9ugnqsnsi-sushmitas-projects-64249a1d.vercel.app',
      'https://edulist-frontend-aud9-q1w8pfwzi-sushmitas-projects-64249a1d.vercel.app',
      process.env.FRONTEND_URL,
      process.env.FRONTEND_DEPLOY_URL
    ].filter(Boolean);

    // Check if the origin is allowed
    if (allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return allowedOrigin === origin;
    })) {
      callback(null, true);
    } else {
      console.log('🔴 CORS Blocked Origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range'
  ],
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests globally
app.options('*', cors(corsOptions));

// =======================
// ✅ Enhanced Middleware
// =======================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
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
// ✅ Enhanced Health Check Route
// =======================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'EduList Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    cors: {
      enabled: true,
      allowedOrigins: corsOptions.origin.toString()
    }
  });
});

// =======================
// ✅ CORS Test Endpoint
// =======================
app.get('/api/cors-test', (req, res) => {
  res.json({
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
    corsEnabled: true
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
    cors: 'Enabled with dynamic origin checking',
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
      health: '/api/health',
      corsTest: '/api/cors-test'
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
// ✅ Enhanced Error Handling Middleware
// =======================
app.use((err, req, res, next) => {
  console.error('🔴 Error Stack:', err.stack);
  
  // Handle CORS errors specifically
  if (err.message.includes('CORS') || err.message.includes('Not allowed by CORS')) {
    return res.status(403).json({
      message: 'CORS Error: Origin not allowed',
      origin: req.headers.origin,
      allowedOrigins: 'Vercel domains and localhost'
    });
  }
  
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
    method: req.method,
    allowedEndpoints: [
      '/api/auth',
      '/api/users', 
      '/api/institutes',
      '/api/courses',
      '/api/reviews',
      '/api/enquiries',
      '/api/facilities',
      '/api/analytics',
      '/api/upload',
      '/api/admin',
      '/api/health',
      '/api/cors-test'
    ]
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
    console.log(`🔄 CORS Test: http://localhost:${PORT}/api/cors-test`);
    console.log(`🌐 CORS Enabled: Dynamic origin checking`);
    
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