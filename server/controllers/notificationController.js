const { Notification } = require('../models');

// Get all notifications for the authenticated user
exports.getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.sub; // Auth middleware sets sub, not id
        const userRole = req.user.role || (req.user.userType === 'student' ? 'Student' : 'Teacher');

        // Ensure properly capitalized model name
        const modelName = userRole === 'student' || userRole === 'Student' ? 'Student' : 'Teacher';

        const notifications = await Notification.find({
            recipient: userId,
            recipientModel: modelName
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Mark a single notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(
            id,
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Mark all notifications for user as read
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.sub;
        const userRole = req.user.role || (req.user.userType === 'student' ? 'Student' : 'Teacher');
        const modelName = userRole === 'student' || userRole === 'Student' ? 'Student' : 'Teacher';

        await Notification.updateMany(
            { recipient: userId, recipientModel: modelName, read: false },
            { read: true }
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndDelete(id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Internal helper to create notification
exports.createNotification = async ({ recipient, recipientModel, message, type }) => {
    try {
        const notification = await Notification.create({
            recipient,
            recipientModel,
            message,
            type
        });
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        // Don't throw, just log error so main flow doesn't break
        return null;
    }
};
