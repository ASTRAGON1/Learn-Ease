const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  pathId: {
    type: String,
    ref: 'Path',
    required: [true, 'Path reference is required']
  },
  topics: [{
    type: String,
    ref: 'Topic'
  }],
  order: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'Course',
  _id: false
});

// Indexes
courseSchema.index({ pathId: 1 });
courseSchema. index({ order: 1 });
courseSchema.index({ isPublished: 1 });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;