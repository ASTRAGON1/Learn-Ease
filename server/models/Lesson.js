const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  topicId: {
    type: String,
    ref: 'Topic',
    required: [true, 'Topic reference is required']
  },
  courseId: {
    type: String,
    ref: 'Course',
    required: [true, 'Course reference is required']
  },
  pathId: {
    type: String,
    ref: 'Path',
    required: [true, 'Path reference is required']
  },
  content: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content'
  }],
  order: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'Lesson',
  _id: false
});

// Indexes
lessonSchema.index({ topicId: 1 });
lessonSchema.index({ courseId: 1 });
lessonSchema.index({ pathId: 1 });
lessonSchema.index({ order: 1 });

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;