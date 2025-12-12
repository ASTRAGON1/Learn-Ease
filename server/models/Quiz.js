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
  // IDs for proper linking to curriculum structure
  pathId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Path'
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
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
quizSchema.index({ pathId: 1 });
quizSchema.index({ courseId: 1 });
quizSchema.index({ topicId: 1 });
quizSchema.index({ lessonId: 1 });
quizSchema.index({ status: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;