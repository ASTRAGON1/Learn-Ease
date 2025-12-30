const { Report } = require('../models');
const { createNotification } = require('./notificationController');

// Create a new report
exports.createReport = async (req, res) => {
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

        const report = await Report.create({
            userName: userName.trim(),
            topic: topic.trim(),
            description: description.trim()
        });

        console.log('Report created successfully:', report);

        // Notify the user who submitted the report
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
};

// Get all reports
exports.getAllReports = async (req, res) => {
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
};

// Get a single report by ID
exports.getReportById = async (req, res) => {
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
};
