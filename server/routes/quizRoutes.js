const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/quizController');
const Quiz = require('../models/Quiz');

router.get('/', auth(['teacher']), ctrl.getQuizzes);
router.post('/', auth(['teacher']), ctrl.createQuiz);
router.get('/student', auth(['student']), ctrl.getStudentQuizzes);
router.get('/published', auth(['student', 'teacher', 'admin']), ctrl.getPublishedQuizzes);
router.get('/:id', auth(['student', 'teacher', 'admin']), ctrl.getQuizById);
router.get('/:id/progress', auth(['student']), ctrl.getQuizProgress);
router.post('/progress', auth(['student']), ctrl.saveQuizProgress);
router.post('/:id/submit', auth(['student']), ctrl.submitQuiz);

// PATCH /api/quizzes/:id - Update quiz (for archiving)
router.patch('/:id', auth(['teacher']), async (req, res) => {
  try {
    const allowed = ['title', 'status', 'category', 'topic', 'lesson', 'course', 'difficulty', 'previousStatus'];
    const update = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );

    const updated = await Quiz.findOneAndUpdate(
      { _id: req.params.id, teacher: req.user.sub },
      update,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Quiz not found or not yours' });
    }
    res.json({ data: updated });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update quiz' });
  }
});

// DELETE /api/quizzes/:id - Delete quiz
router.delete('/:id', auth(['teacher']), async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, teacher: req.user.sub });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found or not yours' });
    }

    // Delete from MongoDB
    await Quiz.deleteOne({ _id: req.params.id, teacher: req.user.sub });

    res.json({ message: 'Quiz deleted successfully' });
  } catch (e) {
    console.error('Error deleting quiz:', e);
    res.status(500).json({ error: 'Failed to delete quiz', message: e.message });
  }
});

module.exports = router;

