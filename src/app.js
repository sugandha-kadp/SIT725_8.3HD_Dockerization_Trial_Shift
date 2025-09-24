require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "src/public"))); 
app.use(express.static(path.join(__dirname, "src/views/components")));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static("public"));


// Pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});
app.get("/job-post", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "job-post.html"));
});
app.get("/category-counts", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "category-counts.html"));
});

app.get("/job-preferences", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "job-preferences.html"));
});

// Optional: Course page (keep if you have views/courses.html)
app.get("/job-apply", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "/job-apply.html"));
});
app.get("/courses", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "courses.html"));
});
app.get("/job-edit", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "job-edit.html"));
});


// Admin-only manage courses page
const { authenticate, authorize } = require("./middleware/authMiddleware");
app.get("/courses/manage", authenticate, authorize('admin'), (req, res) => {
  res.sendFile(path.join(__dirname, "views", "courses.html"));
});

// API routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);
const jobRoutes = require("./routes/jobRoutes");
app.use("/api", jobRoutes);
const jobPreferenceRoutes = require("./routes/jobPreferenceRoutes");
app.use("/api/job-preferences", jobPreferenceRoutes);
const courseRoutes = require("./routes/courseRoutes");
app.use("/api/courses", courseRoutes);
app.use("/api/admin", require("./routes/adminUserRoutes"));
const studentRoutes = require("./routes/studentRoute");
app.use("/api/student", studentRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("MongoDB connected to:", mongoose.connection.db.databaseName);
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

