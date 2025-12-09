const express = require('express');
const router = express.Router();
const { Report } = require('../models');

// POST /api/reports - Create a new report
router.post('/', async (req, res) => {
  try {
    const { userName, topic, description } = req.body;

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
    
    const report = await Report.create({
      userName: userName.trim(),
      topic: topic.trim(),
      description: description.trim()
    });

    console.log('Report created successfully:', report);
    console.log('Report ID:', report._id);
    console.log('Report saved to collection:', report.collection.name);

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

