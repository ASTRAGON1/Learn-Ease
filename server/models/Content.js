const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'Teacher is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
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
  contentType: {
    type: String,
    required: [true, 'Content type is required'],
    enum: {
      values: ['video', 'document', 'image'],
      message: 'Content type must be video, document, or image'
    }
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  difficulty: {
    type: String,
    enum: {
      values: ['Easy', 'Medium', 'Hard'],
      message: 'Difficulty must be Easy, Medium, or Hard'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['draft', 'published', 'archived', 'deleted'],
      message: 'Status must be draft, published, archived, or deleted'
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
  deletedAt: {
    type: Date,
    default: null
  },
  fileURL: {
    type: String,
    required: [true, 'File URL is required']
  },
  firebaseUid: {
    type: String,
    trim: true
  },
  storagePath: {
    type: String,
    trim: true
  },
  fileType: {
    type: String,
    trim: true
  },
  size: {
    type: Number,
    min: 0
  },
  releaseDate: {
    type: Date,
    default: Date.now
  },
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

}, {
  timestamps: true,
  collection: 'Content'
});

// Indexes
contentSchema.index({ teacher: 1 });
contentSchema.index({ path: 1 });
contentSchema.index({ contentType: 1 });
contentSchema.index({ course: 1 });
contentSchema.index({ topic: 1 });
contentSchema.index({ lesson: 1 });
contentSchema.index({ status: 1 });
contentSchema.index({ difficulty: 1 });

const Content = mongoose.model('Content', contentSchema);

module.exports = Content;