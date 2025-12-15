const mongoose = require('mongoose');

const diagnosticQuestionSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  section: {
    type: Number,
    required: true,
    enum: [1, 2, 3],
    index: true
  },
  order: {
    type: Number,
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true
  }],
  // Scoring structure: { autism: { "0": 2, "1": 1 }, downSyndrome: { "0": 1 } }
  // or empty object {} for section 2 questions
  scoring: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  correctAnswer: {
    type: Number,
    default: null // null for subjective questions, number for section 2 questions
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
  timestamps: true,
  minimize: false // Prevents Mongoose from removing empty objects
});

// Compound index for section and order
diagnosticQuestionSchema.index({ section: 1, order: 1 });
diagnosticQuestionSchema.index({ isActive: 1 });

// Explicitly set collection name to match MongoDB
const DiagnosticQuestion = mongoose.model('DiagnosticQuestion', diagnosticQuestionSchema, 'DiagnosticQuestion');

module.exports = DiagnosticQuestion;
