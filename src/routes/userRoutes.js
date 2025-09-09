const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const User = require("../models/User");
const { register, login } = require("../controllers/userController");
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
router.get("/profile", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to load profile." });
  }
});

// Update profile (requires admin approval)
router.put("/profile", authenticate, upload.single("profileImage"), async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res.status(403).json({ message: "Admins cannot update profile." });
    }

    const updates = {
      name: req.body.name,
      state: req.body.state,
      profilePic: req.file ? "/uploads/" + req.file.filename : undefined
    };

    await User.findByIdAndUpdate(req.user.id, { pendingApproval: updates });

    res.json({ message: "Profile update submitted for admin approval." });
  } catch (err) {
    res.status(500).json({ message: "Update failed." });
  }
});

// Delete profile picture
router.delete("/profile/picture", authenticate, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res.status(403).json({ message: "Admins cannot update profile." });
    }

    await User.findByIdAndUpdate(req.user.id, { $unset: { profilePic: "" } });

    res.json({ message: "Profile picture deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete picture." });
  }
});

module.exports = router;
