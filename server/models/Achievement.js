const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['course', 'extra'],
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  course: {
    type: String,
    required: true,
    trim: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  badge: {
    type: String,
    required: true,
    enum: ['platinum', 'gold', 'silver'],
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Core Course', 'Extra Course'],
    trim: true
  }
}, {
  timestamps: true,
  collection: 'Achievements'
});

// Index for faster queries
// Note: title already has unique: true which creates an index, so we don't need to add it again
achievementSchema.index({ type: 1 });
achievementSchema.index({ category: 1 });
achievementSchema.index({ badge: 1 });

const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = Achievement;
