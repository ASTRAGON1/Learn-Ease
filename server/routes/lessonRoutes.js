const express = require('express');
const router = express. Router();
const {
  createLesson,
  getAllLessons,
  getLessonById,
  updateLesson,
  deleteLesson
} = require('../controllers/lessonController');

// Lesson routes
router.post('/', createLesson);           // Create new lesson
router.get('/', getAllLessons);           // Get all lessons
router.get('/:id', getLessonById);        // Get lesson by ID
router.put('/:id', updateLesson);         // Update lesson
router.delete('/:id', deleteLesson);      // Delete lesson

module.exports = router;