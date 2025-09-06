const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// Protect these routes with authentication middleware (to be added later)
router.post('/jobs', jobController.createJob);
router.put('/jobs/:id', jobController.updateJob); // New route for updating

module.exports = router;