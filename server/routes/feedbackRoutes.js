const express = require('express');
const router = express.Router();
const { Feedback } = require('../models');

// POST /api/feedback - Create a new feedback
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

    // Create feedback
    console.log('Creating feedback with data:', {
      userName: userName.trim(),
      topic: topic.trim(),
      description: description.trim()
    });
    
    const feedback = await Feedback.create({
      userName: userName.trim(),
      topic: topic.trim(),
      description: description.trim()
    });

    console.log('Feedback created successfully:', feedback);
    console.log('Feedback ID:', feedback._id);
    console.log('Feedback saved to collection:', feedback.collection.name);

    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/feedback - Get all feedback
router.get('/', async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .sort({ createdAt: -1 }); // Newest first

    res.json({
      success: true,
      count: feedback.length,
      data: feedback
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/feedback/:id - Get a single feedback by ID
router.get('/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ 
        success: false, 
        error: 'Feedback not found' 
      });
    }

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;

