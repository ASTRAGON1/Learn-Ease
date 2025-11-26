const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'Teacher is required']
  },
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['autism', 'downSyndrome'],
      message: 'Category must be either autism or downSyndrome'
    }
  },
  topic: {
    type: String,
    ref: 'Topic',
    required: [true, 'Topic is required']
  },
  course: {
    type: String,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  lesson: {
    type: String,
    ref: 'Lesson',
    required: [true, 'Lesson is required']
  },
  status: {
    type: String,
    enum: {
      values: ['draft', 'published', 'archived'],
      message: 'Status must be draft, published, or archived'
    },
    default: 'draft'
  },
  questionsAndAnswers: [{
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true
    },
    options: [{
      type: String,
      required: true
    }],
    correctAnswer: {
      type: String,
      required: [true, 'Correct answer is required']
    }
  }],
  releaseDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'Quiz'
});

// Indexes for faster queries
quizSchema.index({ teacher: 1 });
quizSchema.index({ category: 1 });
quizSchema.index({ course: 1 });
quizSchema.index({ lesson: 1 });
quizSchema.index({ status: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;