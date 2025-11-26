const mongoose = require('mongoose');

const contentFeedbackSchema = new mongoose.Schema({
  content: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: [true, 'Content is required']
  },
  student: {
    type: mongoose.Schema.Types. ObjectId,
    ref: 'Student',
    required: [true, 'Student is required']
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    trim: true
  },
  liked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'ContentFeedback'
});

// Indexes
contentFeedbackSchema.index({ content: 1 });
contentFeedbackSchema.index({ student: 1 });
contentFeedbackSchema.index({ liked: 1 });

// One student can only give feedback once per content
contentFeedbackSchema.index({ content: 1, student: 1 }, { unique: true });

const ContentFeedback = mongoose.model('ContentFeedback', contentFeedbackSchema);

module.exports = ContentFeedback;