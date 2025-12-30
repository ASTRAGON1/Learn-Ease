const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireDiagnosticQuiz = require('../middleware/requireDiagnosticQuiz');
const studentAuthController = require('../controllers/studentAuthController');

// GET /api/students/auth/check-email/:email
router.get('/auth/check-email/:email', studentAuthController.checkEmail);

// POST /api/students/auth/register
router.post('/auth/register', studentAuthController.register);

// POST /api/students/auth/login
router.post('/auth/login', studentAuthController.login);

// GET /api/students/auth/me - requires diagnostic quiz
router.get('/auth/me', auth(['student']), requireDiagnosticQuiz, studentAuthController.getMe);

// POST /api/students/auth/logout
router.post('/auth/logout', auth(['student']), studentAuthController.logout);

// POST /api/students/auth/activity
router.post('/auth/activity', auth(['student']), studentAuthController.updateActivity);

// GET /api/students/progress
router.get('/progress', auth(['student']), requireDiagnosticQuiz, studentAuthController.getProgress);

// POST /api/students/complete-course
router.post('/complete-course', auth(['student']), studentAuthController.completeCourse);

// GET /api/students/achievements
router.get('/achievements', auth(['student']), requireDiagnosticQuiz, studentAuthController.getAchievements);

// PUT /api/students/profile-picture
router.put('/profile-picture', auth(['student']), studentAuthController.updateProfilePicture);

// PUT /api/students/change-password
router.put('/change-password', auth(['student']), studentAuthController.changePassword);

// POST /api/students/track-time
router.post('/track-time', auth(['student']), studentAuthController.trackTime);

// POST /api/students/retake-lesson
router.post('/retake-lesson', auth(['student']), studentAuthController.retakeLesson);

// POST /api/students/complete-lesson
router.post('/complete-lesson', auth(['student']), studentAuthController.completeLesson);

// POST /api/students/content/:id/like
router.post('/content/:id/like', studentAuthController.likeContent);

// POST /api/students/content/:id/view
router.post('/content/:id/view', studentAuthController.viewContent);

module.exports = router;
