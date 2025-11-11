const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter (only allow images)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed!'), false);
};

// Base upload config
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Export single upload directly
module.exports = upload;

// Optional: if you want multiple uploads as well
module.exports.uploadMultiple = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
  { name: 'gallery', maxCount: 10 }
]);
