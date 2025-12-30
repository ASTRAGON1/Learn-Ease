const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const reportController = require('../controllers/reportController');

// POST /api/reports - Create a new report
router.post('/', auth(), reportController.createReport);

// GET /api/reports - Get all reports
router.get('/', reportController.getAllReports);

// GET /api/reports/:id - Get a single report by ID
router.get('/:id', reportController.getReportById);

module.exports = router;

