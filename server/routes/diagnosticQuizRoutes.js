const express = require('express');
const router = express.Router();
const diagnosticQuizController = require('../controllers/diagnosticQuizController');
const auth = require('../middleware/auth');

// GET /api/diagnostic-quiz/generate - Generate diagnostic quiz questions
router.get('/generate', diagnosticQuizController.generateDiagnosticQuiz);

// POST /api/diagnostic-quiz/submit - Submit diagnostic quiz results
router.post('/submit', auth(['student']), diagnosticQuizController.submitDiagnosticQuiz);

// GET /api/diagnostic-quiz/status - Check if student has completed diagnostic quiz
router.get('/status', auth(['student']), diagnosticQuizController.checkDiagnosticQuizStatus);

module.exports = router;

