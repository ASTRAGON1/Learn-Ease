const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: false
  },
  topics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  }],
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'Course'
});

// Indexes for queries
courseSchema.index({ teacher: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ difficulty: 1 });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;