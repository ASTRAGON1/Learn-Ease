const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Topic title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
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
  lessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'Topic'
});

// Indexes
topicSchema.index({ courseId: 1 });
topicSchema.index({ pathId: 1 });
topicSchema.index({ order: 1 });

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;