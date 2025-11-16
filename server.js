const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

/* ---------------------------------------------------------
   CORS Configuration — Fix Preflight & Vercel URLs
------------------------------------------------------------ */
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://edulist-frontend-aud9.vercel.app",
  "https://edulist-frontend-aud9-bqzo09krp-sushmitas-projects-64249a1d.vercel.app",
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
      if (!origin || allowedOrigins.includes(origin) || vercelPreviewPattern.test(origin)) {
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
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

/* ---------------------------------------------------------
   Global Error Handler
------------------------------------------------------------ */
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err.message);
  if (err.message.includes("CORS")) {
    return res.status(403).json({ message: "CORS Error: Origin not allowed" });
  }
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
