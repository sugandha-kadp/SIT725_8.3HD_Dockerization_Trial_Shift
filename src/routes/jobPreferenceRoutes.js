const express = require('express');
const router = express.Router();
const { auth, authorize } = require("../middleware/authMiddleware");
const jobPreferenceController = require('../controllers/jobPreferenceController');

router.use(auth); // protect everything below

router.get('/', jobPreferenceController.list);
router.post('/', jobPreferenceController.create);
router.put('/:id', jobPreferenceController.update);
router.delete('/:id', jobPreferenceController.remove);
router.delete('/', jobPreferenceController.bulkRemove);

module.exports = router;