// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

/* ---------------------------------------------
   🔥 FIXED CORS CONFIG (WORKS FOR RENDER + VERCEL)
---------------------------------------------- */

// Add ALL valid frontend URLs here:
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://edulist-frontend-aud9.vercel.app",
  "https://edulist-frontend-aud9-cecuyfl18-sushmitas-projects-64249a1d.vercel.app"
];

// Allow env URLs if defined
if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);
if (process.env.FRONTEND_DEPLOY_URL) allowedOrigins.push(process.env.FRONTEND_DEPLOY_URL);

console.log("Allowed origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow Postman / server-to-server / curl
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ CORS BLOCKED:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Required for preflight OPTIONS request
app.options("*", cors());


/* ---------------------------------------------
   Middleware / Parsers
---------------------------------------------- */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


/* ---------------------------------------------
   MongoDB Connect
---------------------------------------------- */
const MONGODB_URI = process.env.MONGODB_URI;
const connectDB = async () => {
  try {
    if (!MONGODB_URI) throw new Error("MONGODB_URI is missing!");

    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB Connection ERROR:", err);
    process.exit(1);
  }
};


/* ---------------------------------------------
   Routes
---------------------------------------------- */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/institutes", require("./routes/institutes"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/enquiries", require("./routes/enquiries"));
app.use("/api/facilities", require("./routes/facilities"));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/admin", require("./routes/admin"));


// Health Route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    env: process.env.NODE_ENV || "development",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});


// 404 Handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found", path: req.originalUrl });
});


// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err.message);

  if (err.message.includes("CORS")) {
    return res.status(403).json({ message: "CORS Error: Origin not allowed" });
  }

  res.status(500).json({ message: err.message || "Server Error" });
});


/* ---------------------------------------------
   Start Server
---------------------------------------------- */
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

module.exports = app;
