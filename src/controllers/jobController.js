const Job = require('../models/job');
const Category = require('../models/category');

// Create a new job
exports.createJob = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { title, category, location, shiftDetails } = req.body;
    const employerId = '12345'; // Temporary placeholder ID

    if (!title || !category || !location || !shiftDetails) {
      throw new Error('All fields (title, category, location, shiftDetails) are required');
    }

    let categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      categoryDoc = await Category.create({ name: category });
    }

    const job = new Job({
      title,
      category: categoryDoc._id,
      location,
      shiftDetails,
      employerId
    });

    const savedJob = await job.save();
    console.log('Job saved:', savedJob);
    res.status(201).json(savedJob);
  } catch (error) {
    console.error('Error creating job:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// Update an existing job
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, location, shiftDetails } = req.body;
    const employerId = '12345'; // Temporary placeholder ID

    let categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc && category) {
      categoryDoc = await Category.create({ name: category });
    }

    const job = await Job.findOneAndUpdate(
      { _id: id, employerId },
      { title, category: categoryDoc ? categoryDoc._id : undefined, location, shiftDetails, employerId },
      { new: true, runValidators: true, useFindAndModify: false }
    );

    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    console.log('Job updated:', job);
    res.status(200).json(job);
  } catch (error) {
    console.error('Error updating job:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// Delete an existing job
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
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

// Bulk delete jobs
exports.bulkDeleteJobs = async (req, res) => {
  try {
    const { jobIds } = req.body; // Array of job IDs to delete
    const employerId = '12345'; // Temporary placeholder ID

    if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
      throw new Error('Job IDs array is required');
    }

    const result = await Job.deleteMany({ _id: { $in: jobIds }, employerId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No jobs found or unauthorized to delete' });
    }

    console.log('Bulk delete result:', result);
    res.status(200).json({ message: `${result.deletedCount} job(s) deleted successfully` });
  } catch (error) {
    console.error('Error bulk deleting jobs:', error.message);
    res.status(400).json({ message: error.message });
  }
};