const express = require('express');
const router = express.Router();
const controller = require('../controllers/quizTemplateController');

router.post('/create', controller.createTemplate);
router.get('/', controller.getAllTemplates);
router.get('/:id', controller.getTemplateById);

module.exports = router;
// Compare this snippet from server/controllers/quizResultController.js:
// const QuizResult = require('../models/QuizResult');