const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Topic title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
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
  lessons: [{
    type: String,
    ref: 'Lesson'
  }],
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'Topic',
  _id: false
});

// Indexes
topicSchema.index({ courseId: 1 });
topicSchema. index({ pathId: 1 });
topicSchema.index({ order: 1 });

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;