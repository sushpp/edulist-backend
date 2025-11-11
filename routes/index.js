const express = require('express');
const authRoutes = require('./auth');
const instituteRoutes = require('./institutes');
const adminRoutes = require('./admin');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/institutes', instituteRoutes);
router.use('/admin', adminRoutes);

module.exports = router;