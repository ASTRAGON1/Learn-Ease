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
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['autism', 'downSyndrome']
  },
  type: {
    type: String,
    required: [true, 'Content type is required'],
    enum: ['video', 'file', 'audio', 'image']
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
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
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
  kind: {
    type: String,
    trim: true
  },
  releaseDate: {
    type: Date,
    default: Date.now
  },
  views: {
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
contentSchema.index({ lesson: 1 });
contentSchema.index({ status: 1 });

const Content = mongoose.model('Content', contentSchema);

module.exports = Content;