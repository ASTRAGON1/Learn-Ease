const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const achievementController = require('../controllers/achievementController');
const diagnosticTestController = require('../controllers/diagnosticTestController');

// Auth and User Management
router.post('/login', adminController.login);
router.get('/users', adminController.getUsers);
router.get('/student-profiles', adminController.getStudentProfiles);
router.get('/instructor-profiles', adminController.getInstructorProfiles);
router.post('/users/cleanup-inactive', adminController.cleanupInactiveUsers);

router.patch('/users/:id/suspend', adminController.suspendUser);
router.patch('/users/:id/reinstate', adminController.reinstateUser);
router.delete('/users/:id', adminController.deleteUser);

// Teacher Content & Analytics
router.get('/teacher/:email/content', adminController.getTeacherContent);
router.get('/teacher/:email/quizzes', adminController.getTeacherQuizzes);
router.get('/teacher/:email/quiz-results', adminController.getTeacherQuizResults);
router.get('/teacher/:email/weekly-metrics', adminController.getWeeklyMetrics);
router.get('/teacher/:email/deleted-content', adminController.getDeletedContent);
router.get('/teacher/:email/deleted-quizzes', adminController.getDeletedQuizzes);

// Learning Paths
router.get('/learning-paths', adminController.getLearningPaths);
router.post('/learning-paths', adminController.createLearningPath);
router.delete('/learning-paths/:pathId', adminController.deleteLearningPath);
router.post('/learning-paths/bulk-import', adminController.bulkImportLearningPaths);

// Courses
router.post('/learning-paths/:pathId/courses', adminController.createCourse);
router.put('/learning-paths/:pathId/courses/:courseId', adminController.renameCourse);
router.delete('/learning-paths/:pathId/courses/:courseId', adminController.deleteCourse);

// Topics
router.post('/learning-paths/:pathId/courses/:courseId/topics', adminController.createTopic);
router.put('/learning-paths/:pathId/courses/:courseId/topics/:topicId', adminController.renameTopic);
router.delete('/learning-paths/:pathId/courses/:courseId/topics/:topicId', adminController.deleteTopic);

// Lessons
router.post('/learning-paths/:pathId/courses/:courseId/topics/:topicId/lessons', adminController.createLesson);
router.put('/learning-paths/:pathId/courses/:courseId/topics/:topicId/lessons/:lessonId', adminController.renameLesson);
router.delete('/learning-paths/:pathId/courses/:courseId/topics/:topicId/lessons/:lessonId', adminController.deleteLesson);

// Achievements (Using separate achievementController)
router.get('/achievements', achievementController.getAchievements);
router.post('/achievements', achievementController.createAchievement);
router.put('/achievements/:id', achievementController.updateAchievement);
router.delete('/achievements/:id', achievementController.deleteAchievement);

// Diagnostic Questions (Using separate diagnosticTestController)
router.get('/diagnostic-questions', diagnosticTestController.getAllQuestionsForAdmin);
router.post('/diagnostic-questions', diagnosticTestController.createQuestion);
router.put('/diagnostic-questions/:id', diagnosticTestController.updateQuestion);
router.delete('/diagnostic-questions/:id', diagnosticTestController.deleteQuestion);
router.patch('/diagnostic-questions/:id/toggle-status', diagnosticTestController.toggleQuestionStatus);

module.exports = router;
