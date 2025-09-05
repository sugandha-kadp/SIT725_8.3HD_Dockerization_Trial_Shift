const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Generate JWT
function generateToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h"
  });
}

// Register (only jobseekers & employers)
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (role === "admin") {
      return res.status(403).json({ message: "You cannot register as admin" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = new User({ name, email, password, role });
    await user.save();

    const token = generateToken(user);
    res.status(201).json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = generateToken(user);
    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Example protected route
exports.dashboard = (req, res) => {
  res.json({ message: `Welcome ${req.user.role} ${req.user.id}` });
};

// Example admin-only route
exports.adminPanel = (req, res) => {
  res.json({ message: "Welcome Admin! This is the control panel." });
};
