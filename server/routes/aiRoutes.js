const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// POST /api/ai/chat - Chat with AI (streaming)
router.post('/chat', aiController.chat);

// POST /api/ai/chat/non-streaming - Chat with AI (non-streaming, for fallback)
router.post('/chat/non-streaming', aiController.chatNonStreaming);

// POST /api/ai/quiz/generate-wrong-answers - Generate wrong answers for quiz questions
router.post('/quiz/generate-wrong-answers', aiController.generateWrongAnswers);

// POST /api/ai/quiz/generate - Generate complete quiz with AI
router.post('/quiz/generate', aiController.generateQuiz);

// GET /api/ai/daily-tip - Generate daily teaching tip
router.get('/daily-tip', aiController.getDailyTip);

module.exports = router;
