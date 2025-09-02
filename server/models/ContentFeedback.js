const mongoose = require('mongoose');
const ContentFeedbackSchema = new mongoose.Schema({
    contentId: String,
    studentId: String,
    rating: Number,
    comment: String,
    date: { type: Date, default: Date.now},
    isLiked: Boolean
});

module.exports = mongoose.model('contentFeedback', ContentFeedbackSchema, 'ContentFeedbacks');