const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const teacherController = require('../controllers/teacherController');

// PATCH /api/teachers/me  — update profile
router.patch('/me', auth(['teacher']), teacherController.updateProfile);

// GET /api/teachers/me/uploads — list my uploaded content
router.get('/me/uploads', auth(['teacher']), teacherController.getMyUploads);

// PATCH /api/teachers/me/password — change password
router.patch('/me/password', auth(['teacher']), teacherController.changePassword);

// DELETE /api/teachers/me — delete account
router.delete('/me', auth(['teacher']), teacherController.deleteAccount);

// GET /api/teachers/ranking — get all instructors ranked by total likes
router.get('/ranking', teacherController.getRanking);

// GET /api/teachers/:id — public teacher profile
router.get('/:id', teacherController.getPublicProfile);

module.exports = router;
