const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    required: true,
    trim: true,
    enum: ['trophy', 'star', 'medal', 'certificate', 'crown', 'badge', 'flag', 'rocket', 'target', 'fire', 'lightning', 'heart', 'book', 'graduation', 'award']
  },
  category: {
    type: String,
    required: true,
    enum: ['learning', 'progress', 'social', 'special', 'milestone'],
    default: 'learning'
  },
  points: {
    type: Number,
    required: true,
    min: 0,
    default: 10
  },
  requirement: {
    type: {
      type: String,
      enum: ['courses_completed', 'quizzes_passed', 'lessons_finished', 'study_hours', 'perfect_scores', 'streak_days', 'custom'],
      required: true
    },
    threshold: {
      type: Number,
      required: true,
      min: 1
    }
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    default: 'admin'
  }
}, {
  timestamps: true
});

// Index for faster queries
achievementSchema.index({ category: 1, isActive: 1 });
achievementSchema.index({ 'requirement.type': 1 });

const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = Achievement;
