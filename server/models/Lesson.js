const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: [true, 'Topic reference is required']
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course reference is required']
  },
  pathId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Path',
    required: [true, 'Path reference is required']
  },
  achievementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  },
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
  collection: 'Lesson'
});

// Indexes
lessonSchema.index({ topicId: 1 });
lessonSchema.index({ courseId: 1 });
lessonSchema.index({ pathId: 1 });
lessonSchema.index({ order: 1 });
lessonSchema.index({ achievementId: 1 });

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;