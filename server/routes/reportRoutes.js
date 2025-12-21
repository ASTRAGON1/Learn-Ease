const express = require('express');
const router = express.Router();
const { Report } = require('../models');

const auth = require('../middleware/auth');
const { createNotification } = require('../controllers/notificationController');

// POST /api/reports - Create a new report
router.post('/', auth(), async (req, res) => {
  try {
    const { userName, topic, description } = req.body;
    const userId = req.user.sub;
    const userRole = req.user.role; // 'student' or 'teacher'

    // Validate required fields
    if (!userName || !topic || !description) {
      return res.status(400).json({
        success: false,
        error: 'userName, topic, and description are required'
      });
    }

    // Create report
    console.log('Creating report with data:', {
      userName: userName.trim(),
      topic: topic.trim(),
      description: description.trim()
    });

    // Determine user type for model name if we want to store it (Report model might not have user link)
    // But we want to notify the user "Report Received"

    const report = await Report.create({
      userName: userName.trim(),
      topic: topic.trim(),
      description: description.trim()
    });

    console.log('Report created successfully:', report);

    // Notify the user who submitted the report
    // We need to know if it's a Student or Teacher. 
    // Assuming the auth token role is 'student' or 'teacher' (lowercase).
    // The Notification model expects 'Student' or 'Teacher' (Capitalized).
    const recipientModel = userRole.charAt(0).toUpperCase() + userRole.slice(1);

    if (['Student', 'Teacher'].includes(recipientModel)) {
      await createNotification({
        recipient: userId,
        recipientModel: recipientModel,
        message: 'We have received your report and will review it shortly.',
        type: 'report'
      });
    }

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/reports - Get all reports
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ createdAt: -1 }); // Newest first

    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/reports/:id - Get a single report by ID
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

