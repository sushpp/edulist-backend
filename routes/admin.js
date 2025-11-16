const express = require("express");
const router = express.Router();

const {
  dashboard,
  getPendingInstitutes,
  verifyInstitute,
  listUsers,
} = require("../controllers/adminController");

const { auth, adminAuth } = require("../middleware/auth");

// Dashboard analytics
router.get("/dashboard", auth, adminAuth, dashboard);

// Pending Institutes
router.get("/institutes/pending", auth, adminAuth, getPendingInstitutes);
router.put("/institutes/verify/:id", auth, adminAuth, verifyInstitute);

// User list
router.get("/users", auth, adminAuth, listUsers);

module.exports = router;
