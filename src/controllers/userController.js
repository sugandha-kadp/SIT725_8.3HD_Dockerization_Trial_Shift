const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, state } = req.body;

    // prevent admin registration from frontend
    if (role === "admin") {
      return res.status(403).json({ message: "Admin accounts cannot be self-registered" });
    }

    const user = new User({ name, email, password, role, state });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        state: user.state,
        profilePicture: user.profilePicture || null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user profile (only jobseekers & employers)
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") {
      return res.status(403).json({ message: "Admins cannot update profile" });
    }

    const { name, state } = req.body;
    if (name) user.name = name;
    if (state) user.state = state;

    // handle profile picture (if uploaded via multer)
    if (req.file) {
      user.profilePicture = `/uploads/${req.file.filename}`;
    }

    await user.save();
    res.json({ message: "Profile updated, pending admin approval", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete profile picture
exports.deleteProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") {
      return res.status(403).json({ message: "Admins cannot update profile" });
    }

    user.profilePicture = null;
    await user.save();

    res.json({ message: "Profile picture deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
