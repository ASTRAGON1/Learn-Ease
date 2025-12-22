const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'Quiz reference is required']
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student reference is required']
  },
  grade: {
    type: Number,
    min: [0, 'Grade cannot be negative'],
    max: [100, 'Grade cannot exceed 100'],
    default: null
  },
  status: {
    type: String,
    enum: ['completed', 'paused', 'in-progress'],
    default: 'in-progress'
  },
  answers: {
    type: Map,
    of: String,
    default: {}
  },
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
  releaseDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'QuizResult'
});

// Indexes for faster queries
quizResultSchema.index({ quiz: 1, student: 1 });
quizResultSchema.index({ student: 1 });
quizResultSchema.index({ status: 1 });

const QuizResult = mongoose.model('QuizResult', quizResultSchema);

module.exports = QuizResult;