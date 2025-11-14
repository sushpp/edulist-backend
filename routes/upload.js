// routes/upload.js
const express = require('express');
const router = express.Router();

// Placeholder for future uploads (Cloudinary recommended)
router.post('/', (req, res) => {
  res.status(501).json({ success: false, message: 'Upload endpoint not implemented. Use Cloudinary integration.' });
});

module.exports = router;
