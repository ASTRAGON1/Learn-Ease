const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/quizController');

router.get('/', auth(['teacher']), ctrl.getQuizzes);
router.post('/', auth(['teacher']), ctrl.createQuiz);
router.get('/student', auth(['student']), ctrl.getStudentQuizzes);
router.get('/published', auth(['student', 'teacher', 'admin']), ctrl.getPublishedQuizzes);
router.get('/:id', auth(['student', 'teacher', 'admin']), ctrl.getQuizById);
router.get('/:id/progress', auth(['student']), ctrl.getQuizProgress);
router.post('/progress', auth(['student']), ctrl.saveQuizProgress);
router.post('/:id/submit', auth(['student']), ctrl.submitQuiz);

// PATCH /api/quizzes/:id - Update quiz (for archiving)
router.patch('/:id', auth(['teacher']), ctrl.updateQuiz);

// DELETE /api/quizzes/:id - Delete quiz
router.delete('/:id', auth(['teacher']), ctrl.deleteQuiz);

module.exports = router;
