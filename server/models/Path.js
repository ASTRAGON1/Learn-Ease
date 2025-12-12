const mongoose = require('mongoose');

const pathSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Path type is required'],
    enum: {
      values: ['autism', 'downSyndrome'],
      message: 'Type must be either autism or downSyndrome'
    }
  },
  title: {
    type: String,
    required: [true, 'Path title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  estimatedDuration: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'Path'
});

// Indexes
pathSchema.index({ type: 1 });
pathSchema.index({ isPublished: 1 });

const Path = mongoose.model('Path', pathSchema);

module.exports = Path;