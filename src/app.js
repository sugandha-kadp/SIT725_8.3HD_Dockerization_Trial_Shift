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

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "/login.html"));
});

const userRoutes = require("./routes/userRoutes");
app.use("/", userRoutes);

// Add job-post route
app.get("/job-post", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "/job-post.html"));
});

const jobRoutes = require("./routes/jobRoutes");
app.use("/api", jobRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "trial_shift" // Explicitly set the database name
})
  .then(() => {
    console.log("MongoDB connected to:", mongoose.connection.db.databaseName);
  })
  .catch(err => console.error("MongoDB connection error:", err));

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});