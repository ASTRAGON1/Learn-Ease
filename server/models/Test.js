const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student is required'],
    index: true
  },
  // Section 1 answers (array of answer indices)
  section1: {
    type: [Number],
    required: [true, 'Section 1 answers are required'],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0 && v.every(answer => typeof answer === 'number' && answer >= 0);
      },
      message: 'Section 1 must be an array of non-negative numbers'
    }
  },
  // Section 2 answers (array of answer indices)
  section2: {
    type: [Number],
    required: [true, 'Section 2 answers are required'],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0 && v.every(answer => typeof answer === 'number' && answer >= 0);
      },
      message: 'Section 2 must be an array of non-negative numbers'
    }
  },
  // Section 3 answers (array of answer indices)
  section3: {
    type: [Number],
    required: [true, 'Section 3 answers are required'],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0 && v.every(answer => typeof answer === 'number' && answer >= 0);
      },
      message: 'Section 3 must be an array of non-negative numbers'
    }
  },
  // Analysis scores
  autismScore: {
    type: Number,
    default: 0
  },
  downSyndromeScore: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  // Determined student type based on test results
  determinedType: {
    type: String,
    enum: ['autism', 'downSyndrome'],
    required: true
  },
  // Completion timestamp
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'Test'
});

// Index for faster queries
testSchema.index({ student: 1, completedAt: -1 });
testSchema.index({ completedAt: -1 });

// Virtual to get total questions answered
testSchema.virtual('totalQuestions').get(function() {
  return this.section1.length + this.section2.length + this.section3.length;
});

// Method to get all answers as a single object
testSchema.methods.getAllAnswers = function() {
  return {
    section1: this.section1,
    section2: this.section2,
    section3: this.section3
  };
};

const Test = mongoose.model('Test', testSchema);

module.exports = Test;
