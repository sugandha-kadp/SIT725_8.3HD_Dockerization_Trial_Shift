const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// Protect these routes with authentication middleware (to be added later)
router.post('/jobs', jobController.createJob);
router.put('/jobs/:id', jobController.updateJob);
router.delete('/jobs/:id', jobController.deleteJob); // New route for deleting

module.exports = router;