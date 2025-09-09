const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/userController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

// Public
router.post("/register", register);
router.post("/login", login);

// Protected Routes
router.get("/dashboard", authenticate, (req, res) => {
  res.json({ message: `Welcome ${req.user.name}, Role: ${req.user.role}` });
});

// Admin-only
router.get("/admin", authenticate, authorize("admin"), (req, res) => {
  res.json({ message: "Admin dashboard" });
});

// Employer-only
router.get("/employer", authenticate, authorize("employer"), (req, res) => {
  res.json({ message: "Employer dashboard" });
});

module.exports = router;
