const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const feedbackController = require('../controllers/feedbackController');

// POST /api/feedback - Create a new feedback
router.post('/', feedbackController.createFeedback);

// GET /api/feedback - Get all feedback
router.get('/', feedbackController.getAllFeedback);

// GET /api/feedback/visible - Get only visible feedback (Public)
router.get('/visible', feedbackController.getVisibleFeedback);

// GET /api/feedback/:id - Get a single feedback by ID
router.get('/:id', feedbackController.getFeedbackById);

// PATCH /api/feedback/:id/toggle-show - Toggle show on home (Admin only)
router.patch('/:id/toggle-show', auth(), feedbackController.toggleShowStatus);

module.exports = router;
