const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true
  },
  topic: {
    type: mongoose. Schema.Types.ObjectId,
    ref: 'Topic',
    required: [true, 'Topic reference is required']
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
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'Lesson'
});

// Indexes
lessonSchema.index({ topic: 1 });
lessonSchema.index({ order: 1 });
lessonSchema.index({ isPublished: 1 });

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;