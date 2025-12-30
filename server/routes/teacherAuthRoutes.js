const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const teacherAuthController = require('../controllers/teacherAuthController');

// POST /api/teachers/auth/register
router.post('/auth/register', teacherAuthController.register);

// POST /api/teachers/auth/login
router.post('/auth/login', teacherAuthController.login);

// GET /api/teachers/auth/me
router.get('/auth/me', auth(['teacher']), teacherAuthController.getMe);

// POST /api/teachers/auth/logout - Mark teacher as offline
router.post('/auth/logout', auth(['teacher']), teacherAuthController.logout);

// POST /api/teachers/auth/activity - Update last activity timestamp
router.post('/auth/activity', auth(['teacher']), teacherAuthController.updateActivity);

module.exports = router;
