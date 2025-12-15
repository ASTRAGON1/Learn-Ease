const express = require('express');
const router = express.Router();
const diagnosticTestController = require('../controllers/diagnosticTestController');
const auth = require('../middleware/auth');

// GET /api/diagnostic-quiz/generate - Get diagnostic quiz questions from MongoDB
router.get('/generate', diagnosticTestController.getQuestions);

// POST /api/diagnostic-quiz/submit - Submit diagnostic quiz results
router.post('/submit', auth(['student']), diagnosticTestController.submitQuiz);

// GET /api/diagnostic-quiz/status - Check if student has completed diagnostic quiz
router.get('/status', auth(['student']), diagnosticTestController.checkQuizStatus);

module.exports = router;

