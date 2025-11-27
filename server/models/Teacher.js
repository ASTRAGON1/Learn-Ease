const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  headline: {
    type: String,
    maxlength: [200, 'Headline cannot exceed 200 characters']
  },
  cv: {
    type: String,
    default: ''
  },
  profilePic: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    trim: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  ranking: {
    type: Number,
    default: 0,
    min: [0, 'Ranking cannot be negative']
  },
  dateStarted: {
    type: Date,
    default: Date.now
  },
  userStatus: {
    type: String,
    enum: {
      values: ['active', 'inactive'],
      message: 'Status must be either active or inactive'
    },
    default: 'active'
  },
  suspended: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'Teacher'
});

// Indexes for faster queries
teacherSchema.index({ ranking: -1 });

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;