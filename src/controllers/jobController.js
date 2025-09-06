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