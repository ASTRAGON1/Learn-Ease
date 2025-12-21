const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'recipientModel'
    },
    recipientModel: {
        type: String,
        required: true,
        enum: ['Teacher', 'Student']
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['upload', 'likes', 'approved', 'views', 'report', 'feedback', 'system', 'quiz_completed', 'suspended', 'other'],
        default: 'system'
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'Notifications'
});

module.exports = mongoose.model('Notification', notificationSchema);
