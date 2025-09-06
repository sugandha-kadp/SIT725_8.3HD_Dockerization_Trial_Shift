const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// Protect this route with authentication middleware (to be added later)
router.post('/jobs', jobController.createJob);

module.exports = router;