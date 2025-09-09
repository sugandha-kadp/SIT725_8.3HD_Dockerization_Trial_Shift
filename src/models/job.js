const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  shiftDetails: { type: String, required: true },
  employerId: { type: String, required: true }, // Temporary change to string
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);