const mongoose = require('mongoose');

const jobPreferenceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    preferredLocation: { type: String, required: true, trim: true },
    preferredCategories: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobPreference', jobPreferenceSchema);