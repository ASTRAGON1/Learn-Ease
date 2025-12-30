const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const applicationController = require('../controllers/applicationController');

// POST /api/applications - Create application (for instructors)
router.post('/', auth(['teacher']), applicationController.createApplication);

// GET /api/applications - List all applications
router.get('/', applicationController.listApplications);

// GET /api/applications/:id - Get single application
router.get('/:id', applicationController.getApplication);

// POST /api/applications/decide/:id - Accept or decline application
router.post('/decide/:id', applicationController.decideApplication);

module.exports = router;
