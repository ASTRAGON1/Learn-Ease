const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/quizController');

router.get('/', auth(['teacher']), ctrl.getQuizzes);
router.post('/', auth(['teacher']), ctrl.createQuiz);

module.exports = router;

