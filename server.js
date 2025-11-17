const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
// IMPORTANT: Added for file upload functionality
const fileupload = require("express-fileupload"); 
require("dotenv").config();

const app = express();

/* ---------------------------------------------------------
   CORS Configuration — Fix Preflight & Vercel URLs
------------------------------------------------------------ */
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://edulist-frontend-aud9.vercel.app",
  "https://edulist-frontend-aud9.vercel.app/",
];

// Dynamic regexp for all Vercel preview deployments
const vercelPreviewPattern = /^https:\/\/edulist-frontend-aud9-[a-z0-9-]+\.vercel\.app$/;

// Include environment-based URLs
if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);
if (process.env.FRONTEND_DEPLOY_URL) allowedOrigins.push(process.env.FRONTEND_DEPLOY_URL);

console.log("Allowed Origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || vercelPreviewPattern.test(origin)) {
        return callback(null, true);
      }
      console.error("❌ CORS Blocked:", origin);
      return callback(new Error("CORS Error: Origin not allowed"));
    },
    credentials: true,
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.options("*", cors()); // Preflight for all routes

/* ---------------------------------------------------------
   Body Parsing & Static Files
------------------------------------------------------------ */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// IMPORTANT: Added file upload middleware here
// This makes req.files available in your controllers
app.use(fileupload({
  createParentPath: true
}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ---------------------------------------------------------
   MongoDB Connection
------------------------------------------------------------ */
const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  if (!MONGODB_URI) throw new Error("❌ MONGODB_URI not defined in .env");
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log("MongoDB Connected:", conn.connection.host);
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  }
};

/* ---------------------------------------------------------
   API Routes
------------------------------------------------------------ */
// Always verify the paths & controller exports match your files
// ... other middleware

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/institutes', require('./routes/institutes'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin')); // <-- This line correctly loads the admin routes
app.use('/api/courses', require('./routes/courses'));
app.use('/api/facilities', require('./routes/facilities'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/enquiries', require('./routes/enquiries'));

// ... rest of the file

/* ---------------------------------------------------------
   Health Check
------------------------------------------------------------ */
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    dbConnection: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    serverTime: new Date().toISOString(),
  });
});

/* ---------------------------------------------------------
   404 Handler
------------------------------------------------------------ */
app.use((req, res, next) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

/* ---------------------------------------------------------
   Global Error Handler (ENHANCED)
------------------------------------------------------------ */
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err.message);
  console.error(err.stack); // Log the full stack trace for debugging

  // Handle specific CORS errors
  if (err.message.includes("CORS")) {
    return res.status(403).json({ message: "CORS Error: Origin not allowed" });
  }

  // Handle Mongoose Validation Errors (e.g., required field missing)
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: 'Validation Error', errors: errors });
  }

  // Handle Mongoose CastErrors (e.g., invalid ObjectId format)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format.' });
  }
  
  // Handle duplicate key errors (e.g., unique email constraint)
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate field value entered.' });
  }

  // Default to 500 server error for anything else
  res.status(500).json({ error: err.message || "Server Error" });
});

/* ---------------------------------------------------------
   Start Server
------------------------------------------------------------ */
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});

module.exports = app;