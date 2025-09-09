const Job = require('../models/job');

// Create a new job
exports.createJob = async (req, res) => {
  try {
    console.log('Request body:', req.body); // Log the incoming data
    const { title, category, location, shiftDetails } = req.body;
    const employerId = '12345'; // Temporary placeholder ID for testing

    if (!title || !category || !location || !shiftDetails) {
      throw new Error('All fields (title, category, location, shiftDetails) are required');
    }

    const job = new Job({
      title,
      category,
      location,
      shiftDetails,
      employerId
    });

    const savedJob = await job.save();
    res.status(201).json(savedJob);
  } catch (error) {
    console.error('Error creating job:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// Update an existing job
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params; // Job ID from the URL
    const { title, category, location, shiftDetails } = req.body;
    const employerId = '12345'; // Temporary placeholder ID

    const job = await Job.findOneAndUpdate(
      { _id: id, employerId }, // Find job by ID and employerId
      { title, category, location, shiftDetails, employerId },
      { new: true, runValidators: true } // Return the updated document and run validation
    );

    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    res.status(200).json(job);
  } catch (error) {
    console.error('Error updating job:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// Delete an existing job
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params; // Job ID from the URL
    const employerId = '12345'; // Temporary placeholder ID

    const job = await Job.findOneAndDelete({ _id: id, employerId });

    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    console.log('Job deleted:', job);
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error.message);
    res.status(400).json({ message: error.message });
  }
};