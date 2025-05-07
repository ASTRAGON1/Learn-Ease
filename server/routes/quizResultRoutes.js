const express = require('express');
const router = express.Router();
const controller = require('../controllers/quizResultController');

router.post('/submit', controller.submitResult);
router.get('/student/:student_id', controller.getResultsByStudent);

module.exports = router;
// Compare this snippet from server/controllers/quizResultController.js:
// const QuizResult = require('../models/QuizResult');