const mongoose = require('mongoose');

const diagnosticQuestionSchema = new mongoose.Schema({
  // questionId removed, using default _id
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
  // Scoring only for section 1 and 3 (Preferences)
  scoring: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
    validate: {
      validator: function (v) {
        // Section 2 (Knowledge) generally shouldn't have scoring, it relies on Accuracy
        if (this.section === 2 && Object.keys(v || {}).length > 0) {
          return false;
        }
        return true;
      },
      message: 'Scoring is not allowed for Section 2'
    }
  },
  // Correct answer only for section 2 (Knowledge)
  correctAnswer: {
    type: Number,
    default: null,
    validate: {
      validator: function (v) {
        if (this.section !== 2 && v !== null && v !== undefined) {
          return false;
        }
        return true;
      },
      message: 'Correct answer is only allowed for Section 2'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  minimize: false
});

diagnosticQuestionSchema.index({ section: 1, order: 1 });
diagnosticQuestionSchema.index({ isActive: 1 });

const DiagnosticQuestion = mongoose.model('DiagnosticQuestion', diagnosticQuestionSchema, 'DiagnosticQuestion');

module.exports = DiagnosticQuestion;
