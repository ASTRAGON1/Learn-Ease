const mongoose = require('mongoose');

const pathSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Path title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true
  },
  courses: [{
    type: mongoose. Schema.Types.ObjectId,
    ref: 'Course'
  }],
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  estimatedDuration: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'Path'
});

// Indexes
pathSchema.index({ difficulty: 1 });
pathSchema.index({ isPublished: 1 });

const Path = mongoose.model('Path', pathSchema);

module.exports = Path;