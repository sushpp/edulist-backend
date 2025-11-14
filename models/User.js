// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'institute', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
    profileImage: {
      filename: String,
      originalName: String,
      path: String,
      url: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
