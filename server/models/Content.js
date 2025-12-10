const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  teacher: {
    type: mongoose. Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'Teacher is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
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
  type: {
    type: String,
    required: [true, 'Content type is required'],
    enum: {
      values: ['video', 'document', 'image'],
      message: 'Type must be video, file, or image'
    }
  },
  topic: {
    type: String,
    ref: 'Topic',
    required: [true, 'Topic is required']
  },
  lesson: {
    type: String,
    ref: 'Lesson',
    required: [true, 'Lesson is required']
  },
  course: {
    type: String,
    ref: 'Course',
    required: [true, 'Course is required']
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
  }
}, {
  timestamps: true,
  collection: 'Content'
});

// Indexes
contentSchema.index({ teacher: 1 });
contentSchema.index({ category: 1 });
contentSchema.index({ type: 1 });
contentSchema.index({ course: 1 });
contentSchema.index({ topic: 1 });
contentSchema.index({ lesson: 1 });
contentSchema. index({ status: 1 });
contentSchema.index({ difficulty: 1 });

const Content = mongoose.model('Content', contentSchema);

module.exports = Content;