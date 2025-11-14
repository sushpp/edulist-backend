// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// CORS
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://edulist-frontend-aud9.vercel.app',
      process.env.FRONTEND_URL,
      process.env.FRONTEND_DEPLOY_URL
    ].filter(Boolean);

    if (allowedOrigins.some(o => (o instanceof RegExp ? o.test(origin) : o === origin))) {
      return callback(null, true);
    }
    console.log('CORS blocked', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect DB
const MONGODB_URI = process.env.MONGODB_URI;
const connectDB = async () => {
  try {
    if (!MONGODB_URI) throw new Error('MONGODB_URI missing');
    const conn = await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB Connected:', conn.connection.host);
  } catch (err) {
    console.error('DB connect error', err);
    process.exit(1);
  }
};

// Routes
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

// Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.originalUrl });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('ERROR MIDDLEWARE', err.stack || err);
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ message: 'CORS error' });
  }
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// Start
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
  });
});

module.exports = app;
