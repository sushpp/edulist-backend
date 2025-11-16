const jwt = require("jsonwebtoken");
const User = require("../models/User");

// General Authentication – verifies token and stores user in req.user
exports.auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "edulist_secret_key_2024"
    );

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid token: user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    return res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

// Role-based Authentication for admin
exports.adminAuth = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access only" });
  }
  next();
};

// Role-based Authentication for institute
exports.instituteAuth = (req, res, next) => {
  if (req.user?.role !== "institute") {
    return res.status(403).json({ success: false, message: "Institute access only" });
  }
  next();
};
