const { Feedback } = require('../models');

// Create a new feedback
exports.createFeedback = async (req, res) => {
    try {
        const { userName, topic, description, rating } = req.body;

        // Validate required fields
        if (!userName || !topic || !description) {
            return res.status(400).json({
                success: false,
                error: 'userName, topic, and description are required'
            });
        }

        const feedback = await Feedback.create({
            userName,
            topic,
            description,
            rating: rating || 5
        });

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
};

// Get all feedback
exports.getAllFeedback = async (req, res) => {
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
};

// Get only visible feedback (for landing page)
exports.getVisibleFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find({ showOnHome: true })
            .sort({ createdAt: -1 })
            .limit(6); // Limit to 6 items for the landing page

        res.json({
            success: true,
            count: feedback.length,
            data: feedback
        });
    } catch (error) {
        console.error('Error fetching visible feedback:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get a single feedback by ID
exports.getFeedbackById = async (req, res) => {
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
};

// Toggle "Show on Home" status
exports.toggleShowStatus = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({
                success: false,
                error: 'Feedback not found'
            });
        }

        // Toggle the status
        feedback.showOnHome = !feedback.showOnHome;
        await feedback.save();

        res.json({
            success: true,
            data: feedback
        });
    } catch (error) {
        console.error('Error toggling feedback status:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
