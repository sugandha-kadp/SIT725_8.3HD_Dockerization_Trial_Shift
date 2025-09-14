const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { register, login, getProfile, updateProfile, deleteProfilePicture } = require("../controllers/userController");
const adminController = require("../controllers/adminController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

// Multer config for profile image
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

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

// ======================
//  Profile Management
// ======================

// Get profile
router.get("/profile", authenticate, getProfile);

// Update profile (requires admin approval)
router.put("/profile", authenticate, upload.single("profileImage"), updateProfile);

// Delete profile picture
router.delete("/profile/picture", authenticate, deleteProfilePicture);

// ======================
//  Admin Management
// ======================

// Profile requests
router.get("/profile-requests", authenticate, authorize("admin"), adminController.getPendingProfileRequests);
router.post("/profile-requests/:id/approve", authenticate, authorize("admin"), adminController.approveProfileUpdate);
router.post("/profile-requests/:id/decline", authenticate, authorize("admin"), adminController.declineProfileUpdate);

module.exports = router;
