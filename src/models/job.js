const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  applicantName: { type: String, required: true },
  coverLetter: { type: String, required: true },
  appliedAt: { type: Date, default: Date.now }
});

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, // Reference to Category
  location: { type: String, required: true },
  shiftDetails: { type: String, required: true },
  employerId: { type: String, required: true }, // Temporary string, to be updated with authentication
  createdAt: { type: Date, default: Date.now },
  applications: [applicationSchema] // Array of applications
});

module.exports = mongoose.model('Job', jobSchema);