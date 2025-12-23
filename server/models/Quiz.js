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
  // Path reference (required for proper inheritance)
  path: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Path',
    required: [true, 'Path is required']
  },
  // Course reference (required for proper inheritance)
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  // Topic reference (required for proper inheritance)
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: [true, 'Topic is required']
  },
  // Lesson reference (required for proper inheritance)
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: [true, 'Lesson is required']
  },
  difficulty: {
    type: String,
    enum: {
      values: ['Easy', 'Medium', 'Hard'],
      message: 'Difficulty must be Easy, Medium, or Hard'
    },
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['draft', 'published', 'archived'],
      message: 'Status must be draft, published, or archived'
    },
    default: 'draft'
  },
  previousStatus: {
    type: String,
    enum: {
      values: ['draft', 'published'],
      message: 'Previous status must be draft or published'
    },
    default: null
  },
  questionsAndAnswers: [{
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true
    },
    correctAnswer: {
      type: String,
      required: [true, 'Correct answer is required'],
      trim: true
    },
    wrongAnswers: {
      type: [String],
      default: []
    }
  }],
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  lastViewedAt: {
    type: Date,
    default: null
  },
  lastLikedAt: {
    type: Date,
    default: null
  },
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
quizSchema.index({ path: 1 });
quizSchema.index({ course: 1 });
quizSchema.index({ topic: 1 });
quizSchema.index({ lesson: 1 });
quizSchema.index({ status: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;