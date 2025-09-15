const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Admin: Create a new module
router.post('/modules', authenticate, authorize('admin'), courseController.createModule);

// Admin: Upload assets to a module
router.post(
	'/modules/:id/assets',
	authenticate,
	authorize('admin'),
	courseController.uploadAssets
);

// Users: Fetch all modules
router.get('/modules', authenticate, courseController.getModules);

// Users: Fetch module details and assets
router.get('/modules/:id', authenticate, courseController.getModuleById);


// Admin: Delete a module
router.delete('/modules/:id', authenticate, authorize('admin'), courseController.deleteModule);

// Admin: Update or archive a module
router.patch('/modules/:id', authenticate, authorize('admin'), courseController.updateModule);

// Admin: Publish a new version
router.post('/modules/:id/release', authenticate, authorize('admin'), courseController.releaseModule);

module.exports = router;
