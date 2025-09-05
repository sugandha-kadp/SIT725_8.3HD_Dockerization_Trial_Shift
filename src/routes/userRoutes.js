const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");

// Auth routes
router.post("/register", userController.register);
router.post("/login", userController.login);

// Protected routes
router.get("/dashboard", authMiddleware, userController.dashboard);

// Admin only
router.get("/admin", authMiddleware, roleMiddleware("admin"), userController.adminPanel);

module.exports = router;
