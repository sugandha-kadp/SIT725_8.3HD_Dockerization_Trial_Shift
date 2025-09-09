const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Admin: Create a new module
router.post('/modules', authenticate, authorize('admin'), contentController.createModule);

// Admin: Upload assets to a module
router.post(
	'/modules/:id/assets',
	authenticate,
	authorize('admin'),
	contentController.uploadAssets
);

// Users: Fetch all modules
router.get('/modules', authenticate, contentController.getModules);

// Users: Fetch module details and assets
router.get('/modules/:id', authenticate, contentController.getModuleById);

// Admin: Update or archive a module
router.patch('/modules/:id', authenticate, authorize('admin'), contentController.updateModule);

// Admin: Publish a new version
router.post('/modules/:id/release', authenticate, authorize('admin'), contentController.releaseModule);

module.exports = router;
